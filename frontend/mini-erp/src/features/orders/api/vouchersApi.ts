import { apiJson } from "@/lib/api/http"

/** Task092 — `GET /api/v1/vouchers` — `API_Task092_vouchers_and_retail_preview.md` §1 */
export const VOUCHERS_LIST_QUERY_KEY = ["orders", "vouchers", "list"] as const

export type VoucherListItemDto = {
  id: number
  code: string
  name: string | null
  discountType: string
  discountValue: number | string
  validFrom: string | null
  validTo: string | null
  isActive: boolean
  usedCount: number
  maxUses: number | null
  createdAt: string | null
}

export type VoucherListPageDto = {
  items: VoucherListItemDto[]
  page: number
  limit: number
  total: number
}

export function getVouchersList(page = 1, limit = 5) {
  const q = new URLSearchParams({ page: String(page), limit: String(limit) })
  return apiJson<VoucherListPageDto>(`/api/v1/vouchers?${q}`, { method: "GET", auth: true })
}

/** Task092 — `GET /api/v1/vouchers/{id}` — §2 */
export function getVoucherById(id: number) {
  return apiJson<VoucherListItemDto>(`/api/v1/vouchers/${id}`, { method: "GET", auth: true })
}
