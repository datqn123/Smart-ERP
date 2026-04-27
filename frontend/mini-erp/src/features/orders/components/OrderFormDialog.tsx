import React from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  ShoppingBag, 
  User, 
  Calendar, 
  Activity, 
  CreditCard, 
  Receipt, 
  MapPin, 
  Package, 
  Save, 
  X,
  Hash,
  CheckCircle2,
  ListTree,
  Truck,
  Timer,
  Info
} from "lucide-react"
import type { Order } from "../types"
import {
  mapStatusForSalesOrderCreate,
  type SalesOrderCreateBody,
  type SalesOrderMetaFormValues,
} from "../api/salesOrdersApi"
import { cn } from "@/lib/utils"
import {
  FORM_LABEL_CLASS,
  FORM_INPUT_CLASS,
} from "@/lib/data-table-layout"

export type OrderFormLineRow = {
  productId: number
  unitId: number
  quantity: number
  unitPrice: number
}

export type OrderFormValues = SalesOrderMetaFormValues & {
  orderCode: string
  customerName: string
  totalAmount: number
  /** Task056 — bắt buộc khi tạo mới (POST). */
  customerId: number
  lines: OrderFormLineRow[]
}

interface OrderFormDialogProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  /** Parent đóng dialog khi lưu thành công; lỗi (409, …) thì giữ dialog mở. */
  onSave?: (data: OrderFormValues) => void | Promise<void>
  /** Task056 — tạo đơn sỉ (BE sinh mã đơn). */
  onCreateWholesale?: (body: SalesOrderCreateBody) => Promise<void>
}

const defaultLine = (): OrderFormLineRow => ({
  productId: 0,
  unitId: 0,
  quantity: 1,
  unitPrice: 0,
})

