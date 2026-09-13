/**
 * ragService.ts
 * High-performance In-Memory Vector RAG (Retrieval-Augmented Generation) Service.
 *
 * Capabilities:
 * 1. Semantic document chunking with chapter/section header preservation.
 * 2. Vector embedding indexing via Google text-embedding-004 / gemini-embedding-001.
 * 3. Exact Cosine Similarity vector search for top-k relevant statutory passages.
 * 4. Automatic BM25 / tokenized keyword fallback if embedding quotas are throttled.
 * 5. Formatting retrieved chunks with verbatim citations for LLM grounding.
 */

import { embedTexts } from '../utils/gemini.js';

export interface DocumentChunk {
  chunkId: string;
  documentTitle: string;
  heading: string;
  citation: string;
  content: string;
  embedding?: number[];
  tokenEstimate: number;
}

export interface RetrievedChunk {
  chunk: DocumentChunk;
  score: number;
}

// In-memory document vector cache (documentHash -> DocumentChunk[])
const documentVectorCache = new Map<string, DocumentChunk[]>();

/**
 * Fast hash helper for caching document chunks & vectors.
 */
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < Math.min(str.length, 5000); i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `${str.length}_${hash}`;
};

/**
 * Split raw document text into clean, contextual semantic chunks.
 * Preserves Chapter, Section, and Guideline headings in chunk metadata.
 */
export const chunkDocument = (
  documentText: string,
  documentTitle: string = 'MoSPI Official Guidelines'
): DocumentChunk[] => {
  if (!documentText || documentText.trim().length === 0) return [];

  // Normalize line endings
  const cleanText = documentText.replace(/\r\n/g, '\n');
  const lines = cleanText.split('\n');

  const chunks: DocumentChunk[] = [];
  let currentChunkLines: string[] = [];
  let currentHeading = 'General Section';
  let currentChapter = '';
  let chunkCounter = 1;

  const headerRegex = /^(CHAPTER\s+\d+|SECTION\s+\d+|[0-9]+\.[0-9]+(\.[0-9]+)?|[A-Z\s]{4,}:)/i;

  const pushChunk = () => {
    if (currentChunkLines.length === 0) return;
    const content = currentChunkLines.join('\n').trim();
    if (content.length < 50) return; // Skip tiny fragments

    const citation = currentChapter
      ? `Ref: ${documentTitle}, ${currentChapter} — ${currentHeading}`
      : `Ref: ${documentTitle}, ${currentHeading}`;

    chunks.push({
      chunkId: `chunk-${chunkCounter++}`,
      documentTitle,
      heading: currentHeading,
      citation,
      content,
      tokenEstimate: Math.ceil(content.length / 4),
    });
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentChunkLines.length > 0) currentChunkLines.push('');
      continue;
    }

    // Detect chapter headings
    if (/^CHAPTER\s+\d+/i.test(trimmed)) {
      currentChapter = trimmed;
    }

    // Detect section/topic headings
    if (headerRegex.test(trimmed) && trimmed.length < 120) {
      // If we already accumulated sufficient text, flush current chunk
      if (currentChunkLines.join('\n').length > 700) {
        pushChunk();
        // Keep last 2 lines as overlap
        currentChunkLines = currentChunkLines.slice(-2);
      }
      currentHeading = trimmed;
    }

    currentChunkLines.push(trimmed);

    // Target chunk size ~1,200 to 1,600 characters (~300-400 words)
    if (currentChunkLines.join('\n').length >= 1400) {
      pushChunk();
      // 150-character sliding overlap (last 2-3 lines)
      currentChunkLines = currentChunkLines.slice(-2);
    }
  }

  // Flush any remaining content
  pushChunk();

  // Fallback: If document has no headers and didn't split, chunk by fixed window
  if (chunks.length === 0 && documentText.length > 0) {
    const windowSize = 1400;
    const overlap = 200;
    let start = 0;
    while (start < documentText.length) {
      const end = Math.min(start + windowSize, documentText.length);
      const slice = documentText.slice(start, end).trim();
      chunks.push({
        chunkId: `chunk-${chunkCounter++}`,
        documentTitle,
        heading: `Passage ${chunks.length + 1}`,
        citation: `Ref: ${documentTitle}, Passage ${chunks.length + 1}`,
        content: slice,
        tokenEstimate: Math.ceil(slice.length / 4),
      });
      if (end >= documentText.length) break;
      start += windowSize - overlap;
    }
  }

  return chunks;
};

