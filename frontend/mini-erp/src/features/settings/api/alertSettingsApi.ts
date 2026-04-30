import { apiJson } from "@/lib/api/http"

export type AlertType =
  | "LowStock"
  | "ExpiryDate"
  | "HighValueTransaction"
  | "PendingApproval"
  | "OverStock"
  | "SalesOrderCreated"
  | "PartnerDebtDueSoon"
  | "SystemHealth"

export type AlertChannel = "App" | "Email" | "SMS" | "Zalo"
export type AlertFrequency = "Realtime" | "Daily" | "Weekly"

export type AlertSettingItemData = {
  id: number
  alertType: AlertType
  thresholdValue: number | null
  channel: AlertChannel
  frequency: AlertFrequency
  isEnabled: boolean
  recipients?: string[] | null
  updatedAt: string
}

export type AlertSettingsListData = {
  items: AlertSettingItemData[]
}

export type AlertSettingCreateBody = {
  alertType: AlertType
  channel: AlertChannel
  frequency?: AlertFrequency
  thresholdValue?: number | null
  isEnabled?: boolean
  recipients?: string[]
}

export type AlertSettingPatchBody = {
  thresholdValue?: number | null
  channel?: AlertChannel
  frequency?: AlertFrequency
  isEnabled?: boolean
  recipients?: string[] | null
}

export type AlertSettingsListQuery = {
  /** Admin-only; Owner sẽ bị ignore ở backend. */
  ownerId?: number
  alertType?: AlertType
  isEnabled?: boolean
}

/** Task082 — Bearer; GET list + optional filters. */
export function getAlertSettingsList(query: AlertSettingsListQuery = {}) {
  const q = new URLSearchParams()
  if (query.ownerId != null) q.set("ownerId", String(query.ownerId))
  if (query.alertType) q.set("alertType", query.alertType)
  if (query.isEnabled != null) q.set("isEnabled", String(query.isEnabled))

  const path = q.size > 0 ? `/api/v1/alert-settings?${q.toString()}` : "/api/v1/alert-settings"
  return apiJson<AlertSettingsListData>(path, { method: "GET", auth: true })
}

/** Task083 — Bearer; POST create rule. */
export function postCreateAlertSetting(body: AlertSettingCreateBody) {
  return apiJson<AlertSettingItemData>("/api/v1/alert-settings", {
    method: "POST",
    body: JSON.stringify(body),
    auth: true,
  })
}

/** Task084 — Bearer; PATCH partial update. */
export function patchAlertSetting(id: number, body: AlertSettingPatchBody) {
  return apiJson<AlertSettingItemData>(`/api/v1/alert-settings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    auth: true,
  })
}

/** Task085 — Bearer; DELETE = soft disable (204 No Content). */
export function deleteAlertSetting(id: number) {
  return apiJson<void>(`/api/v1/alert-settings/${id}`, { method: "DELETE", auth: true })
}

