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
  Info,
  RotateCcw,
  AlertCircle,
  FileText
} from "lucide-react"
import type { Order } from "../types"
import { cn } from "@/lib/utils"
import {
  FORM_LABEL_CLASS,
  FORM_INPUT_CLASS,
} from "@/lib/data-table-layout"

interface ReturnFormDialogProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onSave?: (data: any) => void
}

export function ReturnFormDialog({ order, isOpen, onClose, onSave }: ReturnFormDialogProps) {
  const isEdit = !!order
  
  const form = useForm({
    defaultValues: order || {
      orderCode: "",
      customerName: "",
      status: "Pending",
      paymentStatus: "Unpaid",
      totalAmount: 0,
      notes: ""
    }
  })

  // Update form when order changes
  React.useEffect(() => {
    if (order) {
      form.reset(order)
    } else {
      form.reset({
        orderCode: `RET-${Math.floor(Math.random() * 1000)}`,
        customerName: "",
        status: "Pending",
        paymentStatus: "Unpaid",
        totalAmount: 0,
        notes: ""
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
          <div className="absolute -right-4 -top-4 size-32 text-amber-100/50 rotate-12">
            <RotateCcw size={128} />
          </div>
          
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105",
                isEdit ? "bg-amber-500 text-white shadow-amber-200" : "bg-orange-600 text-white shadow-orange-200"
            )}>
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
            {isEdit ? `Điều chỉnh thông tin cho phiếu trả #${order.orderCode}` : "Nhập đầy đủ thông tin để khởi tạo quy trình hoàn trả hàng hóa"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="p-8 space-y-8">
            <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
                    <Info size={14} className="text-slate-400" /> Thông tin cơ bản
                </h3>
                
                {/* Row 1: Mã phiếu & Khách hàng */}
                <div className="grid grid-cols-2 gap-x-10 gap-y-7">
                    <div className="space-y-2">
                        <Label className={FORM_LABEL_CLASS}>
                            <Hash size={12} className="inline mr-1" /> Mã phiếu trả *
                        </Label>
                        <Input 
                            {...form.register("orderCode")}
                            disabled={isEdit}
                            placeholder="Nhập mã phiếu (Ví dụ: RET-001)"
                            className={cn(FORM_INPUT_CLASS, "h-12 font-bold")}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className={FORM_LABEL_CLASS}>
                            <User size={12} className="inline mr-1" /> Khách hàng hoàn trả *
                        </Label>
                        <Input 
                            {...form.register("customerName")}
                            placeholder="Tên khách hàng / Đại lý"
                            className={cn(FORM_INPUT_CLASS, "h-12 font-bold")}
                        />
                    </div>

                    {/* Row 2: Trạng thái & Hoàn tiền */}
                    <div className="space-y-2">
                        <Label className={FORM_LABEL_CLASS}>
                            <Activity size={12} className="inline mr-1" /> Trạng thái xử lý
                        </Label>
                        <Select 
                            value={form.watch("status")}
                            onValueChange={(val) => form.setValue("status", val as any)}
                        >
                            <SelectTrigger className={cn(FORM_INPUT_CLASS, "h-12 font-bold")}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                <SelectItem value="Pending" className="text-amber-600 font-bold text-xs cursor-pointer uppercase tracking-wider italic">○ Đang tiếp nhận</SelectItem>
                                <SelectItem value="Processing" className="text-blue-600 font-bold text-xs cursor-pointer uppercase tracking-wider italic">● Đang kiểm định</SelectItem>
                                <SelectItem value="Completed" className="text-emerald-600 font-bold text-xs cursor-pointer uppercase tracking-wider italic">✓ Đã xử lý xong</SelectItem>
                                <SelectItem value="Cancelled" className="text-red-600 font-bold text-xs cursor-pointer uppercase tracking-wider italic">✕ Đã hủy</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className={FORM_LABEL_CLASS}>
                            <CreditCard size={12} className="inline mr-1" /> Tình trạng hoàn tiền
                        </Label>
                        <Select 
                            value={form.watch("paymentStatus")}
                            onValueChange={(val) => form.setValue("paymentStatus", val as any)}
                        >
                            <SelectTrigger className={cn(FORM_INPUT_CLASS, "h-12 font-bold")}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                <SelectItem value="Unpaid" className="text-red-500 font-bold text-xs cursor-pointer uppercase tracking-wider italic">Chưa hoàn tiền</SelectItem>
                                <SelectItem value="Partial" className="text-amber-500 font-bold text-xs cursor-pointer uppercase tracking-wider italic">Hoàn tiền một phần</SelectItem>
                                <SelectItem value="Paid" className="text-emerald-500 font-bold text-xs cursor-pointer uppercase tracking-wider italic">Đã thanh toán xong</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Row 3: Lý do trả hàng (Full width symmetry) */}
                    <div className="space-y-2 col-span-2">
                        <Label className={FORM_LABEL_CLASS}>
                            <FileText size={12} className="inline mr-1" /> Lý do hoàn trả & Ghi chú
                        </Label>
                        <Input 
                            {...form.register("notes")}
                            placeholder="Ví dụ: Sản phẩm lỗi sản xuất, Giao sai chủng loại..."
                            className={cn(FORM_INPUT_CLASS, "h-12 font-bold")}
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-amber-500 shadow-sm">
                    <AlertCircle size={20} />
                </div>
                <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900">Kiểm tra quy định hoàn trả</p>
                    <p className="text-[10px] text-slate-400 font-medium">Đảm bảo sản phẩm còn nguyên tem mác hoặc có xác nhận lỗi từ bộ phận kiểm định trước khi hoàn tất phiếu.</p>
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
                        isEdit ? "bg-amber-500 hover:bg-amber-600 shadow-amber-100 text-white" : "bg-orange-600 hover:bg-orange-700 shadow-orange-100 text-white"
                    )}
                >
                    <Save size={18} /> {isEdit ? "Cập nhật phiếu" : "Xác nhận trả"}
                </Button>
            </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
