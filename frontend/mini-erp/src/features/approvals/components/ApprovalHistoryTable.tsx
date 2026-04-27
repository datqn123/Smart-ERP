import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/features/inventory/utils"
import { Eye } from "lucide-react"
import {
  DATA_TABLE_ROOT_CLASS,
  DATA_TABLE_ACTION_CELL_CLASS,
  DATA_TABLE_ACTION_HEAD_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_CELL_PRIMARY_CLASS,
  TABLE_CELL_SECONDARY_CLASS,
  TABLE_CELL_MONO_CLASS,
  TABLE_CELL_NUMBER_CLASS,
} from "@/lib/data-table-layout"
import { cn } from "@/lib/utils"
import type { ApprovalsHistoryItem } from "../api/approvalsApi"

function formatDt(iso: string | undefined | null): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

function ResolutionBadge({ resolution }: { resolution: string }) {
  if (resolution === "Approved") {
    return <Badge className="bg-emerald-50 text-emerald-800 text-xs border border-emerald-200 font-semibold">Đã phê duyệt</Badge>
  }
  if (resolution === "Rejected") {
    return <Badge className="bg-red-50 text-red-800 text-xs border border-red-200 font-semibold">Đã từ chối</Badge>
  }
  return <Badge variant="secondary">{resolution}</Badge>
}

function toNumber(v: number | string): number {
  return typeof v === "number" ? v : Number(v)
}

type Props = {
  items: ApprovalsHistoryItem[]
  onView: (row: ApprovalsHistoryItem) => void
}

export function ApprovalHistoryTable({ items, onView }: Props) {
  return (
    <Table className={DATA_TABLE_ROOT_CLASS}>
      <TableHeader className="sticky top-0 z-30 bg-slate-50 shadow-sm border-b">
        <TableRow className="hover:bg-transparent border-slate-200 border-b">
          <TableHead className={cn(TABLE_HEAD_CLASS, "px-4 min-w-[120px]")}>Mã chứng từ</TableHead>
          <TableHead className={cn(TABLE_HEAD_CLASS, "px-4 min-w-[140px]")}>Người tạo</TableHead>
          <TableHead className={cn(TABLE_HEAD_CLASS, "px-4 w-[110px]")}>Ngày phiếu</TableHead>
          <TableHead className={cn(TABLE_HEAD_CLASS, "px-4 min-w-[140px]")}>Thời điểm xử lý</TableHead>
          <TableHead className={cn(TABLE_HEAD_CLASS, "text-center px-4 w-[120px]")}>Kết quả</TableHead>
          <TableHead className={cn(TABLE_HEAD_CLASS, "px-4 min-w-[120px]")}>Người xử lý</TableHead>
          <TableHead className={cn(TABLE_HEAD_CLASS, "px-4 min-w-[160px]")}>Lý do từ chối</TableHead>
          <TableHead className={cn(TABLE_HEAD_CLASS, "text-right px-4 w-[120px]")}>Tổng tiền</TableHead>
          <TableHead className={cn(DATA_TABLE_ACTION_HEAD_CLASS, TABLE_HEAD_CLASS)}>Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-slate-100">
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="h-48 text-center text-slate-500 text-sm font-medium">
              Không có bản ghi lịch sử phê duyệt.
            </TableCell>
          </TableRow>
        ) : (
          items.map((row) => (
            <TableRow key={`${row.entityType}-${row.entityId}`} className="group h-16 hover:bg-slate-50/50">
              <TableCell className={cn(TABLE_CELL_MONO_CLASS, "px-4 font-mono text-sm")}>{row.transactionCode}</TableCell>
              <TableCell className={cn(TABLE_CELL_PRIMARY_CLASS, "px-4 max-w-[200px] truncate")}>{row.creatorName}</TableCell>
              <TableCell className={cn(TABLE_CELL_SECONDARY_CLASS, "px-4 text-sm")}>{formatDt(row.date)}</TableCell>
              <TableCell className={cn(TABLE_CELL_SECONDARY_CLASS, "px-4 text-sm")}>{formatDt(row.reviewedAt)}</TableCell>
              <TableCell className="px-4 text-center">
                <ResolutionBadge resolution={row.resolution} />
              </TableCell>
              <TableCell className={cn(TABLE_CELL_SECONDARY_CLASS, "px-4 max-w-[160px] truncate")}>
                {row.reviewerName?.trim() || "—"}
              </TableCell>
              <TableCell
                className={cn(
                  "px-4 text-sm max-w-[220px]",
                  row.rejectionReason ? "text-red-700 font-medium" : TABLE_CELL_SECONDARY_CLASS,
                )}
                title={row.rejectionReason ?? undefined}
              >
                {row.rejectionReason?.trim() || "—"}
              </TableCell>
              <TableCell className={cn(TABLE_CELL_NUMBER_CLASS, "text-right px-4")}>{formatCurrency(toNumber(row.totalAmount))}</TableCell>
              <TableCell className={DATA_TABLE_ACTION_CELL_CLASS}>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => onView(row)}
                  title="Xem tóm tắt"
                  className="h-8 w-8 text-slate-400 hover:text-slate-900"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