/**
 * Compute cosine similarity between two float vectors.
 */
export const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
};

/**
 * Fast keyword / token overlap similarity fallback.
 */
const tokenOverlapScore = (query: string, text: string): number => {
  const queryTokens = new Set(query.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(Boolean));
  if (queryTokens.size === 0) return 0;

  const textTokens = new Set(text.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(Boolean));
  let matches = 0;
  for (const token of queryTokens) {
    if (textTokens.has(token)) matches++;
  }
  return matches / queryTokens.size;
};

/**
 * Index a document by generating vector embeddings for each chunk.
 * Caches in memory for instant reuse.
 */
export const indexDocumentChunks = async (
  documentText: string,
  documentTitle: string = 'MoSPI Official Guidelines'
): Promise<DocumentChunk[]> => {
  const cacheKey = `${documentTitle}::${simpleHash(documentText)}`;
  const cached = documentVectorCache.get(cacheKey);
  if (cached && cached.length > 0 && cached[0].embedding) {
    return cached;
  }

  const chunks = chunkDocument(documentText, documentTitle);
  if (chunks.length === 0) return [];

  try {
    // Generate embeddings in batches of 10 chunks to avoid single-payload size limits
    const batchSize = 10;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const slice = chunks.slice(i, i + batchSize);
      const texts = slice.map((c) => `${c.heading}\n${c.content}`);
      const embeddings = await embedTexts(texts);

      slice.forEach((c, idx) => {
        if (embeddings[idx]) {
          c.embedding = embeddings[idx];
        }
      });
    }
  } catch (embedError) {
    console.warn('[ragService] Vector embedding batch failed, falling back to tokenized indexing:', embedError);
  }

  documentVectorCache.set(cacheKey, chunks);
  return chunks;
};

/**
 * Retrieve the Top-K most semantically relevant passages for a query.
 *
 * @param documentText - Raw text of the uploaded MoSPI manual
 * @param query - The competency topic or target query string
 * @param topK - Maximum number of chunks to return (default: 4)
 * @param documentTitle - Human-readable document name for citations
 */
export const retrieveTopKPassages = async (
  documentText: string,
  query: string,
  topK: number = 4,
  documentTitle: string = 'MoSPI Official Guidelines'
): Promise<RetrievedChunk[]> => {
  if (!documentText || !query) return [];

  const chunks = await indexDocumentChunks(documentText, documentTitle);
  if (chunks.length === 0) return [];

  // 1. Try vector retrieval if chunks have embeddings
  const hasEmbeddings = chunks.some((c) => c.embedding && c.embedding.length > 0);

  if (hasEmbeddings) {
    try {
      const queryEmbeddings = await embedTexts([query]);
      const queryVec = queryEmbeddings[0];

      if (queryVec && queryVec.length > 0) {
        const scored: RetrievedChunk[] = chunks.map((chunk) => {
          let score = 0;
          if (chunk.embedding) {
            score = cosineSimilarity(queryVec, chunk.embedding);
          }
          // Hybrid boost: combine cosine similarity (80%) with keyword match (20%)
          const kwScore = tokenOverlapScore(query, chunk.content);
          const hybridScore = score * 0.8 + kwScore * 0.2;
          return { chunk, score: Number(hybridScore.toFixed(4)) };
        });

        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, topK);
      }
    } catch (queryErr) {
      console.warn('[ragService] Query vector embedding failed, falling back to keyword ranking:', queryErr);
    }
  }

  // 2. Fallback: Keyword token overlap ranking
  const fallbackScored: RetrievedChunk[] = chunks.map((chunk) => ({
    chunk,
    score: Number(tokenOverlapScore(query, `${chunk.heading} ${chunk.content}`).toFixed(4)),
  }));

  fallbackScored.sort((a, b) => b.score - a.score);
  return fallbackScored.slice(0, topK);
};

/**
 * Format retrieved chunks into a clean, context-dense block for Gemini prompts.
 */
export const formatRetrievedContext = (retrieved: RetrievedChunk[]): string => {
  if (!retrieved || retrieved.length === 0) return 'No statutory manual passages retrieved.';

  return retrieved
    .map((item, idx) => {
      const c = item.chunk;
      return `[RETRIEVED PASSAGE ${idx + 1} | ${c.citation} | Relevance: ${(item.score * 100).toFixed(1)}%]\n"${c.content}"`;
    })
    .join('\n\n');
};