export function OrderFormDialog({ order, isOpen, onClose, onSave, onCreateWholesale }: OrderFormDialogProps) {
  const isEdit = !!order
  const isCancelled = order?.status === "Cancelled"

  const form = useForm<OrderFormValues>({
    defaultValues: {
      orderCode: "",
      customerName: "",
      status: "Pending",
      paymentStatus: "Unpaid",
      totalAmount: 0,
      shippingAddress: "",
      notes: "",
      discountAmount: 0,
      customerId: 0,
      lines: [defaultLine()],
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "lines" })

  // Update form when order changes
  React.useEffect(() => {
    if (order) {
      form.reset({
        orderCode: order.orderCode,
        customerName: order.customerName,
        status: order.status === "Completed" ? "Delivered" : order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        shippingAddress: "",
        notes: order.notes ?? "",
        discountAmount: order.discountAmount ?? 0,
        customerId: order.customerId ?? 0,
        lines: [defaultLine()],
      })
    } else {
      form.reset({
        orderCode: "",
        customerName: "",
        status: "Pending",
        paymentStatus: "Unpaid",
        totalAmount: 0,
        shippingAddress: "",
        notes: "",
        discountAmount: 0,
        customerId: 0,
        lines: [defaultLine()],
      })
    }
  }, [order, form])

  const [isSaving, setIsSaving] = React.useState(false)

  const handleSubmit = async (data: OrderFormValues) => {
    try {
      setIsSaving(true)
      if (isEdit) {
        if (onSave) await onSave(data)
        return
      }
      if (onCreateWholesale) {
        const cid = Number(data.customerId)
        if (!Number.isFinite(cid) || cid <= 0) {
          toast.error("Nhập mã khách hàng (customerId) — số nguyên dương từ danh mục khách hàng.")
          return
        }
        if (!data.lines?.length) {
          toast.error("Cần ít nhất một dòng hàng (productId, unitId, số lượng, đơn giá).")
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
        const st = mapStatusForSalesOrderCreate(data.status)
        if (data.status === "Cancelled") {
          toast.error("Không tạo đơn mới ở trạng thái Đã hủy.")
          return
        }
        const disc = Number(data.discountAmount)
        const body: SalesOrderCreateBody = {
          orderChannel: "Wholesale",
          customerId: cid,
          discountAmount: Number.isFinite(disc) ? disc : 0,
          shippingAddress: data.shippingAddress?.trim() ? data.shippingAddress.trim() : null,
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
        await onCreateWholesale(body)
        return
      }
      if (onSave) await onSave(data)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl overflow-hidden p-0 gap-0 border-slate-200 shadow-2xl rounded-2xl">
        <DialogHeader className="p-8 pb-6 bg-slate-50/50 border-b border-slate-100 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 size-32 text-slate-100/50 rotate-12">
            {isEdit ? <Receipt size={128} /> : <ShoppingBag size={128} />}
          </div>
          
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105",
                isEdit ? "bg-blue-600 text-white shadow-blue-200" : "bg-emerald-600 text-white shadow-emerald-200"
            )}>
              {isEdit ? <Receipt size={24} /> : <ShoppingBag size={24} />}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Quản lý giao dịch</p>
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 uppercase italic">
                {isEdit ? "Cập nhật đơn hàng" : "Tạo đơn hàng mới"}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-slate-500 font-medium relative z-10">
            {isEdit ? `Điều chỉnh thông tin cho đơn hàng #${order.orderCode}` : "Nhập đầy đủ thông tin để khởi tạo đơn hàng bán sỉ mới"}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="p-8 space-y-8"
        >
            {isEdit && isCancelled && (
              <p
                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900"
                role="status"
              >
                Đơn đã hủy — không thể cập nhật (mã lỗi 409 nếu thử gửi lên máy chủ).
              </p>
            )}
            <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
                    <Info size={14} className="text-slate-400" /> Thông tin cơ bản
                </h3>
                
                {/* Row 1: Mã đơn & Khách hàng */}
                <div className="grid grid-cols-2 gap-x-10 gap-y-7">
                    <div className="space-y-2">
                        <Label className={FORM_LABEL_CLASS}>
                            <Hash size={12} className="inline mr-1" /> Mã đơn hàng *
                        </Label>
                        <Input 
                            {...form.register("orderCode")}
                            disabled={isEdit}
                            placeholder={isEdit ? "" : "BE tự sinh sau khi tạo — có thể để trống"}
                            className={cn(FORM_INPUT_CLASS, "h-12 font-bold")}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className={FORM_LABEL_CLASS}>
                            <User size={12} className="inline mr-1" /> Khách hàng đại lý *
                        </Label>
                        <Input 
                            {...form.register("customerName")}
                            placeholder="Tên công ty / Khách hàng (ghi chú nội bộ)"
                            className={cn(FORM_INPUT_CLASS, "h-12 font-bold")}
                        />
                    </div>

                    {!isEdit && (
                      <div className="space-y-2 col-span-2">
                        <Label className={FORM_LABEL_CLASS}>
                          <Hash size={12} className="inline mr-1" /> Mã khách (customerId) * — Task056
                        </Label>
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          {...form.register("customerId", { valueAsNumber: true })}
                          placeholder="ID khách hàng trong hệ thống"
                          className={cn(FORM_INPUT_CLASS, "h-12 font-bold tabular-nums")}
                        />
                      </div>
                    )}

                    {/* Row 2: Trạng thái & Thanh toán */}
                    <div className="space-y-2">
                        <Label className={FORM_LABEL_CLASS}>
                            <Activity size={12} className="inline mr-1" /> Trạng thái thực hiện
                        </Label>
                        <Select
                            disabled={isCancelled}
                            value={form.watch("status")}
                            onValueChange={(val) => form.setValue("status", val)}
                        >
                            <SelectTrigger className={cn(FORM_INPUT_CLASS, "h-12 font-bold")}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                {isCancelled ? (
                                    <SelectItem value="Cancelled" className="text-slate-500 font-bold text-xs">
                                        Đã hủy
                                    </SelectItem>
                                ) : (
                                    <>
                                        <SelectItem value="Pending" className="text-amber-600 font-bold text-xs cursor-pointer">
                                            <span className="flex items-center gap-2 uppercase tracking-wider italic">○ Chờ xử lý</span>
                                        </SelectItem>
                                        <SelectItem value="Processing" className="text-blue-600 font-bold text-xs cursor-pointer">
                                            <span className="flex items-center gap-2 uppercase tracking-wider italic">● Đang thực hiện</span>
                                        </SelectItem>
                                        <SelectItem value="Partial" className="text-sky-600 font-bold text-xs cursor-pointer">
                                            <span className="flex items-center gap-2 uppercase tracking-wider italic">◐ Một phần</span>
                                        </SelectItem>
                                        <SelectItem value="Shipped" className="text-indigo-600 font-bold text-xs cursor-pointer">
                                            <span className="flex items-center gap-2 uppercase tracking-wider italic">✈ Đang giao hàng</span>
                                        </SelectItem>
                                        <SelectItem value="Delivered" className="text-emerald-600 font-bold text-xs cursor-pointer">
                                            <span className="flex items-center gap-2 uppercase tracking-wider italic">✓ Đã giao</span>
                                        </SelectItem>
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className={FORM_LABEL_CLASS}>
                            <CreditCard size={12} className="inline mr-1" /> Tình trạng thanh toán
                        </Label>
                        <Select
                            disabled={isCancelled}
                            value={form.watch("paymentStatus")}
                            onValueChange={(val) => form.setValue("paymentStatus", val)}
                        >
                            <SelectTrigger className={cn(FORM_INPUT_CLASS, "h-12 font-bold")}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                <SelectItem value="Unpaid" className="text-red-500 font-bold text-xs cursor-pointer uppercase tracking-wider italic">Chưa thanh toán</SelectItem>
                                <SelectItem value="Partial" className="text-amber-500 font-bold text-xs cursor-pointer uppercase tracking-wider italic">Thanh toán một phần</SelectItem>
                                <SelectItem value="Paid" className="text-emerald-500 font-bold text-xs cursor-pointer uppercase tracking-wider italic">Đã thanh toán xong</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Row 3: Địa chỉ & ... (Simulated symmetry) */}
                    <div className="space-y-2 col-span-2">
                        <Label className={FORM_LABEL_CLASS}>
                            <MapPin size={12} className="inline mr-1" /> Địa chỉ nhận hàng
                        </Label>
                        <Input
                            {...form.register("shippingAddress")}
                            disabled={isCancelled}
                            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành"
                            className={cn(FORM_INPUT_CLASS, "h-12 font-bold")}
                        />
                    </div>

                    <div className="space-y-2 col-span-2">
                        <Label className={FORM_LABEL_CLASS}>
                            <Receipt size={12} className="inline mr-1" /> Ghi chú
                        </Label>
                        <Input
                            {...form.register("notes")}
                            disabled={isCancelled}
                            placeholder="Ghi chú đơn hàng"
                            className={cn(FORM_INPUT_CLASS, "h-12 font-bold")}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className={FORM_LABEL_CLASS}>
                            <Receipt size={12} className="inline mr-1" /> Giảm giá (đ)
                        </Label>
                        <Input
                            type="number"
                            min={0}
                            step={1}
                            disabled={isCancelled}
                            {...form.register("discountAmount", { valueAsNumber: true })}
                            className={cn(FORM_INPUT_CLASS, "h-12 font-bold tabular-nums")}
                        />
                    </div>
                </div>
            </div>

            {!isEdit && (
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Package size={14} className="text-slate-500" /> Dòng hàng (POST) *
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9"
                    onClick={() => append(defaultLine())}
                  >
                    + Thêm dòng
                  </Button>
                </div>
                <div className="space-y-3">
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
                          step={1}
                          {...form.register(`lines.${index}.productId`, { valueAsNumber: true })}
                          className={cn(FORM_INPUT_CLASS, "h-10 tabular-nums")}
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-[10px] uppercase text-slate-500">unitId</Label>
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          {...form.register(`lines.${index}.unitId`, { valueAsNumber: true })}
                          className={cn(FORM_INPUT_CLASS, "h-10 tabular-nums")}
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-[10px] uppercase text-slate-500">SL</Label>
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          {...form.register(`lines.${index}.quantity`, { valueAsNumber: true })}
                          className={cn(FORM_INPUT_CLASS, "h-10 tabular-nums")}
                        />
                      </div>
                      <div className="sm:col-span-4 space-y-1">
                        <Label className="text-[10px] uppercase text-slate-500">Đơn giá</Label>
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          {...form.register(`lines.${index}.unitPrice`, { valueAsNumber: true })}
                          className={cn(FORM_INPUT_CLASS, "h-10 tabular-nums")}
                        />
                      </div>
                      <div className="sm:col-span-2 flex sm:justify-end pb-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-600 h-10"
                          disabled={fields.length <= 1}
                          onClick={() => remove(index)}
                        >
                          Xóa dòng
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500">
                  Đơn vị phải thuộc sản phẩm; đơn giá nên sát giá niêm yết (BE có dung sai).
                </p>
              </div>
            )}

            {isEdit && (
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-slate-400">
                  <Package size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-900">Chi tiết sản phẩm</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Sửa dòng hàng qua màn chi tiết / API khác; form này cập nhật meta đơn (PATCH).
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button 
                    type="button"
                    variant="ghost" 
                    onClick={onClose}
                    className="px-6 font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl"
                >
                    Hủy thao tác
                </Button>
                <Button
                    type="submit"
                    disabled={isSaving || (isEdit && isCancelled)}
                    className={cn(
                        "px-10 font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 min-h-11",
                        isEdit ? "bg-blue-600 hover:bg-blue-700 shadow-blue-100 text-white" : "bg-slate-900 hover:bg-slate-800 shadow-slate-200 text-white",
                    )}
                >
                    <Save size={18} />{" "}
                    {isSaving ? "Đang lưu…" : isEdit ? "Xác nhận lưu" : "Tạo đơn sỉ"}
                </Button>
            </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
