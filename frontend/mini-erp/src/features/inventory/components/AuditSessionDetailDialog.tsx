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
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "./StatusBadge"
import { formatDate, formatDateTime } from "../utils"
import type { AuditItem, AuditSession } from "../types"
import type {
  AuditLinesPatchBody,
  AuditSessionCompleteBody,
  AuditSessionOwnerNotesBody,
} from "../api/auditSessionsApi"
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
  /** Task026 — gửi hoàn tất (In Progress → chờ Owner duyệt). */
  onCompleteSession?: (sessionId: number, body: AuditSessionCompleteBody) => Promise<void>
  completePending?: boolean
  /** GAP SRS 029–031 — JWT role Owner (khớp `StockReceiptAccessPolicy.assertOwnerOnly`). */
  isOwner?: boolean
  onOwnerApprove?: (sessionId: number, body: AuditSessionOwnerNotesBody) => Promise<void>
  onOwnerReject?: (sessionId: number, body: AuditSessionOwnerNotesBody) => Promise<void>
  onOwnerSoftDelete?: (sessionId: number) => Promise<void>
  approveOwnerPending?: boolean
  rejectOwnerPending?: boolean
  softDeleteOwnerPending?: boolean
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

interface AuditSessionCompleteSectionProps {
  session: AuditSession
  onComplete: (sessionId: number, body: AuditSessionCompleteBody) => Promise<void>
  disabled: boolean
}

function AuditSessionCompleteSection({ session, onComplete, disabled }: AuditSessionCompleteSectionProps) {
  const [requireAllCounted, setRequireAllCounted] = useState(true)
  if (session.status !== "In Progress") return null

  return (
    <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-4 space-y-3">
      <p className="text-sm text-slate-800">
        <strong className="font-medium">Hoàn tất kiểm kê (Task026):</strong> gửi đợt sang{" "}
        <strong className="font-medium">chờ Owner duyệt</strong> — chưa áp chênh lệch vào tồn (Task028).
      </p>
      <div className="flex items-start gap-3">
        <Checkbox
          id="audit-complete-require-all"
          checked={requireAllCounted}
          onCheckedChange={(v) => setRequireAllCounted(v === true)}
          disabled={disabled}
          className="mt-0.5"
        />
        <label htmlFor="audit-complete-require-all" className="text-sm text-slate-600 leading-snug cursor-pointer">
          Bắt buộc đã đếm đủ mọi dòng (<span className="font-mono text-xs">requireAllCounted: true</span>). Bỏ chọn nếu
          cho phép gửi khi còn dòng chưa đếm (BE có thể vẫn 409 tùy policy).
        </label>
      </div>
      <Button
        type="button"
        className="h-11 bg-emerald-700 hover:bg-emerald-800 text-white"
        disabled={disabled}
        onClick={() => void onComplete(session.id, { requireAllCounted })}
      >
        Gửi chờ Owner duyệt
      </Button>
    </div>
  )
}

interface AuditSessionOwnerActionsBlockProps {
  session: AuditSession
  isOwner: boolean
  onApprove?: (sessionId: number, body: AuditSessionOwnerNotesBody) => Promise<void>
  onReject?: (sessionId: number, body: AuditSessionOwnerNotesBody) => Promise<void>
  onSoftDelete?: (sessionId: number) => Promise<void>
  approvePending: boolean
  rejectPending: boolean
  softDeletePending: boolean
}

