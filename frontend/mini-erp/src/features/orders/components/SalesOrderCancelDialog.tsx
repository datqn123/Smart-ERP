import { useState } from "react"
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
import type { Order } from "../types"
import { FORM_LABEL_CLASS } from "@/lib/data-table-layout"

const MAX_REASON = 500

type Props = {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Gọi API + invalidate + toast; ném lỗi nếu thất bại để dialog giữ mở. */
  onConfirm: (reason: string) => Promise<void>
}

export function SalesOrderCancelDialog({ order, open, onOpenChange, onConfirm }: Props) {
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setReason("")
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby="sales-order-cancel-desc">
        <DialogHeader>
          <DialogTitle>Hủy đơn hàng</DialogTitle>
          <DialogDescription id="sales-order-cancel-desc">
            {order
              ? `Xác nhận hủy đơn ${order.orderCode} — ${order.customerName}. Bản ghi được giữ, trạng thái chuyển sang Đã hủy.`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-1">
          <Label htmlFor="sales-order-cancel-reason" className={FORM_LABEL_CLASS}>
            Lý do hủy <span className="text-slate-400 font-normal">(tuỳ chọn, tối đa {MAX_REASON} ký tự)</span>
          </Label>
          <Textarea
            id="sales-order-cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value.slice(0, MAX_REASON))}
            placeholder="Ví dụ: Khách đổi ý…"
            rows={3}
            disabled={submitting}
            className="min-h-[88px] resize-y"
          />
        </div>
        <DialogFooter className="flex flex-row flex-wrap justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            className="min-h-11"
            disabled={submitting}
            onClick={() => handleOpenChange(false)}
          >
            Đóng
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="min-h-11"
            disabled={submitting || !order}
            onClick={async () => {
              if (!order) return
              try {
                setSubmitting(true)
                await onConfirm(reason.trim())
                setReason("")
                handleOpenChange(false)
              } catch {
                /* parent đã toast */
              } finally {
                setSubmitting(false)
              }
            }}
          >
            {submitting ? "Đang hủy…" : "Xác nhận hủy đơn"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
