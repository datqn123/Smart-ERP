import React from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Hash, Activity, CreditCard, Save, Info, RotateCcw, AlertCircle, FileText, Package } from "lucide-react"
import type { Order } from "../types"
import { cn } from "@/lib/utils"
import { FORM_LABEL_CLASS, FORM_INPUT_CLASS } from "@/lib/data-table-layout"
import {
  mapStatusForSalesOrderCreate,
  type SalesOrderCreateBody,
} from "../api/salesOrdersApi"

export type ReturnFormLineRow = {
  productId: number
  unitId: number
  quantity: number
  unitPrice: number
}

export type ReturnFormValues = {
  orderCode: string
  customerName: string
  customerId: number
  refSalesOrderId: string
  status: string
  paymentStatus: string
  notes: string
  lines: ReturnFormLineRow[]
}

const defaultLine = (): ReturnFormLineRow => ({
  productId: 0,
  unitId: 0,
  quantity: 1,
  unitPrice: 0,
})

interface ReturnFormDialogProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onSave?: (data: ReturnFormValues) => void | Promise<void>
  /** Task056 — tạo phiếu trả. */
  onCreateReturn?: (body: SalesOrderCreateBody) => Promise<void>
}

export function ReturnFormDialog({ order, isOpen, onClose, onSave, onCreateReturn }: ReturnFormDialogProps) {
  const isEdit = !!order

  const form = useForm<ReturnFormValues>({
    defaultValues: {
      orderCode: "",
      customerName: "",
      customerId: 0,
      refSalesOrderId: "",
      status: "Pending",
      paymentStatus: "Unpaid",
      notes: "",
      lines: [defaultLine()],
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "lines" })

  React.useEffect(() => {
    if (order) {
      form.reset({
        orderCode: order.orderCode,
        customerName: order.customerName,
        customerId: order.customerId ?? 0,
        refSalesOrderId: "",
        status: order.status === "Completed" ? "Delivered" : order.status,
        paymentStatus: order.paymentStatus,
        notes: order.notes ?? "",
        lines: [defaultLine()],
      })
    } else {
      form.reset({
        orderCode: "",
        customerName: "",
        customerId: 0,
        refSalesOrderId: "",
        status: "Pending",
        paymentStatus: "Unpaid",
        notes: "",
        lines: [defaultLine()],
      })
    }
  }, [order, form])

  const [isSaving, setIsSaving] = React.useState(false)

  const handleSubmit = async (data: ReturnFormValues) => {
    try {
      setIsSaving(true)
      if (isEdit) {
        await onSave?.(data)
        return
      }
      if (onCreateReturn) {
        const cid = Number(data.customerId)
        if (!Number.isFinite(cid) || cid <= 0) {
          toast.error("Nhập mã khách hàng (customerId) — số nguyên dương.")
          return
        }
        if (data.status === "Cancelled") {
          toast.error("Không tạo phiếu mới ở trạng thái Đã hủy.")
          return
        }
        if (!data.lines?.length) {
          toast.error("Cần ít nhất một dòng hàng.")
          return
        }
        for (let i = 0; i < data.lines.length; i++) {
          const row = data.lines[i]
          if (!row.productId || row.productId <= 0) {
            toast.error(`Dòng ${i + 1}: productId không hợp lệ.`)
            return
          }
          if (!row.unitId || row.unitId <= 0) {
            toast.error(`Dòng ${i + 1}: unitId không hợp lệ.`)
            return
          }
          if (!row.quantity || row.quantity <= 0) {
            toast.error(`Dòng ${i + 1}: số lượng phải > 0.`)
            return
          }
          if (row.unitPrice == null || row.unitPrice < 0 || !Number.isFinite(row.unitPrice)) {
            toast.error(`Dòng ${i + 1}: đơn giá không hợp lệ.`)
            return
          }
        }
        const refRaw = data.refSalesOrderId.trim()
        const refId = refRaw.length > 0 ? Number(refRaw) : NaN
        const st = mapStatusForSalesOrderCreate(data.status)
        const body: SalesOrderCreateBody = {
          orderChannel: "Return",
          customerId: cid,
          refSalesOrderId: Number.isFinite(refId) && refId > 0 ? refId : null,
          notes: data.notes?.trim() ? data.notes.trim() : null,
          paymentStatus: data.paymentStatus,
          status: st,
          lines: data.lines.map((l) => ({
            productId: l.productId,
            unitId: l.unitId,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
          })),
        }
        await onCreateReturn(body)
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-0 gap-0 border-slate-200 shadow-2xl rounded-2xl">
        <DialogHeader className="p-8 pb-6 bg-slate-50/50 border-b border-slate-100 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 size-32 text-amber-100/50 rotate-12">
            <RotateCcw size={128} />
          </div>

          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div
              className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105",
                isEdit ? "bg-amber-500 text-white shadow-amber-200" : "bg-orange-600 text-white shadow-orange-200",
              )}
            >
              <RotateCcw size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Xử lý hoàn trả</p>
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 uppercase italic">
                {isEdit ? "Cập nhật phiếu trả" : "Tạo phiếu trả hàng"}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-slate-500 font-medium relative z-10">
            {isEdit
              ? `Điều chỉnh thông tin cho phiếu trả #${order.orderCode}`
              : "Nhập customerId, dòng hàng; có thể gắn đơn bán gốc (refSalesOrderId)."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="p-8 space-y-8">
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
              <Info size={14} className="text-slate-400" /> Thông tin cơ bản
            </h3>

            <div className="grid grid-cols-2 gap-x-10 gap-y-7">
              <div className="space-y-2">
                <Label className={FORM_LABEL_CLASS}>
                  <Hash size={12} className="inline mr-1" /> Mã phiếu
                </Label>
                <Input
                  {...form.register("orderCode")}
                  disabled={isEdit}
                  placeholder={isEdit ? "" : "BE tự sinh"}
                  className={cn(FORM_INPUT_CLASS, "h-12 font-bold")}
                />
              </div>

              <div className="space-y-2">
                <Label className={FORM_LABEL_CLASS}>
                  <User size={12} className="inline mr-1" /> Tên khách (ghi chú)
                </Label>
                <Input {...form.register("customerName")} placeholder="Tên hiển thị" className={cn(FORM_INPUT_CLASS, "h-12 font-bold")} />
              </div>

              {!isEdit && (
                <>
                  <div className="space-y-2 col-span-2">
                    <Label className={FORM_LABEL_CLASS}>customerId * — Task056</Label>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      {...form.register("customerId", { valueAsNumber: true })}
                      className={cn(FORM_INPUT_CLASS, "h-12 tabular-nums")}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className={FORM_LABEL_CLASS}>Đơn bán gốc (refSalesOrderId) — tuỳ chọn</Label>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      {...form.register("refSalesOrderId")}
                      placeholder="Để trống nếu không tham chiếu"
                      className={cn(FORM_INPUT_CLASS, "h-12 tabular-nums")}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label className={FORM_LABEL_CLASS}>
                  <Activity size={12} className="inline mr-1" /> Trạng thái
                </Label>
                <Select value={form.watch("status")} onValueChange={(val) => form.setValue("status", val)}>
                  <SelectTrigger className={cn(FORM_INPUT_CLASS, "h-12 font-bold")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="Pending">Chờ duyệt</SelectItem>
                    <SelectItem value="Processing">Đang xử lý</SelectItem>
                    <SelectItem value="Partial">Một phần</SelectItem>
                    <SelectItem value="Shipped">Đang giao</SelectItem>
                    <SelectItem value="Completed">Hoàn tất (→ Delivered)</SelectItem>
                    {isEdit && (
                      <SelectItem value="Cancelled" className="text-red-600">
                        Đã hủy
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className={FORM_LABEL_CLASS}>
                  <CreditCard size={12} className="inline mr-1" /> Thanh toán / hoàn tiền
                </Label>
                <Select value={form.watch("paymentStatus")} onValueChange={(val) => form.setValue("paymentStatus", val)}>
                  <SelectTrigger className={cn(FORM_INPUT_CLASS, "h-12 font-bold")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="Unpaid">Chưa hoàn</SelectItem>
                    <SelectItem value="Partial">Một phần</SelectItem>
                    <SelectItem value="Paid">Đã xong</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label className={FORM_LABEL_CLASS}>
                  <FileText size={12} className="inline mr-1" /> Ghi chú
                </Label>
                <Input {...form.register("notes")} placeholder="Lý do trả…" className={cn(FORM_INPUT_CLASS, "h-12 font-bold")} />
              </div>
            </div>
          </div>

          {!isEdit && (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Package size={14} className="text-slate-500" /> Dòng hàng *
                </p>
                <Button type="button" variant="outline" size="sm" className="h-9" onClick={() => append(defaultLine())}>
                  + Thêm dòng
                </Button>
              </div>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-2 gap-3 sm:grid-cols-12 sm:items-end rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-[10px] uppercase text-slate-500">productId</Label>
                    <Input
                      type="number"
                      min={1}
                      {...form.register(`lines.${index}.productId`, { valueAsNumber: true })}
                      className={cn(FORM_INPUT_CLASS, "h-10 tabular-nums")}
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-[10px] uppercase text-slate-500">unitId</Label>
                    <Input
                      type="number"
                      min={1}
                      {...form.register(`lines.${index}.unitId`, { valueAsNumber: true })}
                      className={cn(FORM_INPUT_CLASS, "h-10 tabular-nums")}
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-[10px] uppercase text-slate-500">SL</Label>
                    <Input
                      type="number"
                      min={1}
                      {...form.register(`lines.${index}.quantity`, { valueAsNumber: true })}
                      className={cn(FORM_INPUT_CLASS, "h-10 tabular-nums")}
                    />
                  </div>
                  <div className="sm:col-span-4 space-y-1">
                    <Label className="text-[10px] uppercase text-slate-500">Đơn giá</Label>
                    <Input
                      type="number"
                      min={0}
                      {...form.register(`lines.${index}.unitPrice`, { valueAsNumber: true })}
                      className={cn(FORM_INPUT_CLASS, "h-10 tabular-nums")}
                    />
                  </div>
                  <div className="sm:col-span-2 flex sm:justify-end pb-1">
                    <Button type="button" variant="ghost" size="sm" className="text-red-600 h-10" disabled={fields.length <= 1} onClick={() => remove(index)}>
                      Xóa dòng
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-amber-500 shadow-sm">
              <AlertCircle size={20} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-900">Kiểm tra quy định hoàn trả</p>
              <p className="text-[10px] text-slate-400 font-medium">refSalesOrderId phải cùng khách (BE 409 nếu sai).</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={onClose} className="px-6 font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl">
              Hủy thao tác
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className={cn(
                "px-10 font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 min-h-11",
                isEdit ? "bg-amber-500 hover:bg-amber-600 shadow-amber-100 text-white" : "bg-orange-600 hover:bg-orange-700 shadow-orange-100 text-white",
              )}
            >
              <Save size={18} /> {isSaving ? "Đang gửi…" : isEdit ? "Cập nhật phiếu" : "Tạo phiếu trả"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
