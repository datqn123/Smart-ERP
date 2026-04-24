import { getApiBaseUrl } from "@/lib/api/config"
import { tryRefreshAccessToken } from "@/lib/api/refreshAccessToken"

export type ApiErrorBody = {
  success: false
  error: string
  message: string
  details?: Record<string, string>
}

export class ApiRequestError extends Error {
  readonly status: number
  readonly body: ApiErrorBody

  constructor(status: number, body: ApiErrorBody) {
    super(body.message ?? "Request failed")
    this.name = "ApiRequestError"
    this.status = status
    this.body = body
  }
}

export type ApiJsonOptions = RequestInit & {
  /** Attach Authorization: Bearer from sessionStorage accessToken */
  auth?: boolean
  /** Internal: đã thử refresh một lần (Task003) — không lặp vô hạn */
  _didRefresh?: boolean
}

/**
 * JSON request/response against Spring envelope: success + data on OK.
 */
export async function apiJson<T>(path: string, init: ApiJsonOptions = {}): Promise<T> {
  const { auth, _didRefresh, headers: initHeaders, ...rest } = init
  const base = getApiBaseUrl()
  if (!base) {
    throw new Error("VITE_API_BASE_URL is not set and non-DEV build has no default API host")
  }
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`
  const headers = new Headers(initHeaders)
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }
  if (auth) {
    const token = sessionStorage.getItem("accessToken")
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
  }
  const res = await fetch(url, { ...rest, headers })
  let json: unknown
  try {
    json = await res.json()
  } catch {
    throw new ApiRequestError(res.status, {
      success: false,
      error: "BAD_RESPONSE",
      message: "Không đọc được JSON từ server",
    })
  }
  const obj = json as Record<string, unknown>

  if (
    auth &&
    !_didRefresh &&
    res.status === 401 &&
    path !== "/api/v1/auth/refresh" &&
    path !== "/api/v1/auth/login"
  ) {
    const refreshed = await tryRefreshAccessToken()
    if (refreshed) {
      return apiJson<T>(path, { ...init, auth: true, _didRefresh: true })
    }
  }

  if (obj && obj.success === false) {
    throw new ApiRequestError(res.status, obj as unknown as ApiErrorBody)
  }
  if (!res.ok) {
    throw new ApiRequestError(res.status, {
      success: false,
      error: String(obj?.error ?? "HTTP_ERROR"),
      message: String(obj?.message ?? res.statusText),
      details: (obj?.details as Record<string, string>) ?? undefined,
    })
  }
  if (obj && obj.success === true && "data" in obj) {
    return obj.data as T
  }
  throw new ApiRequestError(res.status, {
    success: false,
    error: "INVALID_ENVELOPE",
    message: "Phản hồi không đúng envelope success/data",
  })
}
