import { apiJson } from "@/lib/api/http"
import type { Order } from "../types"

/** Task054 — `GET /api/v1/sales-orders` — `SalesOrderJdbcRepository.resolveListOrderBy` */
export const SALES_ORDER_LIST_SORT_WHITELIST = [
  "orderCode:asc",
  "orderCode:desc",
  "totalAmount:asc",
  "totalAmount:desc",
  "updatedAt:asc",
  "updatedAt:desc",
  "createdAt:asc",
  "createdAt:desc",
] as const

export type SalesOrderListSort = (typeof SALES_ORDER_LIST_SORT_WHITELIST)[number]

export type SalesOrderChannel = "Retail" | "Wholesale" | "Return"

export const SALES_ORDER_LIST_QUERY_KEY = ["orders", "sales-orders", "list"] as const

export type SalesOrderListItemDto = {
  id: number
  orderCode: string
  customerId: number
  customerName: string
  totalAmount: number | string
  discountAmount: number | string
  finalAmount: number | string
  status: string
  orderChannel: string
  paymentStatus: string
  itemsCount: number
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type SalesOrderListPageDto = {
  items: SalesOrderListItemDto[]
  page: number
  limit: number
  total: number
}

export type GetSalesOrderListParams = {
  /** Bắt buộc trên màn Staff (OQ-8a); Owner/Admin có thể bỏ qua trên màn “tất cả kênh”. */
  orderChannel?: SalesOrderChannel
  search?: string
  status?: string
  paymentStatus?: "all" | "Paid" | "Unpaid" | "Partial"
  page?: number
  limit?: number
  sort?: SalesOrderListSort
}

function num(v: number | string): number {
  const n = typeof v === "number" ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

export function mapSalesOrderListItemDtoToOrder(d: SalesOrderListItemDto): Order {
  const st = d.status
  const status =
    st === "Pending" ||
    st === "Processing" ||
    st === "Partial" ||
    st === "Shipped" ||
    st === "Delivered" ||
    st === "Completed" ||
    st === "Cancelled"
      ? st
      : "Pending"
  const ch = d.orderChannel
  const type: Order["type"] =
    ch === "Retail" || ch === "Wholesale" || ch === "Return" ? ch : "Wholesale"
  const ps = d.paymentStatus
  const paymentStatus: Order["paymentStatus"] =
    ps === "Paid" || ps === "Unpaid" || ps === "Partial" ? ps : "Unpaid"
  return {
    id: d.id,
    orderCode: d.orderCode,
    customerId: d.customerId,
    customerName: d.customerName,
    totalAmount: num(d.totalAmount),
    discountAmount: num(d.discountAmount),
    finalAmount: num(d.finalAmount),
    status,
    date: d.createdAt,
    type,
    itemsCount: d.itemsCount,
    paymentStatus,
    notes: d.notes ?? undefined,
  }
}

export function getSalesOrderList(params: GetSalesOrderListParams = {}) {
  const q = new URLSearchParams()
  if (params.orderChannel) {
    q.set("orderChannel", params.orderChannel)
  }
  if (params.search?.trim()) {
    q.set("search", params.search.trim())
  }
  if (params.status && params.status !== "all") {
    q.set("status", params.status)
  }
  const pay = params.paymentStatus ?? "all"
  if (pay !== "all") {
    q.set("paymentStatus", pay)
  }
  q.set("page", String(params.page ?? 1))
  q.set("limit", String(params.limit ?? 20))
  q.set("sort", params.sort ?? "createdAt:desc")
  return apiJson<SalesOrderListPageDto>(`/api/v1/sales-orders?${q.toString()}`, { method: "GET", auth: true })
}

/** Task056 — `POST /api/v1/sales-orders` — `API_Task056_sales_orders_post.md` */
export type SalesOrderCreateLineBody = {
  productId: number
  unitId: number
  quantity: number
  unitPrice: number
}

export type SalesOrderCreateBody = {
  orderChannel: "Wholesale" | "Return"
  customerId: number
  discountAmount?: number
  shippingAddress?: string | null
  notes?: string | null
  paymentStatus?: string
  status?: string
  refSalesOrderId?: number | null
  lines: SalesOrderCreateLineBody[]
}

/** UI → BE khi tạo đơn: `Completed` → `Delivered`; `Cancelled` → bỏ `status` (BE mặc định). */
export function mapStatusForSalesOrderCreate(status: string): string | undefined {
  if (status === "Completed") return "Delivered"
  if (status === "Cancelled") return undefined
  return status || undefined
}

/** Task057 — `PATCH /api/v1/sales-orders/{id}` — partial header (camelCase theo BE). */
export type SalesOrderPatchBody = {
  status?: string
  paymentStatus?: string
  shippingAddress?: string | null
  notes?: string | null
  discountAmount?: number
}

export type SalesOrderDetailLineDto = {
  id: number
  productId: number
  productName: string
  skuCode: string
  unitId?: number
  quantity: number
  unitName: string
  unitPrice: number | string
  lineTotal: number | string
  dispatchedQty?: number
}

export type SalesOrderDetailDto = {
  id: number
  orderCode: string
  customerId: number
  customerName: string
  totalAmount: number | string
  discountAmount: number | string
  finalAmount: number | string
  status: string
  orderChannel: string
  paymentStatus: string
  parentOrderId?: number | null
  refSalesOrderId?: number | null
  shippingAddress?: string | null
  notes?: string | null
  posShiftRef?: string | null
  voucherId?: number | null
  voucherCode?: string | null
  cancelledAt?: string | null
  cancelledBy?: number | null
  createdAt: string
  updatedAt: string
  lines: SalesOrderDetailLineDto[]
}

export function postSalesOrder(body: SalesOrderCreateBody) {
  return apiJson<SalesOrderDetailDto>("/api/v1/sales-orders", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  })
}

/** Task060 — `POST /api/v1/sales-orders/retail/checkout` — body camelCase theo `RetailCheckoutRequest` (BE). */
export type RetailCheckoutLineBody = {
  productId: number
  unitId: number
  quantity: number
  unitPrice: number
}

export type RetailCheckoutRequestBody = {
  customerId?: number | null
  walkIn?: boolean
  lines: RetailCheckoutLineBody[]
  discountAmount?: number
  voucherCode?: string | null
  paymentStatus?: "Paid" | "Unpaid" | "Partial"
  notes?: string | null
  shiftReference?: string | null
}

export type PosCartCheckoutSnapshot = {
  cart: {
    productId: number
    unitId: number
    quantity: number
    unitPrice: number
  }[]
  customerId: number | null
  discount: number
  voucherCode: string | null
  paymentStatus: "Paid" | "Unpaid" | "Partial"
  notes?: string | null
  /** Ưu tiên hơn `sessionStorage` khi truyền. */
  shiftReference?: string | null
}

export function buildRetailCheckoutBody(snapshot: PosCartCheckoutSnapshot): RetailCheckoutRequestBody {
  const walkIn = snapshot.customerId == null
  const fromSession =
    typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem("posShiftReference")?.trim() || undefined
      : undefined
  const shiftRef = snapshot.shiftReference?.trim() || fromSession
  return {
    customerId: walkIn ? null : snapshot.customerId,
    walkIn,
    lines: snapshot.cart.map((l) => ({
      productId: l.productId,
      unitId: l.unitId,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
    })),
    discountAmount: snapshot.discount ?? 0,
    voucherCode: snapshot.voucherCode?.trim() ? snapshot.voucherCode.trim() : null,
    paymentStatus: snapshot.paymentStatus,
    notes: snapshot.notes ?? null,
    shiftReference: shiftRef || undefined,
  }
}

export function postRetailCheckout(body: RetailCheckoutRequestBody) {
  return apiJson<SalesOrderDetailDto>("/api/v1/sales-orders/retail/checkout", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  })
}

