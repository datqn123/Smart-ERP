import { apiJson } from "@/lib/api/http"
import type { InventoryItem, InventoryKPIs } from "../types"

/**
 * Task005 — `GET /api/v1/inventory` (màn Tồn kho) — hợp đồng
 * `frontend/docs/api/API_Task005_inventory_get_list.md` §7.
 * Task006 — `GET /api/v1/inventory/{id}` — `frontend/docs/api/API_Task006_inventory_get_by_id.md`.
 */
export type InventoryListSummary = {
  totalSkus: number
  totalValue: number
  lowStockCount: number
  expiringSoonCount: number
}

export type InventoryListItemResponse = {
  id: number
  productId: number
  productName: string
  skuCode: string
  barcode: string | null
  locationId: number
  warehouseCode: string
  shelfCode: string
  batchNumber: string | null
  expiryDate: string | null
  quantity: number
  minQuantity: number
  unitId: number
  unitName: string
  costPrice: number
  updatedAt: string
  isLowStock: boolean
  isExpiringSoon: boolean
  totalValue: number
}

export type InventoryListData = {
  summary: InventoryListSummary
  items: InventoryListItemResponse[]
  page: number
  limit: number
  total: number
}

export type GetInventoryListParams = {
  search?: string
  stockLevel?: "all" | "in_stock" | "low_stock" | "out_of_stock"
  locationId?: number
  categoryId?: number
  page?: number
  limit?: number
  sort?: string
}

export function getInventoryList(params: GetInventoryListParams) {
  const q = new URLSearchParams()
  if (params.search) {
    q.set("search", params.search)
  }
  if (params.stockLevel) {
    q.set("stockLevel", params.stockLevel)
  }
  if (params.locationId != null && params.locationId > 0) {
    q.set("locationId", String(params.locationId))
  }
  if (params.categoryId != null && params.categoryId > 0) {
    q.set("categoryId", String(params.categoryId))
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
  return apiJson<InventoryListData>(qs ? `/api/v1/inventory?${qs}` : "/api/v1/inventory", {
    method: "GET",
    auth: true,
  })
}

export function mapListItemToUi(row: InventoryListItemResponse): InventoryItem {
  return {
    id: row.id,
    productId: row.productId,
    productName: row.productName,
    skuCode: row.skuCode,
    locationId: row.locationId,
    warehouseCode: row.warehouseCode,
    shelfCode: row.shelfCode,
    batchNumber: row.batchNumber ?? undefined,
    expiryDate: row.expiryDate ?? undefined,
    quantity: row.quantity,
    minQuantity: row.minQuantity,
    unitName: row.unitName,
    costPrice: row.costPrice,
    updatedAt: row.updatedAt,
    isLowStock: row.isLowStock,
    isExpiringSoon: row.isExpiringSoon,
    totalValue: row.totalValue,
    barcode: row.barcode ?? undefined,
    unitId: row.unitId,
  }
}

export function mapSummaryToKpis(s: InventoryListSummary): InventoryKPIs {
  return {
    totalSKUs: s.totalSkus,
    totalValue: s.totalValue,
    lowStockCount: s.lowStockCount,
    expiringSoonCount: s.expiringSoonCount,
  }
}

/** Dòng lô liên quan (cùng SP, khác id; BE chỉ trả lô còn hàng). */
export type InventoryRelatedLineResponse = {
  id: number
  batchNumber: string | null
  quantity: number
  expiryDate: string | null
  warehouseCode: string
  shelfCode: string
}

export type InventoryDetailResponse = InventoryListItemResponse & {
  relatedLines: InventoryRelatedLineResponse[]
}

export type GetInventoryByIdOptions = {
  /** Khi true gửi `?include=relatedLines` (SRS Task006 / PO OQ-2). */
  includeRelatedLines?: boolean
}

export function getInventoryById(id: number, opts?: GetInventoryByIdOptions) {
  const q = new URLSearchParams()
  if (opts?.includeRelatedLines) {
    q.set("include", "relatedLines")
  }
  const qs = q.toString()
  const path = qs ? `/api/v1/inventory/${id}?${qs}` : `/api/v1/inventory/${id}`
  return apiJson<InventoryDetailResponse>(path, {
    method: "GET",
    auth: true,
  })
}
