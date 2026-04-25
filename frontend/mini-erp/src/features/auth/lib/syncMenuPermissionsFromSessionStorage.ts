import { useAuthStore } from "@/features/auth/store/useAuthStore"
import { parseMenuPermissionsFromAccessToken } from "@/features/auth/lib/parseAccessTokenMenuPermissions"

/**
 * Gọi sau khi cập nhật `accessToken` trong sessionStorage (login / refresh) để đồng bộ store.
 */
export function syncMenuPermissionsFromSessionStorage(): void {
  const token = sessionStorage.getItem("accessToken")
  const perms = parseMenuPermissionsFromAccessToken(token)
  useAuthStore.getState().setMenuPermissions(perms)
}
