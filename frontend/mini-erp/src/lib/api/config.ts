/**
 * Base URL for Spring Boot API (no trailing slash), hoặc chuỗi rỗng khi
 * cùng origin (Vite dev proxy tới 8080 — tránh lấy index.html thay vì JSON).
 * Set VITE_API_BASE_URL trong .env.local nếu cần gọi thẳng 8080 (CORS bật trên BE).
 */
export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (fromEnv && String(fromEnv).trim().length > 0) {
    return String(fromEnv).replace(/\/+$/, "")
  }
  if (import.meta.env.DEV) {
    return ""
  }
  return ""
}

/**
 * URL đầy đủ gọi API. `path` bắt đầu bằng `/` (ví dụ `/api/v1/...`).
 */
export function getApiUrl(path: string): string {
  const base = getApiBaseUrl()
  const p = path.startsWith("/") ? path : `/${path}`
  return base ? `${base}${p}` : p
}
