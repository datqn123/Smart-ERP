import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
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
  User, 
  DollarSign, 
  FileText, 
  Scale,
  PlusCircle,
  Save,
  ShieldCheck,
  Timer
} from "lucide-react"
import { toast } from "sonner"
import type { Debt } from "../types"
import { cn } from "@/lib/utils"
import {
  FORM_LABEL_CLASS,
  FORM_INPUT_CLASS,
} from "@/lib/data-table-layout"

interface DebtFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Debt | null;
  mode: 'create' | 'edit';
}

export function DebtFormDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  mode 
}: DebtFormDialogProps) {
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: initialData || {
      debtCode: `DEBT-${Math.floor(Date.now() / 1000)}`,
      partnerName: '',
      partnerType: 'Customer' as const,
      customerId: null as number | null,
      supplierId: null as number | null,
      totalAmount: 0,
      paidAmount: 0,
      dueDate: '',
      notes: '',
    }
  })

  useEffect(() => {
    if (initialData) {
      reset({
        debtCode: initialData.debtCode,
        partnerName: initialData.partnerName,
        partnerType: initialData.partnerType,
        customerId: initialData.customerId ?? null,
        supplierId: initialData.supplierId ?? null,
        totalAmount: initialData.totalAmount,
        paidAmount: initialData.paidAmount,
        dueDate: initialData.dueDate ?? '',
        notes: initialData.notes ?? '',
      })
    } else {
        reset({
            debtCode: `DEBT-${Math.floor(Date.now() / 1000)}`,
            partnerName: '',
            partnerType: 'Customer',
            customerId: null,
            supplierId: null,
            totalAmount: 0,
            paidAmount: 0,
            dueDate: '',
            notes: '',
        })
    }
  }, [initialData, reset, isOpen])

  const onFormSubmit = (data: Record<string, unknown>) => {
    const paid = Number(data.paidAmount)
    const total = Number(data.totalAmount)
    if (paid > total) {
        toast.error("Số tiền đã trả không được lớn hơn tổng nợ!");
        return;
    }
    const remainingAmount = total - paid
    const partnerType = data.partnerType as "Customer" | "Supplier"
    const finalData = {
        ...data,
        remainingAmount,
        status: (remainingAmount <= 0 ? "Cleared" : "InDebt") as "Cleared" | "InDebt",
        customerId: partnerType === "Customer" ? (data.customerId as number | null) ?? null : null,
        supplierId: partnerType === "Supplier" ? (data.supplierId as number | null) ?? null : null,
        dueDate: (data.dueDate as string) || null,
        notes: (data.notes as string) || null,
    }
    onSubmit(finalData);
    toast.success(mode === 'create' ? "Đã lưu khoản nợ!" : "Đã cập nhật!");
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 gap-0 border-slate-200 shadow-xl rounded-2xl overflow-hidden text-slate-900">
        <DialogHeader className="p-8 pb-6 bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-200 flex items-center justify-center">
              <Scale size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Quản lý công nợ đối tác</p>
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                {mode === 'create' ? "GHI NHẬN KHOẢN NỢ" : "CẬP NHẬT THANH TOÁN"}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-8 pt-6 space-y-8">
          <div className="grid grid-cols-2 gap-x-10 gap-y-7">
            {/* Row 1 */}
            <div className="space-y-2">
              <Label className={FORM_LABEL_CLASS}>
                <User size={12} className="inline mr-1" /> Tên đối tác
              </Label>
              <Input 
                {...register('partnerName')}
                placeholder="Khách hàng hoặc NCC..."
                className={cn(FORM_INPUT_CLASS, "h-14 font-bold")}
              />
            </div>

            <div className="space-y-2">
              <Label className={FORM_LABEL_CLASS}>
                <ShieldCheck size={12} className="inline mr-1" /> Phân loại
              </Label>
              <Select 
                value={watch('partnerType')} 
                onValueChange={(val) => setValue('partnerType', val as "Customer" | "Supplier")}
              >
                <SelectTrigger className={cn(FORM_INPUT_CLASS, "h-14 font-bold")}>
                  <SelectValue placeholder="Chọn loại..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                  <SelectItem value="Customer">Khách hàng</SelectItem>
                  <SelectItem value="Supplier">Nhà cung cấp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 2 */}
            <div className="space-y-2">
              <Label className={FORM_LABEL_CLASS}>
                <DollarSign size={12} className="inline mr-1" /> Tổng giá trị nợ (VNĐ)
              </Label>
              <Input 
                type="number"
                {...register('totalAmount', { valueAsNumber: true })}
                className={cn(FORM_INPUT_CLASS, "h-14 font-black text-lg")}
              />
            </div>

            <div className="space-y-2">
              <Label className={FORM_LABEL_CLASS}>
                <PlusCircle size={12} className="inline mr-1" /> Đã thanh toán
              </Label>
              <Input 
                type="number"
                {...register('paidAmount', { valueAsNumber: true })}
                className={cn(FORM_INPUT_CLASS, "h-14 font-black text-lg text-emerald-600")}
              />
            </div>

            {/* Row 3 */}
            <div className="space-y-2 col-span-2">
              <Label className={FORM_LABEL_CLASS}>
                <Timer size={12} className="inline mr-1" /> Thời hạn tất toán
              </Label>
              <Input 
                type="date"
                {...register('dueDate')}
                className={cn(FORM_INPUT_CLASS, "h-14 font-bold")}
              />
            </div>

            {/* Row 4: Description */}
            <div className="col-span-2 space-y-2">
                <Label className={FORM_LABEL_CLASS}>
                    <FileText size={12} className="inline mr-1" /> Nội dung ghi chú nợ
                </Label>
                <Input 
                    {...register('notes')}
                    placeholder="VD: Nợ tiền nhập hàng sơn..."
                    className={cn(FORM_INPUT_CLASS, "h-14 font-medium")}
                />
            </div>
          </div>
        </form>

        <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
           <div className="hidden md:block flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Kế hoạch tài chính</p>
              <p className="text-xs text-slate-500 font-medium italic">Hệ thống ghi nhận nợ tự động</p>
           </div>
           <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose} className="px-6 font-bold text-slate-400 hover:text-slate-900 rounded-xl">Hủy</Button>
              <Button 
                onClick={handleSubmit(onFormSubmit)}
                className="px-8 font-black uppercase tracking-widest bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-200 rounded-xl text-white font-black"
              >
                {mode === 'edit' ? <Save className="mr-2" size={18} /> : <PlusCircle className="mr-2" size={18} />}
                {mode === 'edit' ? "Lưu cập nhật" : "Ghi nhận nợ"}
              </Button>
           </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