function AuditSessionOwnerActionsBlock({
  session,
  isOwner,
  onApprove,
  onReject,
  onSoftDelete,
  approvePending,
  rejectPending,
  softDeletePending,
}: AuditSessionOwnerActionsBlockProps) {
  const [ownerNotes, setOwnerNotes] = useState("")
  const [softDeleteOpen, setSoftDeleteOpen] = useState(false)

  if (!isOwner || (!onApprove && !onReject && !onSoftDelete)) {
    return null
  }

  const ownerBusy = approvePending || rejectPending || softDeletePending
  const notesPayload = (): AuditSessionOwnerNotesBody => {
    const t = ownerNotes.trim()
    return t ? { notes: t.slice(0, 500) } : {}
  }

  const showApproveReject = session.status === "Pending Owner Approval" && onApprove && onReject

  return (
    <>
      <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-4 space-y-3">
        <p className="text-sm font-semibold text-violet-950">Thao tác Owner</p>
        <p className="text-xs text-violet-900/80">
          Duyệt / Từ chối khi đợt <strong className="font-medium">chờ Owner duyệt</strong>. Xóa mềm chỉ Owner (SRS GAP 029,
          BR-12).
        </p>
        {showApproveReject && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="audit-owner-notes" className={FORM_LABEL_CLASS}>
                Ghi chú Owner (tuỳ chọn)
              </Label>
              <Textarea
                id="audit-owner-notes"
                className={cn(FORM_INPUT_CLASS, "min-h-[72px]")}
                maxLength={500}
                placeholder="Ghi chú kèm duyệt hoặc từ chối…"
                value={ownerNotes}
                onChange={(e) => setOwnerNotes(e.target.value)}
                disabled={ownerBusy}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                className="h-10 bg-violet-700 hover:bg-violet-800 text-white"
                disabled={ownerBusy}
                onClick={() => void onApprove(session.id, notesPayload())}
              >
                {approvePending ? "Đang duyệt…" : "Duyệt hoàn thành"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 border-amber-300 text-amber-950 hover:bg-amber-50"
                disabled={ownerBusy}
                onClick={() => void onReject(session.id, notesPayload())}
              >
                {rejectPending ? "Đang từ chối…" : "Từ chối — trả lại đang kiểm"}
              </Button>
            </div>
          </>
        )}
        {onSoftDelete && (
          <Button
            type="button"
            variant="destructive"
            className="h-10"
            disabled={ownerBusy}
            onClick={() => setSoftDeleteOpen(true)}
          >
            Xóa mềm đợt kiểm kê
          </Button>
        )}
      </div>

      {onSoftDelete && (
        <Dialog open={softDeleteOpen} onOpenChange={setSoftDeleteOpen}>
          <DialogContent className="sm:max-w-md" aria-describedby="audit-soft-delete-desc">
            <DialogHeader>
              <DialogTitle>Xác nhận xóa mềm</DialogTitle>
              <DialogDescription id="audit-soft-delete-desc">
                Đợt <span className="font-mono font-medium text-slate-900">{session.auditCode}</span> sẽ ẩn khỏi danh sách
                (deleted_at). Chỉ tài khoản Owner thực hiện được trên server.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setSoftDeleteOpen(false)} disabled={softDeletePending}>
                Hủy
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={softDeletePending}
                onClick={() => {
                  void (async () => {
                    try {
                      await onSoftDelete(session.id)
                      setSoftDeleteOpen(false)
                    } catch {
                      /* toast từ mutation */
                    }
                  })()
                }}
              >
                {softDeletePending ? "Đang xóa…" : "Xác nhận xóa mềm"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
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
  onCompleteSession,
  completePending = false,
  isOwner = false,
  onOwnerApprove,
  onOwnerReject,
  onOwnerSoftDelete,
  approveOwnerPending = false,
  rejectOwnerPending = false,
  softDeleteOwnerPending = false,
}: AuditSessionDetailDialogProps) {
  const header = session ?? listHint
  const lines = session?.items ?? []
  const allowLineEdits = Boolean(onPatchLines) && canCountAuditLines(session)
  const showPendingHint = session?.status === "Pending" && lines.length > 0 && Boolean(onPatchLines)

  return (
    <>
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

        {!isLoading && !isError && session && isOwner && (onOwnerApprove || onOwnerReject || onOwnerSoftDelete) && (
          <AuditSessionOwnerActionsBlock
            session={session}
            isOwner={isOwner}
            onApprove={onOwnerApprove}
            onReject={onOwnerReject}
            onSoftDelete={onOwnerSoftDelete}
            approvePending={approveOwnerPending}
            rejectPending={rejectOwnerPending}
            softDeletePending={softDeleteOwnerPending}
          />
        )}

        {!isLoading && !isError && session && onCompleteSession && (
          <AuditSessionCompleteSection
            session={session}
            onComplete={onCompleteSession}
            disabled={completePending || linesPatchPending}
          />
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
    </>
  )
}
