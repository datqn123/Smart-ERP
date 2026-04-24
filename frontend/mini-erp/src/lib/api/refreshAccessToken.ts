import { getApiBaseUrl } from "@/lib/api/config"

/**
 * Task003 — POST /api/v1/auth/refresh (public, no Bearer).
 * Cập nhật sessionStorage nếu thành công.
 *
 * @returns true nếu đã lưu access + refresh mới
 */
export async function tryRefreshAccessToken(): Promise<boolean> {
  const refreshToken = sessionStorage.getItem("refreshToken")
  if (!refreshToken?.trim()) {
    return false
  }
  const base = getApiBaseUrl()
  if (!base) {
    return false
  }
  const url = `${base}/api/v1/auth/refresh`
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })
  let json: unknown
  try {
    json = await res.json()
  } catch {
    return false
  }
  const obj = json as Record<string, unknown>
  if (!res.ok || obj?.success !== true || typeof obj.data !== "object" || obj.data === null) {
    return false
  }
  const data = obj.data as { accessToken?: unknown; refreshToken?: unknown }
  if (typeof data.accessToken !== "string" || typeof data.refreshToken !== "string") {
    return false
  }
  sessionStorage.setItem("accessToken", data.accessToken)
  sessionStorage.setItem("refreshToken", data.refreshToken)
  return true
}
