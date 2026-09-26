import axios, { type AxiosError, type AxiosInstance } from 'axios';

// In development Vite proxies /api → http://localhost:4000
// In production set VITE_API_URL to your backend URL
const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,   // send httpOnly session cookie
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Response interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// ─── Extract readable error message ───────────────────────────────────────────
export function extractErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Record<string, unknown> | undefined;
    if (typeof data?.message === 'string') return data.message;
    if (typeof data?.error === 'string') return data.error;
    if (error.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
    if (!error.response) return 'Cannot connect to server. Please try again.';
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
