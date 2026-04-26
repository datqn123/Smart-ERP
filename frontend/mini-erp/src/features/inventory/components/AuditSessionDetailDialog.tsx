import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "./StatusBadge"
import { formatDate, formatDateTime } from "../utils"
import type { AuditItem, AuditSession } from "../types"
import type { AuditLinesPatchBody } from "../api/auditSessionsApi"
import { toast } from "sonner"
import {
  DATA_TABLE_ROOT_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_CELL_PRIMARY_CLASS,
  TABLE_CELL_SECONDARY_CLASS,
  TABLE_CELL_MONO_CLASS,
  TABLE_CELL_NUMBER_CLASS,
} from "@/lib/data-table-layout"
import { cn } from "@/lib/utils"
import { FORM_LABEL_CLASS, FORM_INPUT_CLASS } from "@/lib/data-table-layout"

export interface AuditSessionDetailDialogProps {
  open: boolean
  onClose: () => void
  /** Dữ liệu đầy đủ sau `GET …/{id}` (có `items`). */
  session: AuditSession | null
  /** Một dòng list (Task021) để hiển thị mã/tên khi đang tải chi tiết. */
  listHint: AuditSession | null
  isLoading: boolean
  isError: boolean
  errorMessage?: string
  /** Task025 — ghi `actualQuantity` / `notes` từng dòng (In Progress / Re-check). */
  onPatchLines?: (sessionId: number, body: AuditLinesPatchBody) => Promise<void>
  linesPatchPending?: boolean
}

function readOnlyClass(disabled: boolean) {
  return cn(FORM_INPUT_CLASS, disabled && "bg-slate-50 text-slate-800 cursor-default")
}

/** BE `AuditSessionService.patchLines` — chỉ In Progress hoặc Re-check. */
function canCountAuditLines(session: AuditSession | null): boolean {
  if (!session) return false
  return session.status === "In Progress" || session.status === "Re-check"
}

interface LineCountEditorRowProps {
  row: AuditItem
  sessionId: number
  onPatchLines: (sessionId: number, body: AuditLinesPatchBody) => Promise<void>
  disabled: boolean
}

function LineCountEditorRow({ row, sessionId, onPatchLines, disabled }: LineCountEditorRowProps) {
  const [actual, setActual] = useState(() => (row.actualQuantity != null ? String(row.actualQuantity) : ""))
  const [notes, setNotes] = useState(row.notes ?? "")

  useEffect(() => {
    setActual(row.actualQuantity != null ? String(row.actualQuantity) : "")
    setNotes(row.notes ?? "")
  }, [row.id, row.actualQuantity, row.notes])

  const persist = async () => {
    const raw = actual.trim().replace(",", ".")
    if (raw === "" || Number.isNaN(Number(raw))) {
      toast.error("Nhập số thực tế (≥ 0)")
      return
    }
    const num = Number(raw)
    if (!Number.isFinite(num) || num < 0) {
      toast.error("Số thực tế không hợp lệ")
      return
    }
    const notesTrim = notes.trim()
    const notesOut = notesTrim === "" ? null : notesTrim.slice(0, 500)
    const sameActual = row.actualQuantity != null && Number(row.actualQuantity) === num
    const sameNotes = (row.notes ?? "").trim() === (notesOut ?? "").trim()
    if (sameActual && sameNotes) {
      toast.info("Chưa có thay đổi")
      return
    }
    try {
      await onPatchLines(sessionId, {
        lines: [{ lineId: row.id, actualQuantity: num, notes: notesOut }],
      })
    } catch {
      /* lỗi: toast từ mutation ở page */
    }
  }

  return (
    <TableRow className="border-b border-slate-100">
      <TableCell className={cn(TABLE_CELL_MONO_CLASS, "text-xs align-top pt-3")}>{row.skuCode}</TableCell>
      <TableCell className={cn(TABLE_CELL_PRIMARY_CLASS, "max-w-[180px] align-top pt-3")}>
        <span className="line-clamp-2">{row.productName}</span>
      </TableCell>
      <TableCell className={cn(TABLE_CELL_SECONDARY_CLASS, "align-top pt-3")}>
        {row.warehouseCode}-{row.shelfCode}
      </TableCell>
      <TableCell className={cn(TABLE_CELL_NUMBER_CLASS, "text-right tabular-nums align-top pt-3")}>
        {row.systemQuantity}
      </TableCell>
      <TableCell className="align-top py-2">
        <Input
          type="text"
          inputMode="decimal"
          className={cn(FORM_INPUT_CLASS, "h-9 w-[88px] text-right tabular-nums ml-auto")}
          value={actual}
          onChange={(e) => setActual(e.target.value)}
          disabled={disabled}
          aria-label={`Thực tế ${row.skuCode}`}
        />
      </TableCell>
      <TableCell className="align-top py-2 min-w-[140px]">
        <Input
          className={cn(FORM_INPUT_CLASS, "h-9 text-xs")}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={disabled}
          maxLength={500}
          placeholder="Ghi chú dòng"
          aria-label={`Ghi chú ${row.skuCode}`}
        />
      </TableCell>
      <TableCell className="align-top py-2">
        <Button type="button" size="sm" className="h-9 shrink-0" onClick={() => void persist()} disabled={disabled}>
          Lưu
        </Button>
      </TableCell>
      <TableCell className={cn(TABLE_CELL_NUMBER_CLASS, "text-right tabular-nums align-top pt-3")}>
        {row.variance}
        {row.variancePercent !== 0 && (
          <span className="text-slate-400 text-xs ml-1">({row.variancePercent.toFixed(2)}%)</span>
        )}
      </TableCell>
      <TableCell className="text-center text-sm align-top pt-3">{row.isCounted ? "Có" : "Chưa"}</TableCell>
    </TableRow>
  )
}

