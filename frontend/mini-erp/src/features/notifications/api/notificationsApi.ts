import { apiJson } from "@/lib/api/http"

export type NotificationItemDto = {
  id: number
  notificationType: string
  title: string
  message: string
  read: boolean
  referenceType: string | null
  referenceId: number | null
  createdAt: string
}

export type NotificationsPageDto = {
  items: NotificationItemDto[]
  page: number
  limit: number
  total: number
  unreadTotal: number
}

export function getNotifications(params: { page?: number; limit?: number; unreadOnly?: boolean }) {
  const qs = new URLSearchParams()
  if (params.page != null) qs.set("page", String(params.page))
  if (params.limit != null) qs.set("limit", String(params.limit))
  if (params.unreadOnly === true) qs.set("unreadOnly", "true")
  const q = qs.toString()
  return apiJson<NotificationsPageDto>(`/api/v1/notifications${q ? `?${q}` : ""}`, { auth: true })
}

export function patchNotificationRead(notificationId: number) {
  return apiJson<Record<string, unknown>>(`/api/v1/notifications/${notificationId}`, {
    method: "PATCH",
    auth: true,
  })
}

export function postNotificationsMarkAllRead() {
  return apiJson<Record<string, unknown>>("/api/v1/notifications/mark-all-read", {
    method: "POST",
    auth: true,
  })
}
