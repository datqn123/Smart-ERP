import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { AuditSession } from "../types"
import { FORM_LABEL_CLASS, FORM_INPUT_CLASS } from "@/lib/data-table-layout"

const CANCEL_REASON_MAX = 1000

export interface AuditSessionCancelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: AuditSession | null
  isSubmitting: boolean
  onConfirm: (cancelReason: string) => void | Promise<void>
}

export function AuditSessionCancelDialog({
  open,
  onOpenChange,
  session,
  isSubmitting,
  onConfirm,
}: AuditSessionCancelDialogProps) {
  const [reason, setReason] = useState("")

  useEffect(() => {
    if (open && session) {
      setReason("")
    }
  }, [open, session?.id])

  const trimmed = reason.trim()
  const canSubmit = trimmed.length > 0 && trimmed.length <= CANCEL_REASON_MAX && !isSubmitting

  const handleSubmit = () => {
    if (!canSubmit) return
    void onConfirm(trimmed)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby="audit-cancel-desc">
        <DialogHeader>
          <DialogTitle>Hủy đợt kiểm kê</DialogTitle>
          <DialogDescription id="audit-cancel-desc">
            {session ? (
              <>
                Đợt <span className="font-mono font-medium text-slate-900">{session.auditCode}</span> — {session.title}
              </>
            ) : (
              "Chọn lý do hủy (bắt buộc)."
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-1">
          <Label htmlFor="audit-cancel-reason" className={FORM_LABEL_CLASS}>
            Lý do hủy <span className="text-red-600">*</span>
          </Label>
          <Textarea
            id="audit-cancel-reason"
            className={FORM_INPUT_CLASS}
            rows={4}
            maxLength={CANCEL_REASON_MAX}
            placeholder="Ví dụ: Đổi kế hoạch kiểm kê, trùng đợt…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isSubmitting}
          />
          <p className="text-xs text-slate-500 text-right tabular-nums">
            {reason.length}/{CANCEL_REASON_MAX}
          </p>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Đóng
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? "Đang hủy…" : "Xác nhận hủy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