export function AuditSessionDetailDialog({
  open,
  onClose,
  session,
  listHint,
  isLoading,
  isError,
  errorMessage,
  onPatchLines,
  linesPatchPending = false,
}: AuditSessionDetailDialogProps) {
  const header = session ?? listHint
  const lines = session?.items ?? []
  const allowLineEdits = Boolean(onPatchLines) && canCountAuditLines(session)
  const showPendingHint = session?.status === "Pending" && lines.length > 0 && Boolean(onPatchLines)

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto gap-4">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            {header && <StatusBadge status={header.status} type="audit" />}
            {header && (
              <span className="text-xs font-mono text-slate-500">{header.auditCode}</span>
            )}
          </div>
          <DialogTitle className="text-left text-xl font-semibold text-slate-900">
            Chi tiết đợt kiểm kê
          </DialogTitle>
          <DialogDescription className="text-left text-slate-600">
            {header?.title ?? "—"} · Ngày kiểm: {header ? formatDate(header.auditDate) : "—"}
          </DialogDescription>
        </DialogHeader>

        {header && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-slate-200 rounded-lg p-4 bg-slate-50/50">
            <div className="space-y-1.5">
              <Label className={FORM_LABEL_CLASS}>Người tạo</Label>
              <Input readOnly className={readOnlyClass(true)} value={header.createdByName} />
            </div>
            <div className="space-y-1.5">
              <Label className={FORM_LABEL_CLASS}>Cập nhật</Label>
              <Input readOnly className={readOnlyClass(true)} value={formatDateTime(header.updatedAt)} />
            </div>
            {header.completedByName && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label className={FORM_LABEL_CLASS}>Hoàn thành</Label>
                <Input
                  readOnly
                  className={readOnlyClass(true)}
                  value={`${header.completedByName}${header.completedAt ? ` · ${formatDateTime(header.completedAt)}` : ""}`}
                />
              </div>
            )}
            {(header.notes || header.locationFilter || header.categoryFilter) && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label className={FORM_LABEL_CLASS}>Ghi chú / phạm vi</Label>
                <Textarea
                  readOnly
                  className={cn(readOnlyClass(true), "min-h-[72px]")}
                  value={
                    [
                      header.notes?.trim(),
                      header.locationFilter ? `Vị trí: ${header.locationFilter}` : "",
                      header.categoryFilter ? `Danh mục: ${header.categoryFilter}` : "",
                    ]
                      .filter(Boolean)
                      .join("\n") || "—"
                  }
                />
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-800">Dòng kiểm kê ({lines.length})</h3>
          {showPendingHint && (
            <p className="text-xs text-amber-900 bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
              Đợt đang <strong className="font-medium">Chờ kiểm</strong>: chuyển sang <strong className="font-medium">Đang kiểm</strong> (cập nhật đợt — Task024) để ghi số thực tế từng dòng (Task025).
            </p>
          )}
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-slate-300 border-t-slate-900 rounded-full" />
            </div>
          )}
          {isError && (
            <p className="text-sm text-red-600 border border-red-100 bg-red-50 rounded-md p-3">
              {errorMessage ?? "Không tải được chi tiết đợt kiểm kê."}
            </p>
          )}
          {!isLoading && !isError && lines.length === 0 && session && (
            <p className="text-sm text-slate-500">Không có dòng snapshot nào.</p>
          )}
          {!isLoading && !isError && lines.length > 0 && !allowLineEdits && (
            <Table className={cn(DATA_TABLE_ROOT_CLASS, "border border-slate-200 rounded-md")}>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className={TABLE_HEAD_CLASS}>SKU</TableHead>
                  <TableHead className={TABLE_HEAD_CLASS}>Sản phẩm</TableHead>
                  <TableHead className={TABLE_HEAD_CLASS}>Vị trí</TableHead>
                  <TableHead className={cn(TABLE_HEAD_CLASS, "text-right")}>Tồn HT</TableHead>
                  <TableHead className={cn(TABLE_HEAD_CLASS, "text-right")}>Thực tế</TableHead>
                  <TableHead className={cn(TABLE_HEAD_CLASS, "text-right")}>Lệch</TableHead>
                  <TableHead className={cn(TABLE_HEAD_CLASS, "text-center")}>Đã đếm</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((row) => (
                  <TableRow key={row.id} className="border-b border-slate-100">
                    <TableCell className={cn(TABLE_CELL_MONO_CLASS, "text-xs")}>{row.skuCode}</TableCell>
                    <TableCell className={cn(TABLE_CELL_PRIMARY_CLASS, "max-w-[200px] truncate")}>
                      {row.productName}
                    </TableCell>
                    <TableCell className={TABLE_CELL_SECONDARY_CLASS}>
                      {row.warehouseCode}-{row.shelfCode}
                    </TableCell>
                    <TableCell className={cn(TABLE_CELL_NUMBER_CLASS, "text-right tabular-nums")}>
                      {row.systemQuantity}
                    </TableCell>
                    <TableCell className={cn(TABLE_CELL_NUMBER_CLASS, "text-right tabular-nums")}>
                      {row.actualQuantity ?? "—"}
                    </TableCell>
                    <TableCell className={cn(TABLE_CELL_NUMBER_CLASS, "text-right tabular-nums")}>
                      {row.variance}
                      {row.variancePercent !== 0 && (
                        <span className="text-slate-400 text-xs ml-1">({row.variancePercent.toFixed(2)}%)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-sm">{row.isCounted ? "Có" : "Chưa"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!isLoading && !isError && lines.length > 0 && allowLineEdits && onPatchLines && session && (
            <Table className={cn(DATA_TABLE_ROOT_CLASS, "border border-slate-200 rounded-md")}>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className={TABLE_HEAD_CLASS}>SKU</TableHead>
                  <TableHead className={TABLE_HEAD_CLASS}>Sản phẩm</TableHead>
                  <TableHead className={TABLE_HEAD_CLASS}>Vị trí</TableHead>
                  <TableHead className={cn(TABLE_HEAD_CLASS, "text-right")}>Tồn HT</TableHead>
                  <TableHead className={cn(TABLE_HEAD_CLASS, "text-right")}>Thực tế</TableHead>
                  <TableHead className={TABLE_HEAD_CLASS}>Ghi chú dòng</TableHead>
                  <TableHead className={cn(TABLE_HEAD_CLASS, "w-[72px]")} />
                  <TableHead className={cn(TABLE_HEAD_CLASS, "text-right")}>Lệch</TableHead>
                  <TableHead className={cn(TABLE_HEAD_CLASS, "text-center")}>Đã đếm</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((row) => (
                  <LineCountEditorRow
                    key={row.id}
                    row={row}
                    sessionId={session.id}
                    onPatchLines={onPatchLines}
                    disabled={linesPatchPending}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
