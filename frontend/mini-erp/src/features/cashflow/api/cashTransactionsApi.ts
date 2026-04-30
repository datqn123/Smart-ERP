import { apiJson } from "@/lib/api/http"
import type { CashTransaction } from "../types"

export const CASH_TRANSACTIONS_LIST_QUERY_KEY = ["cash-transactions", "list"] as const
export const CASH_TRANSACTION_DETAIL_QUERY_KEY = ["cash-transactions", "detail"] as const

export type CashTransactionsListPageDto = {
  items: CashTransaction[]
  page: number
  limit: number
  total: number
}

export type GetCashTransactionsListParams = {
  type?: "Income" | "Expense"
  status?: "Pending" | "Completed" | "Cancelled"
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  limit?: number
}

export function getCashTransactionsList(params: GetCashTransactionsListParams = {}) {
  const q = new URLSearchParams()
  if (params.type) q.set("type", params.type)
  if (params.status) q.set("status", params.status)
  if (params.dateFrom?.trim()) q.set("dateFrom", params.dateFrom.trim())
  if (params.dateTo?.trim()) q.set("dateTo", params.dateTo.trim())
  if (params.search?.trim()) q.set("search", params.search.trim())
  q.set("page", String(params.page ?? 1))
  q.set("limit", String(params.limit ?? 20))

  const qs = q.toString()
  return apiJson<CashTransactionsListPageDto>(`/api/v1/cash-transactions${qs ? `?${qs}` : ""}`, {
    method: "GET",
    auth: true,
  })
}

/** Task065 — POST body (không gửi `status`; server luôn Pending). */
export type CashTransactionCreateBody = {
  direction: "Income" | "Expense"
  amount: number
  category: string
  description?: string | null
  paymentMethod?: string
  transactionDate: string
}

export function postCashTransaction(body: CashTransactionCreateBody) {
  return apiJson<CashTransaction>("/api/v1/cash-transactions", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  })
}

/** Task066 — chi tiết một giao dịch (đủ `createdByName` / `performedByName`). */
export function getCashTransactionById(id: number) {
  return apiJson<CashTransaction>(`/api/v1/cash-transactions/${id}`, {
    method: "GET",
    auth: true,
  })
}

/** Task067 — partial JSON (BE: chỉ key được gửi). */
export function patchCashTransaction(id: number, body: Record<string, unknown>) {
  return apiJson<CashTransaction>(`/api/v1/cash-transactions/${id}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(body),
  })
}

/** Task068 — `data` envelope thường là `null`. */
export function deleteCashTransaction(id: number) {
  return apiJson<null>(`/api/v1/cash-transactions/${id}`, {
    method: "DELETE",
    auth: true,
  })
}
