/**
 * Khớp camelCase với API mini-ERP (docs/api API_Task063–072).
 */

/** `GET|POST|PATCH /cash-transactions` — Task064–067 */
export interface CashTransaction {
  id: number
  transactionCode: string
  direction: "Income" | "Expense"
  amount: number
  category: string
  description?: string | null
  paymentMethod?: string
  status: "Completed" | "Pending" | "Cancelled"
  /** Ngày nghiệp vụ (ISO `YYYY-MM-DD`) */
  transactionDate: string
  financeLedgerId?: number | null
  createdAt?: string
  updatedAt?: string
  createdBy?: number
}

/** Alias cũ — cùng kiểu với `CashTransaction` */
export type Transaction = CashTransaction

/** `GET|POST|PATCH /debts` — Task069–072 */
export interface PartnerDebt {
  id: number
  debtCode: string
  partnerType: "Customer" | "Supplier"
  /** Read-model từ join KH/NCC */
  partnerName: string
  customerId?: number | null
  supplierId?: number | null
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  dueDate?: string | null
  status: "InDebt" | "Cleared"
  notes?: string | null
  createdAt?: string
  updatedAt: string
}

export type Debt = PartnerDebt

/** `GET /finance-ledger` — Task063 */
export interface FinanceLedgerEntry {
  id: number
  date: string
  transactionCode: string
  description: string | null
  transactionType?: "SalesRevenue" | "PurchaseCost" | "OperatingExpense" | "Refund"
  referenceType?: string | null
  referenceId?: number | null
  amount?: number
  debit: number
  credit: number
  balance: number
}

export type LedgerEntry = FinanceLedgerEntry
