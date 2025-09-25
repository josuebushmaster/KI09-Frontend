import axios from "axios";
import type { AxiosResponse } from "axios";
import { API_URL, DEV_API_PREFIX, getAuthToken } from "../../config/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface HttpError extends Error {
  status: number;
  payload?: unknown;
}

async function parseResponse<T>(response: AxiosResponse<T>): Promise<T> {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  } else {
    const data = response.data as { detail?: string; message?: string } | null;
    const message = (data?.detail ?? data?.message) || response.statusText;
    const error: HttpError = new Error(String(message)) as HttpError;
    error.status = response.status;
    error.payload = response.data;
    throw error;
  }
}

export async function http<T = unknown>(
  path: string,
  method: HttpMethod = "GET",
  body?: Record<string, unknown> | FormData,
  signal?: AbortSignal
): Promise<T> {
  // Use the DEV_API_PREFIX when in development so Vite's proxy (configured at /api)
  // can forward requests to the real backend and avoid CORS.
  const baseRaw = import.meta.env.DEV ? DEV_API_PREFIX : API_URL;
  const base = String(baseRaw).replace(/\/$/, "");
  const url = path.startsWith("http") || path.startsWith("/") ?
    (path.startsWith("http") ? path : `${base}/${path.replace(/^\//, "")}`) :
    `${base}/${path.replace(/^\//, "")}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  const token = getAuthToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const config = {
    method,
    url,
    headers,
    // Axios uses `signal` in newer versions; pass timeout from env
    signal,
    timeout: Number(import.meta.env.VITE_API_TIMEOUT ?? 5000),
    data: body,
  };

  // Debug: log outgoing request (temporary)
  // Use VITE_DEBUG_API=true in .env to enable in production if desired
  try {
    if (import.meta.env && import.meta.env.VITE_DEBUG_API === "true") {
      console.debug("HTTP request:", { method, url, headers, body });
    }
  } catch {
    // ignore in environments without import.meta
  }

  if (body !== undefined && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  } else if (body instanceof FormData) {
    // Axios handles FormData automatically
  }

  try {
    // Log específico para debugging de creación de categorías (temporal)
    try {
      if (String(config.url).includes('/categorias') && String(config.method).toUpperCase() === 'POST') {
        console.log('🔍 HTTP DEBUG - POST a /categorias - body:', config.data);
      }
    } catch {
      // ignore logging errors
    }

    // Limpieza del body: eliminar claves tipo ID (inline)
    try {
      const methodUp = String(config.method).toUpperCase();
      if (methodUp === 'POST' || methodUp === 'PUT' || methodUp === 'PATCH') {
        const bodyObj = config.data as Record<string, unknown> | undefined;
        if (bodyObj && typeof bodyObj === 'object' && !(bodyObj instanceof FormData)) {
          const out = { ...bodyObj } as Record<string, unknown>;
          const idPattern = /(^id$|id_|_id$|idCategoria|idcategoria)/i;
          const removed: string[] = [];
          for (const k of Object.keys(out)) {
            if (idPattern.test(k)) {
              removed.push(k);
              delete out[k];
            }
          }
          if (removed.length > 0) {
            try {
              console.warn('🧹 http: se eliminaron claves tipo ID antes de enviar:', removed, bodyObj);
            } catch {
              /* ignore logging errors */
            }
            config.data = out;
          }
        }
      }
    } catch {
      // ignore
    }

    const response = await axios(config);
    return parseResponse(response);
  } catch (err) {
    // Log more details for debugging 404/other failures using axios type guard
    try {
      if (axios.isAxiosError(err)) {
        console.error("HTTP error:", {
          method,
          url,
          status: err.response?.status,
          responseData: err.response?.data,
          message: err.message,
        });
      } else if (err instanceof Error) {
        console.error("HTTP error:", { method, url, message: err.message });
      } else {
        console.error("HTTP error:", { method, url, error: String(err) });
      }
    } catch {
      // ignore logging errors
    }

    if (axios.isAxiosError(err)) {
      const data = err.response?.data as { detail?: string; message?: string } | null;
      const message = (data?.detail ?? data?.message) || err.message;
      const httpError: HttpError = new Error(String(message)) as HttpError;
      httpError.status = err.response?.status || 0;
      httpError.payload = err.response?.data;
      throw httpError;
    }
    throw err;
  }
}