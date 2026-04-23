import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/features/inventory/utils"
import { 
  DATA_TABLE_ROOT_CLASS, 
  LEDGER_TABLE_COL,
  TABLE_HEAD_CLASS,
  TABLE_CELL_PRIMARY_CLASS,
  TABLE_CELL_SECONDARY_CLASS,
  TABLE_CELL_MONO_CLASS,
  TABLE_CELL_NUMBER_CLASS
} from "@/lib/data-table-layout"
import { cn } from "@/lib/utils"
import type { LedgerEntry } from "../types"

interface LedgerTableProps {
  data: LedgerEntry[]
}

export function LedgerTable({ data }: LedgerTableProps) {
  return (
    <Table className={DATA_TABLE_ROOT_CLASS}>
      <TableHeader className="sticky top-0 z-30 bg-slate-50 border-b shadow-sm">
        <TableRow className="hover:bg-transparent">
          <TableHead className={cn(LEDGER_TABLE_COL.date, TABLE_HEAD_CLASS, "px-4")}>Ngày</TableHead>
          <TableHead className={cn(LEDGER_TABLE_COL.code, TABLE_HEAD_CLASS, "px-4")}>Số chứng từ</TableHead>
          <TableHead className={cn(LEDGER_TABLE_COL.description, TABLE_HEAD_CLASS, "px-4")}>Diễn giải</TableHead>
          <TableHead className={cn(LEDGER_TABLE_COL.debit, TABLE_HEAD_CLASS, "text-right px-4")}>Phát sinh Nợ</TableHead>
          <TableHead className={cn(LEDGER_TABLE_COL.credit, TABLE_HEAD_CLASS, "text-right px-4")}>Phát sinh Có</TableHead>
          <TableHead className={cn(LEDGER_TABLE_COL.balance, TABLE_HEAD_CLASS, "text-right px-4")}>Số dư</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-slate-100">
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="h-64 text-center">
              <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                <p className="text-sm">Chưa có dữ liệu sổ cái</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => (
            <TableRow key={item.id} className="hover:bg-slate-50/50 h-14 group">
              <TableCell className={cn(TABLE_CELL_SECONDARY_CLASS, "px-4")}>
                {new Date(item.date).toLocaleDateString('vi-VN')}
              </TableCell>
              <TableCell className={cn(TABLE_CELL_MONO_CLASS, "px-4")}>{item.transactionCode}</TableCell>
              <TableCell className="px-4">
                <span className={TABLE_CELL_PRIMARY_CLASS}>{item.description}</span>
              </TableCell>
              <TableCell className={cn(TABLE_CELL_NUMBER_CLASS, "text-right px-4 text-rose-600")}>
                {item.debit > 0 ? formatCurrency(item.debit) : "-"}
              </TableCell>
              <TableCell className={cn(TABLE_CELL_NUMBER_CLASS, "text-right px-4 text-emerald-600")}>
                {item.credit > 0 ? formatCurrency(item.credit) : "-"}
              </TableCell>
              <TableCell className={cn(TABLE_CELL_NUMBER_CLASS, "text-right px-4 text-slate-900 font-bold")}>
                {formatCurrency(item.balance)}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
