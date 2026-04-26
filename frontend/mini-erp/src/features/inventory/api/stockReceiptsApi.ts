import { apiJson } from "@/lib/api/http"
import type { StockReceipt } from "../types"

/**
 * Task013 — `GET /api/v1/stock-receipts` — `frontend/docs/api/API_Task013_stock_receipts_get_list.md` §7.
 * Sort BE: chỉ `id:asc` | `id:desc` (mặc định BE `id:desc`).
 */
export type StockReceiptListItemResponse = {
  id: number
  receiptCode: string
  supplierId: number
  supplierName: string
  staffId: number
  staffName: string
  receiptDate: string
  status: "Draft" | "Pending" | "Approved" | "Rejected"
  invoiceNumber: string | null
  totalAmount: number | string
  lineCount: number
  notes: string | null
  approvedBy: number | null
  approvedByName: string | null
  approvedAt: string | null
  reviewedBy: number | null
  reviewedByName: string | null
  reviewedAt: string | null
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
}

export type StockReceiptListData = {
  items: StockReceiptListItemResponse[]
  page: number
  limit: number
  total: number
}

export type GetStockReceiptListParams = {
  search?: string
  status?: "all" | "Draft" | "Pending" | "Approved" | "Rejected"
  dateFrom?: string
  dateTo?: string
  supplierId?: number
  page?: number
  limit?: number
  /** Chỉ `id:asc` hoặc `id:desc` (khớp BE). */
  sort?: string
}

function asNumber(v: number | string): number {
  return typeof v === "number" ? v : Number(v)
}

export function mapStockReceiptListItemToUi(row: StockReceiptListItemResponse): StockReceipt {
  const lineCount = row.lineCount ?? 0
  return {
    id: row.id,
    receiptCode: row.receiptCode,
    supplierId: row.supplierId,
    supplierName: row.supplierName,
    staffId: row.staffId,
    staffName: row.staffName?.trim() ? row.staffName : "—",
    receiptDate: row.receiptDate,
    status: row.status,
    invoiceNumber: row.invoiceNumber ?? undefined,
    totalAmount: asNumber(row.totalAmount),
    notes: row.notes ?? undefined,
    approvedBy: row.approvedBy ?? undefined,
    approvedByName: row.approvedByName ?? undefined,
    approvedAt: row.approvedAt ?? undefined,
    reviewedBy: row.reviewedBy ?? undefined,
    reviewedByName: row.reviewedByName ?? undefined,
    reviewedAt: row.reviewedAt ?? undefined,
    rejectionReason: row.rejectionReason ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    lineCount,
    details: [],
  }
}

export function getStockReceiptList(params: GetStockReceiptListParams) {
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
  if (params.supplierId != null && params.supplierId > 0) {
    q.set("supplierId", String(params.supplierId))
  }
  if (params.page != null) {
    q.set("page", String(params.page))
  }
  if (params.limit != null) {
    q.set("limit", String(params.limit))
  }
  if (params.sort) {
    q.set("sort", params.sort)
  }
  const qs = q.toString()
  return apiJson<StockReceiptListData>(qs ? `/api/v1/stock-receipts?${qs}` : "/api/v1/stock-receipts", {
    method: "GET",
    auth: true,
  })
}
