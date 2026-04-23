import { Fragment, useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  TrendingUp,
  Minus,
  Eye,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import { formatDate } from "../utils"
import type { AuditSession, AuditItem } from "../types"
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

function VarianceBadge({ variance, variancePercent }: { variance: number; variancePercent: number }) {
  if (variance === 0)
    return (
      <Badge className="inline-flex items-center bg-green-50 text-green-700 text-xs border-0 font-normal">
        ✓ Khớp
      </Badge>
    )
  if (variance > 0)
    return (
      <Badge className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-700 text-xs border-0 font-normal">
        <TrendingUp className="h-3 w-3 shrink-0" />+{variance} ({variancePercent.toFixed(1)}%)
      </Badge>
    )
  return (
    <Badge className="inline-flex items-center gap-0.5 bg-red-50 text-red-700 text-xs border-0 font-normal">
      <Minus className="h-3 w-3 shrink-0" />
      {variance} ({variancePercent.toFixed(1)}%)
    </Badge>
  )
}

function AuditSessionItemsPanel({ session }: { session: AuditSession }) {
  const [editingItem, setEditingItem] = useState<number | null>(null)
  const [actualQty, setActualQty] = useState("")
  const countedCount = session.items.filter((i) => i.isCounted).length
  const varianceCount = session.items.filter((i) => i.isCounted && i.variance !== 0).length

  return (
    <div className="space-y-4 border-t border-slate-100 bg-slate-50/40 px-4 py-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 text-center rounded-md border border-slate-100">
          <p className="text-xs text-slate-500">Tổng hàng</p>
          <p className="text-lg font-semibold">{session.items.length}</p>
        </div>
        <div className="bg-green-50 p-3 text-center rounded-md border border-green-100">
          <p className="text-xs text-green-600">Đã kiểm</p>
          <p className="text-lg font-semibold text-green-700">{countedCount}</p>
        </div>
        <div className="bg-white p-3 text-center rounded-md border border-slate-100">
          <p className="text-xs text-slate-500">Chưa kiểm</p>
          <p className="text-lg font-semibold">{session.items.length - countedCount}</p>
        </div>
        <div className="bg-amber-50 p-3 text-center rounded-md border border-amber-100">
          <p className="text-xs text-amber-600">Chênh lệch</p>
          <p className="text-lg font-semibold text-amber-700">{varianceCount}</p>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1 text-slate-600">
          <span>Tiến độ</span>
          <span>
            {session.items.length > 0 ? Math.round((countedCount / session.items.length) * 100) : 0}%
          </span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-green-500 h-2 transition-all rounded-full"
            style={{
              width: `${session.items.length > 0 ? (countedCount / session.items.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>
      {session.items.length > 0 && (
        <div className="space-y-2">
          {session.items.map((item: AuditItem) => (
            <div key={item.id} className="border border-slate-200 p-3 rounded-md bg-white">
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="min-w-0">
                  <p className={TABLE_CELL_PRIMARY_CLASS}>{item.productName}</p>
                  <p className={cn(TABLE_CELL_MONO_CLASS, "text-[10px] text-slate-400")}>
                    {item.skuCode} • {item.warehouseCode}-{item.shelfCode}
                  </p>
                </div>
                <VarianceBadge variance={item.variance} variancePercent={item.variancePercent} />
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-slate-500">Tồn HT</p>
                  <p className="font-semibold text-slate-900">{item.systemQuantity}</p>
                </div>
                <div>
                  <p className="text-slate-500">Thực tế</p>
                  {editingItem === item.id ? (
                    <Input
                      type="number"
                      min={0}
                      value={actualQty}
                      onChange={(e) => setActualQty(e.target.value)}
                      className="h-7 text-sm w-20 mt-0.5"
                      autoFocus
                      onBlur={() => setEditingItem(null)}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItem(item.id)
                        setActualQty(String(item.actualQuantity ?? ""))
                      }}
                      className="font-semibold text-slate-900 hover:text-blue-600 mt-0.5 block text-left"
                    >
                      {item.isCounted ? item.actualQuantity : "Nhập"}
                    </button>
                  )}
                </div>
                <div>
                  <p className="text-slate-500">Trạng thái</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {item.isCounted ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        <span className="text-green-700">Đã kiểm</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span className="text-amber-600">Chưa kiểm</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="text-xs text-slate-500 space-y-1">
        <p>
          Người tạo: {session.createdByName} • Ngày kiểm: {formatDate(session.auditDate)}
        </p>
        {session.completedByName && (
          <p>
            Hoàn thành bởi: {session.completedByName} • {session.completedAt ? formatDate(session.completedAt) : ""}
          </p>
        )}
      </div>
    </div>
  )
}

interface AuditSessionsTableProps {
  sessions: AuditSession[]
  onView?: (session: AuditSession) => void
  onEdit?: (session: AuditSession) => void
  onDelete?: (id: number) => void
}

export function AuditSessionsTable({ sessions, onView, onEdit, onDelete }: AuditSessionsTableProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const toggle = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const rows = useMemo(
    () =>
      sessions.map((session) => {
        const countedCount = session.items.filter((i) => i.isCounted).length
        const varianceCount = session.items.filter((i) => i.isCounted && i.variance !== 0).length
        const isOpen = expanded.has(session.id)
        return { session, countedCount, varianceCount, isOpen }
      }),
    [sessions, expanded]
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
        {rows.map(({ session, countedCount, varianceCount, isOpen }) => (
          <Fragment key={session.id}>
            <TableRow
              className="group hover:bg-slate-50/50 cursor-pointer border-b border-slate-100"
              onClick={() => toggle(session.id)}
            >
              <TableCell
                className={cn(AUDIT_SESSION_TABLE_COL.auditCode, TABLE_CELL_MONO_CLASS)}
              >
                <div className="flex items-center gap-2">
                  {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-blue-600" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                  {session.auditCode}
                </div>
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
                  {countedCount}/{session.items.length}
                </span>
              </TableCell>
              <TableCell className={cn(AUDIT_SESSION_TABLE_COL.varianceHint, "text-center", TABLE_CELL_NUMBER_CLASS, "tabular-nums font-mono")}>
                {varianceCount}
              </TableCell>
              <TableCell className={cn(AUDIT_SESSION_TABLE_COL.status, "text-center")}>
                <StatusBadge status={session.status} type="audit" />
              </TableCell>
              <TableCell className={DATA_TABLE_ACTION_CELL_CLASS} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-slate-900 transition-colors"
                    onClick={() => {
                      toggle(session.id)
                      onView?.(session)
                    }}
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
                    className="h-8 w-8 text-slate-500 hover:text-red-600 transition-colors"
                    onClick={() => onDelete?.(session.id)}
                    title="Xóa phiếu"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            {isOpen && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="p-0 border-b border-slate-200">
                  <AuditSessionItemsPanel session={session} />
                </TableCell>
              </TableRow>
            )}
          </Fragment>
        ))}
      </TableBody>
    </Table>
  )
}
