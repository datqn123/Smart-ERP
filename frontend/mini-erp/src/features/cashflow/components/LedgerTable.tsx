import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/features/inventory/utils"
import {
  DATA_TABLE_ROOT_CLASS,
  LEDGER_TABLE_COL,
  TABLE_HEAD_CLASS,
  TABLE_CELL_PRIMARY_CLASS,
  TABLE_CELL_SECONDARY_CLASS,
  TABLE_CELL_MONO_CLASS,
  TABLE_CELL_NUMBER_CLASS,
} from "@/lib/data-table-layout"
import { cn } from "@/lib/utils"
import type { LedgerEntry } from "../types"
import { ledgerReferenceTypeLabel, ledgerTransactionTypeLabel } from "../lib/ledgerDisplayLabels"

interface LedgerTableProps {
  data: LedgerEntry[]
}

function signedLedgerAmount(entry: LedgerEntry): number | null {
  if (typeof entry.amount === "number" && !Number.isNaN(entry.amount)) {
    return entry.amount
  }
  if (entry.credit > 0) return entry.credit
  if (entry.debit > 0) return -entry.debit
  return null
}

function formatSignedLedgerAmount(entry: LedgerEntry): string {
  const v = signedLedgerAmount(entry)
  if (v === null) return "—"
  const abs = Math.abs(v)
  const body = formatCurrency(abs)
  if (v > 0) return `+${body}`
  if (v < 0) return `−${body}`
  return body
}

export function LedgerTable({ data }: LedgerTableProps) {
  return (
    <Table className={DATA_TABLE_ROOT_CLASS}>
      <TableHeader className="sticky top-0 z-30 bg-slate-50 border-b shadow-sm">
        <TableRow className="hover:bg-transparent">
          <TableHead className={cn(LEDGER_TABLE_COL.date, TABLE_HEAD_CLASS, "px-4")}>Ngày</TableHead>
          <TableHead className={cn(LEDGER_TABLE_COL.type, TABLE_HEAD_CLASS, "px-4")}>Loại nghiệp vụ</TableHead>
          <TableHead className={cn(LEDGER_TABLE_COL.reference, TABLE_HEAD_CLASS, "px-4")}>Nguồn / Tham chiếu</TableHead>
          <TableHead className={cn(LEDGER_TABLE_COL.code, TABLE_HEAD_CLASS, "px-4")}>Số chứng từ</TableHead>
          <TableHead className={cn(LEDGER_TABLE_COL.description, TABLE_HEAD_CLASS, "px-4")}>Diễn giải</TableHead>
          <TableHead className={cn(LEDGER_TABLE_COL.amount, TABLE_HEAD_CLASS, "text-right px-4")}>Số tiền</TableHead>
          <TableHead className={cn(LEDGER_TABLE_COL.debit, TABLE_HEAD_CLASS, "text-right px-4")}>PS Nợ</TableHead>
          <TableHead className={cn(LEDGER_TABLE_COL.credit, TABLE_HEAD_CLASS, "text-right px-4")}>PS Có</TableHead>
          <TableHead className={cn(LEDGER_TABLE_COL.balance, TABLE_HEAD_CLASS, "text-right px-4")}>Số dư</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-slate-100">
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="h-64 text-center">
              <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                <p className="text-sm">Chưa có dữ liệu sổ cái</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => {
            const rawAmt = signedLedgerAmount(item)
            return (
              <TableRow key={item.id} className="hover:bg-slate-50/50 h-14 group">
                <TableCell className={cn(TABLE_CELL_SECONDARY_CLASS, "px-4 whitespace-nowrap")}>
                  {new Date(item.date).toLocaleDateString("vi-VN")}
                </TableCell>
                <TableCell className="px-4">
                  <Badge variant="outline" className="font-medium text-xs border-slate-200 bg-white text-slate-700">
                    {ledgerTransactionTypeLabel(item.transactionType)}
                  </Badge>
                </TableCell>
                <TableCell className={cn(TABLE_CELL_SECONDARY_CLASS, "px-4 text-xs")}>
                  <span className="font-medium text-slate-700">{ledgerReferenceTypeLabel(item.referenceType)}</span>
                  {item.referenceId != null && item.referenceId !== undefined ? (
                    <span className="text-slate-500"> · #{item.referenceId}</span>
                  ) : null}
                </TableCell>
                <TableCell className={cn(TABLE_CELL_MONO_CLASS, "px-4")}>{item.transactionCode}</TableCell>
                <TableCell className="px-4">
                  <span className={TABLE_CELL_PRIMARY_CLASS}>{item.description ?? "—"}</span>
                </TableCell>
                <TableCell
                  className={cn(
                    TABLE_CELL_NUMBER_CLASS,
                    "text-right px-4 font-semibold tabular-nums",
                    rawAmt != null && rawAmt > 0 && "text-emerald-700",
                    rawAmt != null && rawAmt < 0 && "text-rose-700",
                    rawAmt === 0 && "text-slate-600",
                  )}
                >
                  {formatSignedLedgerAmount(item)}
                </TableCell>
                <TableCell className={cn(TABLE_CELL_NUMBER_CLASS, "text-right px-4 text-rose-600")}>
                  {item.debit > 0 ? formatCurrency(item.debit) : "—"}
                </TableCell>
                <TableCell className={cn(TABLE_CELL_NUMBER_CLASS, "text-right px-4 text-emerald-600")}>
                  {item.credit > 0 ? formatCurrency(item.credit) : "—"}
                </TableCell>
                <TableCell className={cn(TABLE_CELL_NUMBER_CLASS, "text-right px-4 text-slate-900 font-bold")}>
                  {formatCurrency(item.balance)}
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}
