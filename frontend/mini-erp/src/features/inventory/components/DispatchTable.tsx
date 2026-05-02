import { AlertCircle, Eye, Package, Edit2, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./StatusBadge"
import { formatDate } from "../utils"
import type { StockDispatch } from "../types"
import { cn } from "@/lib/utils"
import {
  DATA_TABLE_ROOT_CLASS,
  DATA_TABLE_ACTION_HEAD_CLASS,
  DATA_TABLE_ACTION_CELL_CLASS,
  DISPATCH_TABLE_COL,
  TABLE_HEAD_CLASS,
  TABLE_CELL_PRIMARY_CLASS,
  TABLE_CELL_SECONDARY_CLASS,
  TABLE_CELL_MONO_CLASS,
  TABLE_CELL_NUMBER_CLASS,
} from "@/lib/data-table-layout"

interface DispatchTableProps {
  dispatches: StockDispatch[]
  onAction: (dispatch: StockDispatch) => void
  onEdit?: (dispatch: StockDispatch) => void
  onDelete?: (id: number) => void
}

/**
 * Một bảng duy nhất (thead + tbody) — class cột từ `@/lib/data-table-layout`.
 */
export function DispatchTable({ dispatches, onAction, onEdit, onDelete }: DispatchTableProps) {
  return (
    <Table data-testid="dispatch-table" className={DATA_TABLE_ROOT_CLASS}>
      <TableHeader className="sticky top-0 z-20 bg-slate-50 shadow-sm border-b">
        <TableRow className="hover:bg-transparent border-b border-slate-200">
          <TableHead className={cn(DISPATCH_TABLE_COL.dispatchCode, TABLE_HEAD_CLASS)}>Mã phiếu</TableHead>
          <TableHead className={cn(DISPATCH_TABLE_COL.orderCode, TABLE_HEAD_CLASS)}>Mã đơn hàng</TableHead>
          <TableHead className={cn(DISPATCH_TABLE_COL.customerName, TABLE_HEAD_CLASS)}>Khách hàng</TableHead>
          <TableHead className={cn(DISPATCH_TABLE_COL.dispatchDate, TABLE_HEAD_CLASS)}>Ngày xuất</TableHead>
          <TableHead className={cn(DISPATCH_TABLE_COL.userName, TABLE_HEAD_CLASS)}>Người xuất</TableHead>
          <TableHead className={cn(DISPATCH_TABLE_COL.itemCount, "text-center", TABLE_HEAD_CLASS)}>Số lượng</TableHead>
          <TableHead className={cn(DISPATCH_TABLE_COL.status, "text-center", TABLE_HEAD_CLASS)}>Trạng thái</TableHead>
          <TableHead className={cn(DATA_TABLE_ACTION_HEAD_CLASS, TABLE_HEAD_CLASS)}>Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dispatches.map((dispatch) => (
          <TableRow
            key={dispatch.id}
            className="group hover:bg-slate-50/50 transition-colors cursor-pointer h-16"
            onClick={() => onAction(dispatch)}
          >
            <TableCell
              className={cn(DISPATCH_TABLE_COL.dispatchCode, TABLE_CELL_MONO_CLASS)}
            >
              {dispatch.dispatchCode}
            </TableCell>
            <TableCell className={cn(DISPATCH_TABLE_COL.orderCode, TABLE_CELL_MONO_CLASS, "truncate")}>
              {dispatch.orderCode}
            </TableCell>
            <TableCell className={cn(DISPATCH_TABLE_COL.customerName, TABLE_CELL_PRIMARY_CLASS, "truncate min-w-0")}>
              {dispatch.customerName}
            </TableCell>
            <TableCell className={cn(DISPATCH_TABLE_COL.dispatchDate, TABLE_CELL_SECONDARY_CLASS)}>
              {formatDate(dispatch.dispatchDate)}
            </TableCell>
            <TableCell className={cn(DISPATCH_TABLE_COL.userName, TABLE_CELL_SECONDARY_CLASS)}>
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-6 w-6 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200 uppercase">
                  {dispatch.userName.split(" ").map((n) => n[0]).join("")}
                </div>
                <span className="truncate">{dispatch.userName}</span>
              </div>
            </TableCell>
            <TableCell className={cn(DISPATCH_TABLE_COL.itemCount, "text-center")}>
              <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                <Package className="h-3 w-3 shrink-0" />
                {dispatch.lineCount ?? dispatch.items.length}
              </div>
            </TableCell>
            <TableCell className={cn(DISPATCH_TABLE_COL.status, "text-center")}>
              <div className="inline-flex items-center justify-center gap-1">
                {dispatch.shortageWarning && (
                  <span title="Thiếu hàng so với tồn">
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" aria-hidden />
                  </span>
                )}
                <StatusBadge status={dispatch.status} type="dispatch" shortageWarning={dispatch.shortageWarning} />
              </div>
            </TableCell>
            <TableCell className={DATA_TABLE_ACTION_CELL_CLASS} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-slate-900 transition-colors"
                  onClick={() => onAction(dispatch)}
                  title="Xem chi tiết"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {onEdit != null && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 transition-colors",
                      dispatch.canEdit === true
                        ? "text-slate-500 hover:text-slate-900"
                        : "text-slate-300 cursor-not-allowed",
                    )}
                    disabled={dispatch.canEdit !== true}
                    onClick={() => onEdit(dispatch)}
                    title={
                      dispatch.canEdit === true
                        ? "Sửa phiếu"
                        : "Chỉ người tạo hoặc Owner/Admin; không sửa khi đã giao (Delivered) / đã hoàn tất xuất (Full)."
                    }
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
                {onDelete != null && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 transition-colors",
                      dispatch.canDelete === true
                        ? "text-slate-500 hover:text-red-600"
                        : "text-slate-300 cursor-not-allowed",
                    )}
                    disabled={dispatch.canDelete !== true}
                    onClick={() => onDelete(dispatch.id)}
                    title={
                      dispatch.canDelete === true
                        ? "Xóa mềm phiếu"
                        : "Chỉ người tạo hoặc Owner/Admin; không xóa khi đã giao (Delivered) / đã hoàn tất xuất (Full)."
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
