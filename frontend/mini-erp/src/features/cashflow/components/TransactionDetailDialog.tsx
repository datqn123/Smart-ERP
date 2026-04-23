import React from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog"
import { formatCurrency, formatDate } from "@/features/inventory/utils"
import { Calendar, Tag, FileText, Banknote, Clock, ArrowUpCircle, ArrowDownCircle, CheckCircle2, CreditCard, Activity } from "lucide-react"
import type { Transaction } from "../types"
import { paymentMethodLabel } from "../utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  FORM_LABEL_CLASS,
} from "@/lib/data-table-layout"

interface TransactionDetailDialogProps {
  transaction: Transaction | null
  isOpen: boolean
  onClose: () => void
}

export function TransactionDetailDialog({ transaction, isOpen, onClose }: TransactionDetailDialogProps) {
  if (!transaction) return null
  const isIncome = transaction.direction === 'Income'

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-slate-200 shadow-xl rounded-2xl text-slate-900">
        <DialogHeader className="p-8 pb-6 bg-slate-50/50 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-left">
              <div className="flex items-center gap-3 mb-2">
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                  transaction.status === 'Completed' ? "bg-green-50 text-green-700 border-green-200" :
                  transaction.status === 'Pending' ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-red-50 text-red-700 border-red-200"
                )}>
                  {transaction.status === 'Completed' ? 'Hoàn thành' : transaction.status === 'Pending' ? 'Chờ duyệt' : 'Đã hủy'}
                </span>
                <span className="text-xs font-mono text-slate-400">Transaction Ref: {transaction.transactionCode}</span>
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                CHI TIẾT {isIncome ? "PHIẾU THU" : "PHIẾU CHI"}
              </DialogTitle>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-slate-900 text-white">
                   {isIncome ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Giá trị biến động</p>
                    <p className={cn(
                        "text-xl font-black tracking-tight",
                        isIncome ? "text-emerald-600" : "text-rose-600"
                    )}>
                        {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 pt-6 space-y-10">
          <div className="grid grid-cols-2 gap-x-10 gap-y-7">
            {/* Row 1 */}
            <div className="space-y-2">
              <Label className={FORM_LABEL_CLASS}>
                <Tag size={12} className="inline mr-1" /> Dòng tiền
              </Label>
              <div className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center px-5 font-bold text-slate-900 shadow-sm">
                {transaction.category}
              </div>
            </div>

            <div className="space-y-2">
              <Label className={FORM_LABEL_CLASS}>
                <Calendar size={12} className="inline mr-1" /> Ngày thực hiện
              </Label>
              <div className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center px-5 font-bold text-slate-900 shadow-sm">
                {formatDate(transaction.transactionDate)}
              </div>
            </div>

            {/* Row 2 */}
            <div className="space-y-2">
              <Label className={FORM_LABEL_CLASS}>
                <CreditCard size={12} className="inline mr-1" /> Hình thức thanh toán
              </Label>
              <div className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center px-5 font-bold text-slate-900 shadow-sm">
                {paymentMethodLabel(transaction.paymentMethod)}
              </div>
            </div>

            <div className="space-y-2">
              <Label className={FORM_LABEL_CLASS}>
                <Activity size={12} className="inline mr-1" /> Tình trạng phiếu
              </Label>
              <div className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center px-5 font-bold text-slate-900 shadow-sm">
                {transaction.status === 'Completed' ? 'Đã hoàn thành' : 
                 transaction.status === 'Pending' ? 'Đang chờ xử lý' : 'Đã hủy bỏ'}
              </div>
            </div>

            {/* Row 3 - Full Description */}
            <div className="col-span-2 space-y-2">
                <Label className={FORM_LABEL_CLASS}>
                    <FileText size={12} className="inline mr-1" /> Nội dung diễn giải
                </Label>
                <div className="p-5 bg-slate-50/50 border border-slate-100 rounded-2xl font-medium text-slate-700 shadow-sm min-h-[100px] leading-relaxed italic">
                    {transaction.description || "Không có diễn giải chi tiết cho giao dịch này."}
                </div>
            </div>
          </div>

          <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-900 shrink-0 shadow-sm">
                <CheckCircle2 size={18} />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Xác thực hệ thống</p>
                <p className="text-xs text-slate-500 leading-relaxed font-medium italic">
                    Chứng từ này được xác thực bởi bộ phận kế toán. Mọi thay đổi sẽ được lưu vết vĩnh viễn trong nhật ký hoạt động của doanh nghiệp để phục vụ công tác đối soát nợ.
                </p>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} className="px-6 font-bold text-slate-400 hover:text-slate-900 rounded-xl">Đóng</Button>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white px-8 font-black uppercase tracking-widest shadow-lg shadow-slate-200 rounded-xl">
                <Banknote className="mr-2" size={18} /> In chứng từ
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
