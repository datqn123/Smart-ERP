import { apiJson } from "@/lib/api/http"

export type SystemLogSeverity = "Info" | "Warning" | "Error" | "Critical"

export type SystemLogItemData = {
  id: number
  timestamp: string
  user: string
  action: string
  module: string
  description: string
  severity: SystemLogSeverity
  ipAddress: string | null
}

export type SystemLogsListData = {
  items: SystemLogItemData[]
  page: number
  limit: number
  total: number
}

export type SystemLogsListQuery = {
  search?: string
  module?: string
  logLevel?: "INFO" | "WARNING" | "ERROR" | "CRITICAL"
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

/** Task086 — Bearer; GET list + filter/search/paging. */
export function getSystemLogsList(query: SystemLogsListQuery = {}) {
  const q = new URLSearchParams()
  if (query.search) q.set("search", query.search)
  if (query.module) q.set("module", query.module)
  if (query.logLevel) q.set("logLevel", query.logLevel)
  if (query.dateFrom) q.set("dateFrom", query.dateFrom)
  if (query.dateTo) q.set("dateTo", query.dateTo)
  if (query.page != null) q.set("page", String(query.page))
  if (query.limit != null) q.set("limit", String(query.limit))

  const path = q.size > 0 ? `/api/v1/system-logs?${q.toString()}` : "/api/v1/system-logs"
  return apiJson<SystemLogsListData>(path, { method: "GET", auth: true })
}

