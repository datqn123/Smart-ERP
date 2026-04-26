import { apiJson } from "@/lib/api/http"
import type { AuditSession, AuditStatus } from "../types"

/**
 * Task021 — `GET /api/v1/inventory/audit-sessions` — `frontend/docs/api/API_Task021_inventory_audit_sessions_get_list.md` §5–6.
 */
export type AuditSessionListItemResponse = {
  id: number
  auditCode: string
  title: string
  auditDate: string
  status: string
  locationFilter: string | null
  categoryFilter: string | null
  createdBy: number
  createdByName: string
  completedAt: string | null
  completedByName: string | null
  createdAt: string
  updatedAt: string
  totalLines: number
  countedLines: number
  varianceLines: number
}

export type AuditSessionListData = {
  items: AuditSessionListItemResponse[]
  page: number
  limit: number
  total: number
}

export type GetAuditSessionListParams = {
  search?: string
  status?: "all" | AuditStatus
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export function mapAuditSessionListItemToUi(row: AuditSessionListItemResponse): AuditSession {
  return {
    id: row.id,
    auditCode: row.auditCode,
    title: row.title,
    auditDate: row.auditDate,
    status: row.status as AuditStatus,
    locationFilter: row.locationFilter ?? undefined,
    categoryFilter: row.categoryFilter ?? undefined,
    createdBy: row.createdBy,
    createdByName: row.createdByName?.trim() ? row.createdByName : "—",
    completedAt: row.completedAt ?? undefined,
    completedByName: row.completedByName ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    items: [],
    totalLines: row.totalLines,
    countedLines: row.countedLines,
    varianceLines: row.varianceLines,
  }
}

export function getAuditSessionList(params: GetAuditSessionListParams) {
  const q = new URLSearchParams()
  if (params.search) {
    q.set("search", params.search)
  }
  if (params.status && params.status !== "all") {
    q.set("status", params.status)
  }
  if (params.dateFrom) {
    q.set("dateFrom", params.dateFrom)
  }
  if (params.dateTo) {
    q.set("dateTo", params.dateTo)
  }
  if (params.page != null) {
    q.set("page", String(params.page))
  }
  if (params.limit != null) {
    q.set("limit", String(params.limit))
  }
  const qs = q.toString()
  return apiJson<AuditSessionListData>(qs ? `/api/v1/inventory/audit-sessions?${qs}` : "/api/v1/inventory/audit-sessions", {
    method: "GET",
    auth: true,
  })
}

/**
 * Task022 — `POST /api/v1/inventory/audit-sessions` — `frontend/docs/api/API_Task022_inventory_audit_sessions_post.md` §5–6.
 */
export type AuditScopeCreateBody =
  | { mode: "by_location_ids"; locationIds: number[] }
  | { mode: "by_category_id"; categoryId: number }
  | { mode: "by_inventory_ids"; inventoryIds: number[] }

export type AuditSessionCreateBody = {
  title: string
  auditDate: string
  notes?: string | null
  scope: AuditScopeCreateBody
}

/** Phản hồi 201 — cùng family Task023; FE chỉ cần vài field cho toast / invalidate. */
export type AuditSessionDetailResponse = {
  id: number
  auditCode: string
  title: string
  auditDate: string
  status: string
  items: unknown[]
}

export function postAuditSession(body: AuditSessionCreateBody) {
  const payload = {
    title: body.title.trim(),
    auditDate: body.auditDate,
    notes: body.notes == null || String(body.notes).trim() === "" ? null : String(body.notes).trim(),
    scope: body.scope,
  }
  return apiJson<AuditSessionDetailResponse>("/api/v1/inventory/audit-sessions", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  })
}
