import React from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog"
import { formatCurrency, formatDate } from "@/features/inventory/utils"
import { Calendar, User, FileText, Scale, Timer, ShieldCheck, CheckCircle2, DollarSign, Wallet } from "lucide-react"
import type { Debt } from "../types"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface DebtDetailDialogProps {
  debt: Debt | null
  isOpen: boolean
  onClose: () => void
}

export function DebtDetailDialog({ debt, isOpen, onClose }: DebtDetailDialogProps) {
  if (!debt) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-slate-200 shadow-xl rounded-2xl text-slate-900">
        <DialogHeader className="p-8 pb-6 bg-slate-50/50 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-left">
              <div className="flex items-center gap-3 mb-2">
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                  debt.status === 'Cleared' ? "bg-green-50 text-green-700 border-green-200" : "bg-rose-50 text-rose-700 border-rose-200"
                )}>
                  {debt.status === 'Cleared' ? 'Đã tất toán' : 'Còn nợ'}
                </span>
                <span className="text-xs font-mono text-slate-400">Ref: {debt.debtCode}</span>
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                CHI TIẾT CÔNG NỢ
              </DialogTitle>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-slate-900 text-white">
                   <Scale size={20} />
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Nợ còn lại</p>
                    <p className="text-xl font-black tracking-tight text-rose-600">
                        {formatCurrency(debt.remainingAmount)}
                    </p>
                </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 pt-6 space-y-10">
          <div className="grid grid-cols-2 gap-x-10 gap-y-7">
            {/* Row 1 */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                <User size={12} /> Đối tác
              </Label>
              <div className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center px-5 font-bold text-slate-900 shadow-sm">
                {debt.partnerName}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                <ShieldCheck size={12} /> Phân loại
              </Label>
              <div className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center px-5 font-bold text-slate-900 shadow-sm uppercase text-xs tracking-wider">
                {debt.partnerType === 'Customer' ? 'Khách hàng' : 'Nhà cung cấp'}
              </div>
            </div>

            {/* Row 2 */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                <DollarSign size={12} /> Tổng giá trị khoản nợ
              </Label>
              <div className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center px-5 font-black text-slate-900 shadow-sm text-lg">
                {formatCurrency(debt.totalAmount)}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                <CheckCircle2 size={12} /> Đã thanh toán (tích lũy)
              </Label>
              <div className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center px-5 font-black text-emerald-600 shadow-sm text-lg">
                {formatCurrency(debt.paidAmount)}
              </div>
            </div>

            {/* Row 3 */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                <Calendar size={12} /> Ngày ghi nhận
              </Label>
              <div className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center px-5 font-bold text-slate-900 shadow-sm">
                {formatDate(debt.createdAt)}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                <Timer size={12} /> Hạn thanh toán
              </Label>
              <div className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center px-5 font-bold text-slate-900 shadow-sm italic">
                {debt.dueDate ? formatDate(debt.dueDate) : 'Không thiết lập'}
              </div>
            </div>

            {/* Row 4 - Full Description */}
            <div className="col-span-2 space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                    <FileText size={12} /> Nội dung diễn giải chi tiết
                </Label>
                <div className="p-5 bg-slate-50/50 border border-slate-100 rounded-2xl font-medium text-slate-700 shadow-sm min-h-[100px] leading-relaxed italic">
                    {debt.notes || "Không có diễn giải chi tiết cho khoản nợ này."}
                </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} className="px-6 font-bold text-slate-400 hover:text-slate-900 rounded-xl">Đóng</Button>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white px-8 font-black uppercase tracking-widest shadow-lg shadow-slate-200 rounded-xl">
                <Wallet className="mr-2" size={18} /> In sao kê nợ
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
