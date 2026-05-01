import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { ApiRequestError } from "@/lib/api/http"
import { getStockDispatchDetail, patchStockDispatch } from "../api/dispatchApi"
import { FORM_INPUT_CLASS, FORM_LABEL_CLASS } from "@/lib/data-table-layout"

const MANUAL_STATUSES = [
  { value: "WaitingDispatch", label: "Chờ xuất" },
  { value: "Delivering", label: "Đang giao" },
  { value: "Delivered", label: "Đã giao (trừ tồn)" },
] as const

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  dispatchId: number | null
}

type LineDraft = {
  inventoryId: number
  quantity: number
  productLabel: string
  availableQuantity: number
}

export function ManualDispatchEditDialog({ open, onOpenChange, dispatchId }: Props) {
  const qc = useQueryClient()
  const enabled = open && dispatchId != null && dispatchId > 0

  const detailQ = useQuery({
    queryKey: ["stock-dispatch-detail", dispatchId],
    queryFn: () => getStockDispatchDetail(dispatchId!),
    enabled,
  })

  const [dispatchDate, setDispatchDate] = useState("")
  const [notes, setNotes] = useState("")
  const [referenceLabel, setReferenceLabel] = useState("")
  const [status, setStatus] = useState<string>("WaitingDispatch")
  const [lines, setLines] = useState<LineDraft[]>([])

  useEffect(() => {
    if (!detailQ.data) {
      return
    }
    const d = detailQ.data
    setDispatchDate(d.dispatchDate)
    setNotes(d.notes ?? "")
    setReferenceLabel(d.referenceLabel ?? "")
    setStatus(d.status)
    setLines(
      d.lines.map((l) => ({
        inventoryId: l.inventoryId,
        quantity: l.quantity,
        productLabel: `${l.productName} (${l.skuCode})`,
        availableQuantity: l.availableQuantity,
      })),
    )
  }, [detailQ.data])

  const patchM = useMutation({
    mutationFn: () =>
      patchStockDispatch(dispatchId!, {
        dispatchDate,
        notes: notes.trim() || null,
        referenceLabel: referenceLabel.trim() || null,
        status,
        lines: lines.map((l) => ({ inventoryId: l.inventoryId, quantity: l.quantity })),
      }),
    onSuccess: async () => {
      toast.success("Đã lưu phiếu xuất")
      await qc.invalidateQueries({ queryKey: ["stock-dispatches", "v1", "list"] })
      await qc.invalidateQueries({ queryKey: ["inventory", "v1", "list"] })
      await qc.invalidateQueries({ queryKey: ["inventory", "v1", "summary"] })
      await qc.invalidateQueries({ queryKey: ["stock-dispatch-detail"] })
      onOpenChange(false)
    },
    onError: (e) => {
      if (e instanceof ApiRequestError) {
        toast.error(e.body?.message ?? "Không lưu được phiếu")
      }
      else {
        toast.error("Không lưu được phiếu")
      }
    },
  })

  const busy = detailQ.isPending || patchM.isPending
  const editable = detailQ.data?.canEdit === true

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sửa phiếu xuất thủ công</DialogTitle>
          <DialogDescription>
            Chờ xuất / Đang giao: chỉnh dòng và trạng thái; khi Đã giao hệ thống trừ tồn theo các dòng hiện có.
          </DialogDescription>
        </DialogHeader>

        {detailQ.isPending && enabled && (
          <p className="text-sm text-slate-500 py-8 text-center">Đang tải chi tiết…</p>
        )}

        {detailQ.data && editable && detailQ.data.shortageWarning && (
          <p className="text-sm rounded-md border border-amber-200 bg-amber-50 text-amber-900 px-3 py-2">
            Cảnh báo: có ít nhất một dòng yêu cầu quá số lượng tồn hiện tại — vui lòng điều chỉnh số lượng trước khi
            giao.
          </p>
        )}

        {detailQ.error && enabled && (
          <p className="text-sm text-red-600">Không đọc được chi tiết phiếu.</p>
        )}

        {detailQ.data != null && !editable && (
          <p className="text-sm text-slate-600">Phiếu đã khoá (đã giao hoặc bạn không phải người tạo).</p>
        )}

        {editable && detailQ.data && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={FORM_LABEL_CLASS}>Ngày xuất</Label>
                <Input
                  type="date"
                  className={FORM_INPUT_CLASS}
                  value={dispatchDate}
                  onChange={(e) => setDispatchDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className={FORM_LABEL_CLASS}>Trạng thái</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className={FORM_INPUT_CLASS}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MANUAL_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className={FORM_LABEL_CLASS}>Nhãn tham chiếu</Label>
              <Input
                className={FORM_INPUT_CLASS}
                value={referenceLabel}
                onChange={(e) => setReferenceLabel(e.target.value)}
                placeholder="Khách / lý do xuất"
              />
            </div>
            <div className="space-y-2">
              <Label className={FORM_LABEL_CLASS}>Ghi chú</Label>
              <Textarea className={FORM_INPUT_CLASS} value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>

            <div>
              <Label className={FORM_LABEL_CLASS}>Dòng hàng (SL ≤ tồn)</Label>
              <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="w-[100px] text-right">Tồn</TableHead>
                      <TableHead className="w-[120px] text-right">SL xuất</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((row, idx) => (
                      <TableRow key={`${row.inventoryId}-${idx}`}>
                        <TableCell className="text-sm">{row.productLabel}</TableCell>
                        <TableCell className="text-right text-sm text-slate-500">{row.availableQuantity}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min={1}
                            className="h-9 text-right"
                            value={row.quantity}
                            onChange={(e) => {
                              const v = parseInt(e.target.value, 10)
                              const next = Number.isNaN(v) ? 1 : v
                              setLines((prev) =>
                                prev.map((p, i) => (i === idx ? { ...p, quantity: Math.max(1, next) } : p)),
                              )
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Đóng
          </Button>
          {editable && (
            <Button type="button" className="bg-slate-900 text-white" disabled={busy} onClick={() => patchM.mutate()}>
              {busy ? "Đang lưu…" : "Lưu"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
