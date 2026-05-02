import { apiJson } from "@/lib/api/http"

export const CASH_FUNDS_LIST_QUERY_KEY = ["cash-funds", "list"] as const

export type CashFundItem = {
  id: number
  code: string
  name: string
  isDefault: boolean
  isActive: boolean
}

export type CashFundsListDto = {
  items: CashFundItem[]
}

export function getCashFundsList() {
  return apiJson<CashFundsListDto>("/api/v1/cash-funds", { method: "GET", auth: true })
}
