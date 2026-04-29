import { apiJson } from "@/lib/api/http"
import type { FinanceLedgerEntry } from "../types"

export const FINANCE_LEDGER_LIST_QUERY_KEY = ["finance-ledger", "list"] as const

export type FinanceLedgerListPageDto = {
  items: FinanceLedgerEntry[]
  page: number
  limit: number
  total: number
}

export type GetFinanceLedgerListParams = {
  dateFrom?: string
  dateTo?: string
  transactionType?: "SalesRevenue" | "PurchaseCost" | "OperatingExpense" | "Refund"
  referenceType?: string
  search?: string
  page?: number
  limit?: number
}

export function getFinanceLedgerList(params: GetFinanceLedgerListParams = {}) {
  const q = new URLSearchParams()
  if (params.dateFrom?.trim()) q.set("dateFrom", params.dateFrom.trim())
  if (params.dateTo?.trim()) q.set("dateTo", params.dateTo.trim())
  if (params.transactionType) q.set("transactionType", params.transactionType)
  if (params.referenceType?.trim()) q.set("referenceType", params.referenceType.trim())
  if (params.search?.trim()) q.set("search", params.search.trim())
  q.set("page", String(params.page ?? 1))
  q.set("limit", String(params.limit ?? 20))

  const qs = q.toString()
  return apiJson<FinanceLedgerListPageDto>(`/api/v1/finance-ledger${qs ? `?${qs}` : ""}`, {
    method: "GET",
    auth: true,
  })
}

