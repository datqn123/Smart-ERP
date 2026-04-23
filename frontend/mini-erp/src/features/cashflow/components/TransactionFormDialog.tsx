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
  Wallet, 
  Calendar, 
  Tag, 
  FileText, 
  CreditCard,
  PlusCircle,
  Save,
  ArrowUpCircle,
  ArrowDownCircle,
  Activity
} from "lucide-react"
import { toast } from "sonner"
import type { Transaction } from "../types"
import { cn } from "@/lib/utils"
import {
  FORM_LABEL_CLASS,
  FORM_INPUT_CLASS,
} from "@/lib/data-table-layout"

interface TransactionFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Transaction | null;
  mode: 'create' | 'edit';
}

export function TransactionFormDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  mode 
}: TransactionFormDialogProps) {
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: initialData || {
      transactionCode: `TRANS-${Math.floor(Date.now() / 1000)}`,
      direction: 'Income',
      category: '',
      amount: 0,
      transactionDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash',
      status: 'Completed',
      description: ''
    }
  })

  useEffect(() => {
    if (initialData) {
      reset(initialData)
    } else {
        reset({
            transactionCode: `TRANS-${Math.floor(Date.now() / 1000)}`,
            direction: 'Income',
            category: '',
            amount: 0,
            transactionDate: new Date().toISOString().split('T')[0],
            paymentMethod: 'Cash',
            status: 'Completed',
            description: ''
        })
    }
  }, [initialData, reset, isOpen])

  const directionValue = watch('direction')

  const onFormSubmit = (data: any) => {
    onSubmit(data);
    toast.success(mode === 'create' ? "Đã tạo giao dịch!" : "Đã cập nhật!");
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 gap-0 border-slate-200 shadow-xl rounded-2xl overflow-hidden text-slate-900">
        <DialogHeader className="p-8 pb-6 bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-slate-900 text-white shadow-lg shadow-slate-200">
              {directionValue === 'Income' ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Tài chính & Thu chi</p>
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                {mode === 'create' ? "LẬP PHIẾU THU CHI" : "CẬP NHẬT GIAO DỊCH"}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-8 pt-6 space-y-8">
          <div className="grid grid-cols-2 gap-x-10 gap-y-7">
            {/* Row 1 */}
            <div className="space-y-2">
              <Label className={FORM_LABEL_CLASS}>
                <Tag size={12} className="inline mr-1" /> Loại giao dịch
              </Label>
              <Select 
                value={watch('direction') ?? 'Income'} 
                onValueChange={(val) => setValue('direction', val as "Income" | "Expense")}
              >
                <SelectTrigger className={cn(FORM_INPUT_CLASS, "h-14 font-bold")}>
                  <SelectValue placeholder="Chọn loại..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                  <SelectItem value="Income" className="text-emerald-600 font-bold">Thu tiền (+)</SelectItem>
                  <SelectItem value="Expense" className="text-rose-600 font-bold">Chi tiền (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className={FORM_LABEL_CLASS}>
                <FileText size={12} className="inline mr-1" /> Nhóm phân loại
              </Label>
              <Input 
                {...register('category')}
                placeholder="VD: Bán hàng, Nhập hàng, Lương..."
                className={cn(FORM_INPUT_CLASS, "h-14 font-bold")}
              />
            </div>

            {/* Row 2 */}
            <div className="space-y-2">
              <Label className={FORM_LABEL_CLASS}>
                <Wallet size={12} className="inline mr-1" /> Số tiền (VNĐ)
              </Label>
              <Input 
                type="number"
                {...register('amount', { valueAsNumber: true })}
                className={cn(FORM_INPUT_CLASS, "h-14 font-black text-lg")}
              />
            </div>

            <div className="space-y-2">
              <Label className={FORM_LABEL_CLASS}>
                <Calendar size={12} className="inline mr-1" /> Ngày giao dịch
              </Label>
              <Input 
                type="date"
                {...register('transactionDate')}
                className={cn(FORM_INPUT_CLASS, "h-14 font-bold")}
              />
            </div>

            {/* Row 3 */}
            <div className="space-y-2">
              <Label className={FORM_LABEL_CLASS}>
                <CreditCard size={12} className="inline mr-1" /> Phương thức
              </Label>
              <Select 
                 value={watch('paymentMethod') ?? 'Cash'} 
                 onValueChange={(val) => setValue('paymentMethod', val)}
              >
                <SelectTrigger className={cn(FORM_INPUT_CLASS, "h-14 font-bold")}>
                  <SelectValue placeholder="Chọn phương thức..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                  <SelectItem value="Cash">Tiền mặt</SelectItem>
                  <SelectItem value="BankTransfer">Chuyển khoản</SelectItem>
                  <SelectItem value="Credit">Thẻ tín dụng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className={FORM_LABEL_CLASS}>
                <Activity size={12} className="inline mr-1" /> Trạng thái
              </Label>
              <Select 
                 value={watch('status') ?? 'Completed'} 
                 onValueChange={(val) => setValue('status', val as "Completed" | "Pending" | "Cancelled")}
              >
                <SelectTrigger className={cn(FORM_INPUT_CLASS, "h-14 font-bold")}>
                  <SelectValue placeholder="Chọn trạng thái..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                  <SelectItem value="Completed">Hoàn thành</SelectItem>
                  <SelectItem value="Pending">Chờ xử lý</SelectItem>
                  <SelectItem value="Cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 4: Full width description */}
            <div className="col-span-2 space-y-2">
                <Label className={FORM_LABEL_CLASS}>
                    <FileText size={12} className="inline mr-1" /> Nội dung diễn giải
                </Label>
                <Input 
                    {...register('description')}
                    placeholder="VD: Thu tiền bán hàng cho khách A..."
                    className={cn(FORM_INPUT_CLASS, "h-14 font-medium")}
                />
            </div>
          </div>
        </form>

        <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
           <div className="hidden md:block">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Xác thực tài chính</p>
              <p className="text-xs text-slate-500 font-medium italic">Ghi nhật ký hệ thống: {new Date().toLocaleDateString()}</p>
           </div>
           <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose} className="px-6 font-bold text-slate-400 hover:text-slate-900 rounded-xl">Hủy bỏ</Button>
              <Button 
                onClick={handleSubmit(onFormSubmit)}
                className="px-8 font-black uppercase tracking-widest bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-200 rounded-xl text-white"
              >
                {mode === 'edit' ? <Save className="mr-2" size={18} /> : <PlusCircle className="mr-2" size={18} />}
                {mode === 'edit' ? "Lưu thay đổi" : "Lập phiếu"}
              </Button>
           </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
