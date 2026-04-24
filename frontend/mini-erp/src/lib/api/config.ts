/**
 * Base URL for Spring Boot API (no trailing slash).
 * Set VITE_API_BASE_URL in .env.local (see repo .env.example when added).
 */
export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (fromEnv && String(fromEnv).trim().length > 0) {
    return String(fromEnv).replace(/\/+$/, "")
  }
  if (import.meta.env.DEV) {
    return "http://localhost:8080"
  }
  return ""
}
