/**
 * apiConfig.ts
 * Centralized API base URL resolver that avoids loopback CORS errors
 * when running on deployed environments like Vercel.
 */

const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '0.0.0.0'
);

export const getApiBaseUrl = (): string => {
  // If explicitly configured in Vite environment variables
  const envBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (envBase) {
    return envBase.endsWith('/') ? envBase.slice(0, -1) : envBase;
  }

  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (envUrl) {
    const clean = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }

  // Only fallback to localhost if running in a local development browser
  if (isLocalhost) {
    return 'http://localhost:5000/api';
  }

  // On deployed domains without configured backend URL, return empty string
  // to avoid Chrome loopback / private network CORS blocks
  return '';
};
