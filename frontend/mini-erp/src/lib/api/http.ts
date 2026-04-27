import { getApiBaseUrl, getApiUrl } from "@/lib/api/config"
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
    super(body.message ?? "Yêu cầu không thành công. Vui lòng thử lại.")
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

function parseApiEnvelopeText<T>(res: Response, raw: string): T {
  const trimmed = raw.trim()
  if (trimmed.length === 0) {
    if (res.status === 401) {
      throw new ApiRequestError(401, {
        success: false,
        error: "UNAUTHORIZED",
        message: "Phiên đăng nhập hết hạn hoặc chưa đăng nhập. Vui lòng đăng nhập lại.",
      })
    }
    throw new ApiRequestError(res.status, {
      success: false,
      error: "BAD_RESPONSE",
      message: "Không nhận được phản hồi từ dịch vụ. Vui lòng thử lại sau ít phút.",
    })
  }
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    const isHtml = trimmed.toLowerCase().startsWith("<!") || /<\s*html[\s>]/i.test(raw)
    throw new ApiRequestError(res.status, {
      success: false,
      error: "BAD_RESPONSE",
      message: isHtml
        ? "Dịch vụ tạm thời không phản hồi đúng. Vui lòng thử lại sau ít phút."
        : "Không thể xử lý phản hồi từ hệ thống. Vui lòng thử lại.",
    })
  }
  const obj = json as Record<string, unknown>

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
    message: "Không xử lý được dữ liệu trả về. Vui lòng thử lại hoặc liên hệ quản trị.",
  })
}

/**
 * JSON request/response against Spring envelope: success + data on OK.
 */
export async function apiJson<T>(path: string, init: ApiJsonOptions = {}): Promise<T> {
  const { auth, _didRefresh, headers: initHeaders, ...rest } = init
  const base = getApiBaseUrl()
  if (!import.meta.env.DEV && !base) {
    throw new Error("Ứng dụng chưa được cấu hình địa chỉ dịch vụ. Vui lòng liên hệ quản trị hệ thống.")
  }
  const url = getApiUrl(path.startsWith("/") ? path : `/${path}`)
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
  const raw = await res.text()

  // 401 từ OAuth2 Resource Server thường không có body; phải thử refresh *trước* khi từ chối thân rỗng
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

  return parseApiEnvelopeText<T>(res, raw)
}

/**
 * `multipart/form-data` — dùng factory `getFormData` để có thể gọi lại khi 401 + refresh.
 * Không gắn `Content-Type` (boundary tự tạo). Phản hồi vẫn JSON envelope.
 */
export async function apiFormData<T>(path: string, getFormData: () => FormData, init: ApiJsonOptions = {}): Promise<T> {
  const { auth, _didRefresh, headers: initHeaders, ...rest } = init
  const base = getApiBaseUrl()
  if (!import.meta.env.DEV && !base) {
    throw new Error("Ứng dụng chưa được cấu hình địa chỉ dịch vụ. Vui lòng liên hệ quản trị hệ thống.")
  }
  const url = getApiUrl(path.startsWith("/") ? path : `/${path}`)
  const headers = new Headers(initHeaders)
  if (auth) {
    const token = sessionStorage.getItem("accessToken")
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
  }
  const res = await fetch(url, { ...rest, method: "POST", body: getFormData(), headers })
  const raw = await res.text()

  if (
    auth &&
    !_didRefresh &&
    res.status === 401 &&
    path !== "/api/v1/auth/refresh" &&
    path !== "/api/v1/auth/login"
  ) {
    const refreshed = await tryRefreshAccessToken()
    if (refreshed) {
      return apiFormData<T>(path, getFormData, { ...init, auth: true, _didRefresh: true })
    }
  }

  return parseApiEnvelopeText<T>(res, raw)
}
