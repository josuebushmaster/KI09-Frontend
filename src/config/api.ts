const rawUrl = import.meta.env.VITE_API_URL ?? "https://ki09-production.up.railway.app";

// Ensure API_URL always includes a protocol; if the env var was set without it,
// prepend https:// so the browser doesn't interpret it as a relative path.
function normalizeUrl(u: string) {
  const trimmed = String(u).trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/\/$/, "");
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

export const API_URL = normalizeUrl(rawUrl);
// In development we'll use the vite proxy at /api to avoid CORS.
// That means code should call /api/... when running locally.
export const DEV_API_PREFIX = import.meta.env.DEV ? '/api' : API_URL;

export function getAuthToken(): string | null {
  return localStorage.getItem("access_token");
}

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem("access_token", token);
  else localStorage.removeItem("access_token");
}