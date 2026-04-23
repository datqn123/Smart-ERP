import React from "react"
import { useForm } from "react-hook-form"
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
import { cn } from "@/lib/utils"
import {
  FORM_LABEL_CLASS,
  FORM_INPUT_CLASS,
} from "@/lib/data-table-layout"

interface OrderFormDialogProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onSave?: (data: any) => void
}

export function OrderFormDialog({ order, isOpen, onClose, onSave }: OrderFormDialogProps) {
  const isEdit = !!order
  
  const form = useForm({
    defaultValues: order || {
      orderCode: "",
      customerName: "",
      status: "Pending",
      paymentStatus: "Unpaid",
      totalAmount: 0,
    }
  })

  // Update form when order changes
  React.useEffect(() => {
    if (order) {
      form.reset(order)
    } else {
      form.reset({
        orderCode: `ORD-${Math.floor(Math.random() * 1000)}`,
        customerName: "",
        status: "Pending",
        paymentStatus: "Unpaid",
        totalAmount: 0,
      })
    }
  }, [order, form])

  const handleSubmit = (data: any) => {
    onSave?.(data)
    onClose()
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

        <form onSubmit={form.handleSubmit(handleSubmit)} className="p-8 space-y-8">
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
                            placeholder="Nhập mã đơn (Ví dụ: ORD-001)"
                            className={cn(FORM_INPUT_CLASS, "h-12 font-bold")}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className={FORM_LABEL_CLASS}>
                            <User size={12} className="inline mr-1" /> Khách hàng đại lý *
                        </Label>
                        <Input 
                            {...form.register("customerName")}
                            placeholder="Tên công ty / Khách hàng"
                            className={cn(FORM_INPUT_CLASS, "h-12 font-bold")}
                        />
                    </div>

                    {/* Row 2: Trạng thái & Thanh toán */}
                    <div className="space-y-2">
                        <Label className={FORM_LABEL_CLASS}>
                            <Activity size={12} className="inline mr-1" /> Trạng thái thực hiện
                        </Label>
                        <Select 
                            value={form.watch("status")}
                            onValueChange={(val) => form.setValue("status", val as any)}
                        >
                            <SelectTrigger className={cn(FORM_INPUT_CLASS, "h-12 font-bold")}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                <SelectItem value="Pending" className="text-amber-600 font-bold text-xs cursor-pointer">
                                    <span className="flex items-center gap-2 uppercase tracking-wider italic">○ Chờ xử lý</span>
                                </SelectItem>
                                <SelectItem value="Processing" className="text-blue-600 font-bold text-xs cursor-pointer">
                                    <span className="flex items-center gap-2 uppercase tracking-wider italic">● Đang thực hiện</span>
                                </SelectItem>
                                <SelectItem value="Shipped" className="text-indigo-600 font-bold text-xs cursor-pointer">
                                    <span className="flex items-center gap-2 uppercase tracking-wider italic">✈ Đang giao hàng</span>
                                </SelectItem>
                                <SelectItem value="Completed" className="text-emerald-600 font-bold text-xs cursor-pointer">
                                    <span className="flex items-center gap-2 uppercase tracking-wider italic">✓ Hoàn thành</span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className={FORM_LABEL_CLASS}>
                            <CreditCard size={12} className="inline mr-1" /> Tình trạng thanh toán
                        </Label>
                        <Select 
                            value={form.watch("paymentStatus")}
                            onValueChange={(val) => form.setValue("paymentStatus", val as any)}
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
                            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành"
                            className={cn(FORM_INPUT_CLASS, "h-12 font-bold")}
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-slate-400">
                    <Package size={20} />
                </div>
                <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900">Chi tiết sản phẩm</p>
                    <p className="text-[10px] text-slate-400 font-medium">Việc quản lý danh sách sản phẩm lẻ sẽ được thực hiện tại màn hình kho hàng sau khi khởi tạo đơn.</p>
                </div>
            </div>

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
                    className={cn(
                        "px-10 font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2",
                        isEdit ? "bg-blue-600 hover:bg-blue-700 shadow-blue-100 text-white" : "bg-slate-900 hover:bg-slate-800 shadow-slate-200 text-white"
                    )}
                >
                    <Save size={18} /> {isEdit ? "Xác nhận lưu" : "Tạo đơn sỉ"}
                </Button>
            </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
