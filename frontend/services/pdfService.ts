/* eslint-disable */
// @ts-nocheck
import { supabase } from './supabase';
import { getApiBaseUrl } from './apiConfig';
import { getAuthToken } from './aiService';

const rawBase = getApiBaseUrl();
const BASE_URL = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
const API_URL = BASE_URL.endsWith('/api') ? `${BASE_URL}/pdf` : `${BASE_URL}/api/pdf`;

export const extractTextFromPDF = async (file, onProgress) => {
  try {
    if (onProgress) onProgress("Uploading file to secure server...");

    const formData = new FormData();
    formData.append("pdf", file);

    const token = await getAuthToken();
    const res = await fetch(`${API_URL}/extract`, {
      method: "POST",
      headers: {
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to process PDF on the backend.");
    }

    if (onProgress) onProgress("Extracting structural text...");
    
    return data.text;
  } catch (error) {
    console.error("Extraction Error:", error);
    throw new Error(error.message || "Failed to scan PDF.");
  }
};
