import type { NavigateFunction } from "react-router-dom"

import { postLogout } from "@/features/auth/api/authApi"

/** Xóa token / user khỏi sessionStorage (Task001 lưu khi đăng nhập). */
export function clearSessionAuth(): void {
  sessionStorage.removeItem("accessToken")
  sessionStorage.removeItem("refreshToken")
  sessionStorage.removeItem("user")
}

/**
 * Task002 — POST /api/v1/auth/logout (Bearer + body refreshToken).
 * Best-effort: lỗi mạng / 401 vẫn để caller xóa phiên cục bộ.
 */
export async function tryServerLogout(): Promise<void> {
  const refreshToken = sessionStorage.getItem("refreshToken")
  const accessToken = sessionStorage.getItem("accessToken")
  if (!refreshToken?.trim() || !accessToken?.trim()) {
    return
  }
  try {
    await postLogout({ refreshToken })
  } catch {
    // intentional: đăng xuất cục bộ vẫn tiếp tục
  }
}

/** Gọi API logout (nếu có token), xóa storage, rồi điều hướng /login. */
export async function logoutAndGoToLogin(
  navigate: NavigateFunction,
  afterClear?: () => void,
): Promise<void> {
  try {
    await tryServerLogout()
  } finally {
    clearSessionAuth()
    afterClear?.()
    navigate("/login", { replace: true })
  }
}
