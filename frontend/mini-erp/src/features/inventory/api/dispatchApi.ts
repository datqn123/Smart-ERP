import { apiJson } from "@/lib/api/http"
import type { DispatchStatus, StockDispatch } from "../types"

export type StockDispatchCreateLineBody = {
  inventoryId: number
  quantity: number
}

export type StockDispatchCreateBody = {
  dispatchDate: string
  referenceLabel?: string
  notes?: string
  lines: StockDispatchCreateLineBody[]
}

export type StockDispatchCreatedResponse = {
  id: number
  dispatchCode: string
  dispatchDate: string
  status: string
  referenceLabel?: string | null
}

export type StockDispatchListItemResponse = {
  id: number
  dispatchCode: string
  orderCode: string
  customerName: string
  dispatchDate: string
  userName: string
  itemCount: number
  status: DispatchStatus
  createdByUserId: number
  manualDispatch: boolean
  shortageWarning: boolean
  canEdit: boolean
  canDelete: boolean
}

export type StockDispatchListPageResponse = {
  items: StockDispatchListItemResponse[]
  page: number
  limit: number
  total: number
}

export type StockDispatchDetailLineResponse = {
  lineId: number
  inventoryId: number
  quantity: number
  availableQuantity: number
  shortageLine: boolean
  productName: string
  skuCode: string
  warehouseCode: string
  shelfCode: string
}

export type StockDispatchDetailResponse = {
  id: number
  dispatchCode: string
  orderCode: string
  customerName: string
  dispatchDate: string
  userId: number
  userName: string
  status: DispatchStatus
  notes?: string | null
  referenceLabel?: string | null
  manualDispatch: boolean
  shortageWarning: boolean
  lines: StockDispatchDetailLineResponse[]
  canEdit: boolean
  canDelete: boolean
  deletedAt?: string | null
  deletedByUserId?: number | null
  deletedByUserName?: string | null
  deleteReason?: string | null
}

export type StockDispatchPatchBody = {
  dispatchDate?: string
  notes?: string | null
  referenceLabel?: string | null
  status?: string
  lines?: StockDispatchCreateLineBody[]
}

export type GetStockDispatchListParams = {
  search?: string
  page?: number
  limit?: number
  status?: string
  dateFrom?: string
  dateTo?: string
}

export function postStockDispatch(body: StockDispatchCreateBody) {
  return apiJson<StockDispatchCreatedResponse>("/api/v1/stock-dispatches", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  })
}

export function getStockDispatchDetail(id: number) {
  return apiJson<StockDispatchDetailResponse>(`/api/v1/stock-dispatches/${id}`, {
    method: "GET",
    auth: true,
  })
}

export function patchStockDispatch(id: number, body: StockDispatchPatchBody) {
  return apiJson<StockDispatchDetailResponse>(`/api/v1/stock-dispatches/${id}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(body),
  })
}

export function softDeleteStockDispatch(id: number, reason: string) {
  return apiJson<Record<string, unknown>>(`/api/v1/stock-dispatches/${id}/soft-delete`, {
    method: "POST",
    auth: true,
    body: JSON.stringify({ reason }),
  })
}

export function mapStockDispatchListItemToUi(row: StockDispatchListItemResponse): StockDispatch {
  return {
    id: row.id,
    dispatchCode: row.dispatchCode,
    orderId: 0,
    orderCode: row.orderCode,
    customerName: row.customerName,
    userId: row.createdByUserId,
    userName: row.userName,
    dispatchDate: row.dispatchDate,
    status: row.status,
    notes: undefined,
    createdAt: "",
    updatedAt: "",
    items: [],
    lineCount: row.itemCount,
    canEdit: row.canEdit,
    canDelete: row.canDelete,
    manualDispatch: row.manualDispatch,
    shortageWarning: row.shortageWarning,
  }
}

export function getStockDispatchList(params: GetStockDispatchListParams = {}) {
  const q = new URLSearchParams()
  if (params.search?.trim()) {
    q.set("search", params.search.trim())
  }
  if (params.page != null) {
    q.set("page", String(params.page))
  }
  if (params.limit != null) {
    q.set("limit", String(params.limit))
  }
  if (params.status && params.status !== "all") {
    q.set("status", params.status)
  }
  if (params.dateFrom?.trim()) {
    q.set("dateFrom", params.dateFrom.trim())
  }
  if (params.dateTo?.trim()) {
    q.set("dateTo", params.dateTo.trim())
  }
  const qs = q.toString()
  return apiJson<StockDispatchListPageResponse>(
    qs ? `/api/v1/stock-dispatches?${qs}` : "/api/v1/stock-dispatches",
    { method: "GET", auth: true },
  )
}
