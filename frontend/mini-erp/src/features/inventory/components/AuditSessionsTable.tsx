import { useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Edit2, Trash2 } from "lucide-react"
import { formatDate } from "../utils"
import type { AuditSession, AuditStatus } from "../types"
import { StatusBadge } from "./StatusBadge"
import { cn } from "@/lib/utils"
import {
  DATA_TABLE_ROOT_CLASS,
  DATA_TABLE_ACTION_HEAD_CLASS,
  DATA_TABLE_ACTION_CELL_CLASS,
  AUDIT_SESSION_TABLE_COL,
  TABLE_HEAD_CLASS,
  TABLE_CELL_PRIMARY_CLASS,
  TABLE_CELL_SECONDARY_CLASS,
  TABLE_CELL_MONO_CLASS,
  TABLE_CELL_NUMBER_CLASS,
} from "@/lib/data-table-layout"

/** Task027 — BE chỉ cho hủy khi Pending / In Progress / Pending Owner Approval. */
export function canRequestAuditSessionCancel(status: AuditStatus): boolean {
  return status === "Pending" || status === "In Progress" || status === "Pending Owner Approval"
}

/** Tiến độ / lệch: ưu tiên aggregate Task021 list; fallback mock / chi tiết Task023. */
export function auditSessionLineMetrics(session: AuditSession) {
  const hasApi =
    session.totalLines != null && session.countedLines != null && session.varianceLines != null
  if (hasApi) {
    return {
      total: session.totalLines!,
      counted: session.countedLines!,
      variance: session.varianceLines!,
    }
  }
  const counted = session.items.filter((i) => i.isCounted).length
  const variance = session.items.filter((i) => i.isCounted && i.variance !== 0).length
  return { total: session.items.length, counted, variance }
}

interface AuditSessionsTableProps {
  sessions: AuditSession[]
  onView?: (session: AuditSession) => void
  onEdit?: (session: AuditSession) => void
  /** Task027 — mở luồng hủy đợt (`POST …/cancel`); nút thùng rác trong cột thao tác. */
  onRequestCancel?: (session: AuditSession) => void
}

export function AuditSessionsTable({ sessions, onView, onEdit, onRequestCancel }: AuditSessionsTableProps) {
  const rows = useMemo(
    () =>
      sessions.map((session) => {
        const m = auditSessionLineMetrics(session)
        return { session, countedCount: m.counted, varianceCount: m.variance, lineTotal: m.total }
      }),
    [sessions],
  )

  return (
    <Table data-testid="audit-sessions-table" className={DATA_TABLE_ROOT_CLASS}>
      <TableHeader className="sticky top-0 z-30 bg-slate-50 shadow-sm">
        <TableRow className="hover:bg-transparent border-b border-slate-200">
          <TableHead className={cn(AUDIT_SESSION_TABLE_COL.auditCode, TABLE_HEAD_CLASS)}>Mã đợt</TableHead>
          <TableHead className={cn(AUDIT_SESSION_TABLE_COL.title, TABLE_HEAD_CLASS)}>Tên đợt kiểm kê</TableHead>
          <TableHead className={cn(AUDIT_SESSION_TABLE_COL.auditDate, TABLE_HEAD_CLASS)}>Ngày kiểm</TableHead>
          <TableHead className={cn(AUDIT_SESSION_TABLE_COL.createdByName, TABLE_HEAD_CLASS)}>Người tạo</TableHead>
          <TableHead className={cn(AUDIT_SESSION_TABLE_COL.progress, "text-center", TABLE_HEAD_CLASS)}>Tiến độ</TableHead>
          <TableHead className={cn(AUDIT_SESSION_TABLE_COL.varianceHint, "text-center", TABLE_HEAD_CLASS)}>Lệch dòng</TableHead>
          <TableHead className={cn(AUDIT_SESSION_TABLE_COL.status, "text-center", TABLE_HEAD_CLASS)}>Trạng thái</TableHead>
          <TableHead className={cn(DATA_TABLE_ACTION_HEAD_CLASS, TABLE_HEAD_CLASS)}>Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(({ session, countedCount, varianceCount, lineTotal }) => {
          const cancelAllowed = canRequestAuditSessionCancel(session.status)
          return (
          <TableRow key={session.id} className="group hover:bg-slate-50/50 border-b border-slate-100">
            <TableCell className={cn(AUDIT_SESSION_TABLE_COL.auditCode, TABLE_CELL_MONO_CLASS)}>
              {session.auditCode}
            </TableCell>
            <TableCell className={cn(AUDIT_SESSION_TABLE_COL.title, TABLE_CELL_PRIMARY_CLASS, "truncate")}>
              {session.title}
            </TableCell>
            <TableCell className={cn(AUDIT_SESSION_TABLE_COL.auditDate, TABLE_CELL_SECONDARY_CLASS)}>
              {formatDate(session.auditDate)}
            </TableCell>
            <TableCell className={cn(AUDIT_SESSION_TABLE_COL.createdByName, TABLE_CELL_SECONDARY_CLASS, "truncate")}>
              {session.createdByName}
            </TableCell>
            <TableCell className={cn(AUDIT_SESSION_TABLE_COL.progress, "text-center", TABLE_CELL_NUMBER_CLASS)}>
              <span className="tabular-nums font-mono">
                {countedCount}/{lineTotal}
              </span>
            </TableCell>
            <TableCell className={cn(AUDIT_SESSION_TABLE_COL.varianceHint, "text-center", TABLE_CELL_NUMBER_CLASS, "tabular-nums font-mono")}>
              {varianceCount}
            </TableCell>
            <TableCell className={cn(AUDIT_SESSION_TABLE_COL.status, "text-center")}>
              <StatusBadge status={session.status} type="audit" />
            </TableCell>
            <TableCell className={DATA_TABLE_ACTION_CELL_CLASS}>
              <div className="flex items-center justify-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-slate-900 transition-colors"
                  onClick={() => onView?.(session)}
                  title="Xem chi tiết"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-slate-900 transition-colors"
                  onClick={() => onEdit?.(session)}
                  title="Sửa phiếu"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-red-600 transition-colors disabled:opacity-40 disabled:hover:text-slate-500"
                  disabled={!cancelAllowed}
                  onClick={() => onRequestCancel?.(session)}
                  title={
                    cancelAllowed
                      ? "Hủy đợt kiểm kê (cần lý do)"
                      : "Chỉ hủy được khi Chờ kiểm / Đang kiểm / Chờ duyệt Owner"
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