export function patchSalesOrder(id: number, body: SalesOrderPatchBody) {
  return apiJson<SalesOrderDetailDto>(`/api/v1/sales-orders/${id}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(body),
  })
}

/** Giá trị form chỉnh meta đơn (Wholesale / OrderFormDialog). */
export type SalesOrderMetaFormValues = {
  status: string
  paymentStatus: string
  shippingAddress?: string
  notes?: string
  discountAmount?: number | string
}

/** Task058 — `POST /api/v1/sales-orders/{id}/cancel` — BE `SalesOrderCancelBody` / API §3 dùng field JSON `reason` (max 500). */
export type SalesOrderCancelBodyInput = {
  reason?: string
  /** Alias (một số prompt nội bộ); gửi lên BE vẫn là `reason`. */
  cancelReason?: string
}

export type SalesOrderCancelResponseDto = {
  id: number
  status: string
  cancelledAt: string | null
  cancelledBy: number | null
}

export function postCancelSalesOrder(id: number, body?: SalesOrderCancelBodyInput) {
  const raw = body?.reason?.trim() || body?.cancelReason?.trim()
  const payload = raw ? { reason: raw.slice(0, 500) } : {}
  return apiJson<SalesOrderCancelResponseDto>(`/api/v1/sales-orders/${id}/cancel`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  })
}

/** Map UI "Completed" → BE `Delivered`; body luôn có ít nhất một field khi gọi PATCH. */
export function buildSalesOrderPatchBody(values: SalesOrderMetaFormValues): SalesOrderPatchBody {
  const status =
    values.status === "Completed" ? "Delivered" : values.status
  const disc =
    typeof values.discountAmount === "number"
      ? values.discountAmount
      : Number(values.discountAmount)
  const discountAmount = Number.isFinite(disc) ? disc : 0
  const ship = values.shippingAddress?.trim() ?? ""
  const n = values.notes?.trim() ?? ""
  return {
    status,
    paymentStatus: values.paymentStatus,
    shippingAddress: ship.length > 0 ? ship : null,
    notes: n.length > 0 ? n : null,
    discountAmount,
  }
}
