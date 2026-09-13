/**
 * Shared Gemini API client.
 * Intelligent API Key Pooling with LRU (Least Recently Used) Rotation.
 * Uses the official @google/genai SDK with gemini-3.7-flash.
 *
 * Keys are read from GOOGLE_API_KEYS env var as a comma-separated list.
 * Format: email:key,email:key,...
 * Example: user@gmail.com:AIzaSy...,user2@gmail.com:AIzaSy...
 *
 * Falls back to the legacy GOOGLE_API_KEY if GOOGLE_API_KEYS is not set.
 */

import { GoogleGenAI, type GenerateContentParameters } from '@google/genai';

const PRIMARY_MODEL = 'gemini-3.6-flash';
const FALLBACK_MODELS = ['gemini-3.7-flash', 'gemini-3.8-flash'];
const ALL_MODELS = [PRIMARY_MODEL, ...FALLBACK_MODELS];

// Blacklist dead or unauthenticated keys in memory so they never waste request time
const deadKeys = new Set<string>();

// Parse keys into an array of { email, key, client } objects
const rawKeys = (process.env.GOOGLE_API_KEYS || process.env.GOOGLE_API_KEY || '').split(',');

const API_KEYS = rawKeys
  .map(k => k.trim())
  .filter(k => k.length > 0)
  .map(k => {
    const colonIndex = k.indexOf(':');
    if (colonIndex > 0 && colonIndex < k.length - 1) {
      const email = k.slice(0, colonIndex).trim();
      const key   = k.slice(colonIndex + 1).trim();
      return { email, key, client: new GoogleGenAI({ apiKey: key }) };
    }
    return { email: 'unknown_account', key: k, client: new GoogleGenAI({ apiKey: k }) };
  });

if (API_KEYS.length === 0) {
  console.warn('[gemini] ⚠️  GOOGLE_API_KEYS is missing. All AI calls will fail.');
} else {
  console.log(`[gemini] 🚀 Initialized LRU API Pool with ${API_KEYS.length} key(s). Primary model: ${PRIMARY_MODEL}.`);
}

// Track the last time each key was used (ms) to maximize cooldowns
const lastUsedTimes = new Array(API_KEYS.length).fill(0);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Call the Gemini API with the given payload using the LRU key pool and model fallback.
 * Automatically retries across keys and models, and handles 503 spikes gracefully.
 *
 * @param bodyPayload - The full request body (contents, systemInstruction, generationConfig, etc.)
 * @returns The raw Gemini API response object.
 */
