import { Package, Eye, Edit2, Trash2 } from "lucide-react"
import { formatCurrency, formatDate } from "../utils"
import type { StockReceipt } from "../types"
import { StatusBadge } from "./StatusBadge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DATA_TABLE_ROOT_CLASS,
  DATA_TABLE_ACTION_HEAD_CLASS,
  DATA_TABLE_ACTION_CELL_CLASS,
  RECEIPT_TABLE_COL,
  TABLE_HEAD_CLASS,
  TABLE_CELL_PRIMARY_CLASS,
  TABLE_CELL_SECONDARY_CLASS,
  TABLE_CELL_MONO_CLASS,
  TABLE_CELL_NUMBER_CLASS,
} from "@/lib/data-table-layout"

interface ReceiptTableProps {
  receipts: StockReceipt[]
  onAction: (receipt: StockReceipt) => void
  onEdit?: (receipt: StockReceipt) => void
  onDelete?: (id: number) => void
}

/**
 * Một bảng duy nhất (thead + tbody) — class cột lấy từ `@/lib/data-table-layout` (chuẩn dự án).
 */
export function ReceiptTable({ receipts, onAction, onEdit, onDelete }: ReceiptTableProps) {
  return (
    <Table data-testid="receipt-table" className={DATA_TABLE_ROOT_CLASS}>
      <TableHeader className="sticky top-0 z-20 shadow-sm border-b">
        <TableRow className="hover:bg-transparent border-b border-slate-200">
          <TableHead className={cn(RECEIPT_TABLE_COL.receiptCode, TABLE_HEAD_CLASS)}>Mã phiếu</TableHead>
          <TableHead className={cn(RECEIPT_TABLE_COL.supplierName, TABLE_HEAD_CLASS)}>Nhà cung cấp</TableHead>
          <TableHead className={cn(RECEIPT_TABLE_COL.receiptDate, TABLE_HEAD_CLASS)}>Ngày nhập</TableHead>
          <TableHead className={cn(RECEIPT_TABLE_COL.staffName, TABLE_HEAD_CLASS)}>Người tạo</TableHead>
          <TableHead className={cn(RECEIPT_TABLE_COL.invoiceNumber, TABLE_HEAD_CLASS)}>Số HĐ</TableHead>
          <TableHead className={cn(RECEIPT_TABLE_COL.lineCount, "text-center", TABLE_HEAD_CLASS)}>Dòng SP</TableHead>
          <TableHead className={cn(RECEIPT_TABLE_COL.totalAmount, "text-right", TABLE_HEAD_CLASS)}>Tổng tiền</TableHead>
          <TableHead className={cn(RECEIPT_TABLE_COL.status, "text-center", TABLE_HEAD_CLASS)}>Trạng thái</TableHead>
          <TableHead className={cn(DATA_TABLE_ACTION_HEAD_CLASS, TABLE_HEAD_CLASS)}>Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {receipts.map((receipt) => (
          <TableRow
            key={receipt.id}
            className="group hover:bg-slate-50/50 cursor-pointer h-16"
            onClick={() => onAction(receipt)}
          >
            <TableCell
              className={cn(RECEIPT_TABLE_COL.receiptCode, TABLE_CELL_MONO_CLASS)}
            >
              {receipt.receiptCode}
            </TableCell>
            <TableCell className={cn(RECEIPT_TABLE_COL.supplierName, TABLE_CELL_PRIMARY_CLASS, "truncate")}>
              {receipt.supplierName}
            </TableCell>
            <TableCell className={cn(RECEIPT_TABLE_COL.receiptDate, TABLE_CELL_SECONDARY_CLASS)}>
              {formatDate(receipt.receiptDate)}
            </TableCell>
            <TableCell className={cn(RECEIPT_TABLE_COL.staffName, TABLE_CELL_SECONDARY_CLASS)}>
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-6 w-6 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200 uppercase">
                  {receipt.staffName.split(" ").map((n) => n[0]).join("")}
                </div>
                <span className="truncate">{receipt.staffName}</span>
              </div>
            </TableCell>
            <TableCell className={cn(RECEIPT_TABLE_COL.invoiceNumber, TABLE_CELL_SECONDARY_CLASS, "italic text-xs")}>
              {receipt.invoiceNumber || "—"}
            </TableCell>
            <TableCell className={cn(RECEIPT_TABLE_COL.lineCount, "text-center")}>
              <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                <Package className="h-3 w-3 shrink-0" />
                {receipt.details.length}
              </div>
            </TableCell>
            <TableCell className={cn(RECEIPT_TABLE_COL.totalAmount, "text-right", TABLE_CELL_NUMBER_CLASS)}>
              {formatCurrency(receipt.totalAmount)}
            </TableCell>
            <TableCell className={cn(RECEIPT_TABLE_COL.status, "text-center")}>
              <StatusBadge status={receipt.status} />
            </TableCell>
            <TableCell className={DATA_TABLE_ACTION_CELL_CLASS} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-slate-900 transition-colors"
                  onClick={() => onAction(receipt)}
                  title="Xem chi tiết"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-slate-900 transition-colors"
                  onClick={() => onEdit?.(receipt)}
                  title="Sửa phiếu"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-red-600 transition-colors"
                  onClick={() => onDelete?.(receipt.id)}
                  title="Xóa phiếu"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