export const callGemini = async (bodyPayload: Record<string, unknown>): Promise<unknown> => {
  if (API_KEYS.length === 0) {
    throw new Error('No GOOGLE_API_KEYS configured on the server.');
  }

  let lastError: unknown;
  // 3 passes: first normal, then after a short backoff, then one final pass
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    for (const model of ALL_MODELS) {
      // Sort indices by LRU — pick active keys only, sorted by longest resting
      let sortedIndices = API_KEYS
        .map((_, i) => i)
        .filter(i => !deadKeys.has(API_KEYS[i].email))
        .sort((a, b) => lastUsedTimes[a] - lastUsedTimes[b]);

      if (sortedIndices.length === 0) {
        // Reset dead keys if all were marked dead, to give them another chance
        deadKeys.clear();
        sortedIndices = API_KEYS.map((_, i) => i);
      }

      let allOverloaded = true; // Assume overloaded until a key succeeds or fails with non-503

      for (const keyIndex of sortedIndices) {
        const { email, client } = API_KEYS[keyIndex];

        // Mark this key as used right now before the request
        lastUsedTimes[keyIndex] = Date.now();
        console.log(`[gemini] 🔑 Attempt ${attempt} | Model: ${model} | Key [${keyIndex + 1}/${sortedIndices.length}]: ${email}`);

        try {
          const { generationConfig, systemInstruction, contents, ...rest } = bodyPayload;
          
          const config: Record<string, unknown> = {};
          if (generationConfig) Object.assign(config, generationConfig);
          if (systemInstruction) config.systemInstruction = systemInstruction;

          const response = await client.models.generateContent({
            model,
            contents,
            ...(Object.keys(config).length > 0 && { config }),
            ...rest,
          } as GenerateContentParameters);

          // Adapt the SDK response to the legacy REST format expected by all service files
          const text = response.text ?? '';
          return {
            candidates: [{ content: { parts: [{ text }] } }],
            usageMetadata: {
              promptTokenCount:     response.usageMetadata?.promptTokenCount     ?? 0,
              candidatesTokenCount: response.usageMetadata?.candidatesTokenCount ?? 0,
            },
          };
        } catch (err: any) {
          // Permanently blacklist unauthenticated or invalid keys
          if (
            err?.status === 400 || 
            err?.status === 401 || 
            err?.status === 403 ||
            String(err?.message || '').includes('invalid authentication credentials')
          ) {
            deadKeys.add(email);
            console.warn(`[gemini] ⛔ Blacklisted dead key [${email}] (status: ${err?.status})`);
            lastError = err;
            allOverloaded = false; // Not a 503 — this key just died
            continue;
          }

          // 503: this specific key+model combo is overloaded — try the next key
          if (err?.status === 503) {
            console.warn(`[gemini] ⚠️ [${email}] on ${model} returned 503. Trying next key...`);
            lastError = err;
            continue; // Keep trying other keys for this same model
          }
          
          allOverloaded = false;
          console.warn(`[gemini] ⚠️ Key for [${email}] failed on ${model}: ${err?.message || err}. Trying next key...`);
          lastError = err;
        }
      }

      // If NOT all keys were overloaded on this model, no point retrying it
      if (!allOverloaded) continue;
      console.warn(`[gemini] ⚠️ All keys overloaded on model ${model}. Trying next model...`);
    }

    // All models exhausted — wait before next attempt pass
    if (attempt < maxAttempts) {
      const waitMs = attempt === 1 ? 600 : 1500;
      console.warn(`[gemini] ⏳ All models overloaded. Waiting ${waitMs}ms before retry attempt ${attempt + 1}...`);
      await sleep(waitMs);
    }
  }

  console.error('[gemini] 🚨 All API keys and model fallbacks exhausted. No response from Gemini.');
  throw lastError;
};

const EMBEDDING_MODELS = ['gemini-embedding-001', 'gemini-embedding-2-preview'];

/**
 * Generate vector embeddings for a batch of text strings.
 * Rotates across the LRU API key pool and falls back across embedding models.
 *
 * @param texts - Array of text strings to embed
 * @returns Array of embedding vectors (number[][])
 */
export const embedTexts = async (texts: string[]): Promise<number[][]> => {
  if (API_KEYS.length === 0) {
    throw new Error('No GOOGLE_API_KEYS configured on the server.');
  }
  if (!texts || texts.length === 0) return [];

  let lastError: unknown;
  for (const model of EMBEDDING_MODELS) {
    let sortedIndices = API_KEYS
      .map((_, i) => i)
      .filter(i => !deadKeys.has(API_KEYS[i].email))
      .sort((a, b) => lastUsedTimes[a] - lastUsedTimes[b]);

    if (sortedIndices.length === 0) {
      deadKeys.clear();
      sortedIndices = API_KEYS.map((_, i) => i);
    }

    for (const keyIndex of sortedIndices) {
      const { email, client } = API_KEYS[keyIndex];
      lastUsedTimes[keyIndex] = Date.now();

      try {
        const response: any = await client.models.embedContent({
          model,
          contents: texts,
        });

        if (response?.embeddings && Array.isArray(response.embeddings)) {
          return response.embeddings.map((e: any) => e.values as number[]);
        }
        if (response?.embedding?.values) {
          return [response.embedding.values as number[]];
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[gemini-embed] ⚠️ Key [${email}] failed on ${model}: ${err?.message || err}`);
      }
    }
  }

  throw lastError || new Error('All embedding keys and models failed');
};

