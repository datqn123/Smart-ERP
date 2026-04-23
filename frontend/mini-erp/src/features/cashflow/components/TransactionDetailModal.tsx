import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/features/inventory/utils"
import { Calendar, Tag, FileText, Banknote, Clock, User } from "lucide-react"
import type { Transaction } from "../types"

interface TransactionDetailModalProps {
  transaction: Transaction | null
  isOpen: boolean
  onClose: () => void
}

export function TransactionDetailModal({ transaction, isOpen, onClose }: TransactionDetailModalProps) {
  if (!transaction) return null

  const isIncome = transaction.direction === 'Income'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl bg-white/95 backdrop-blur-xl">
        <DialogHeader className="p-6 pb-4 bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center justify-between pr-8">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold text-slate-900">Chi tiết giao dịch</DialogTitle>
              <p className="text-sm text-slate-500 font-mono">{transaction.transactionCode}</p>
            </div>
            <Badge className={
              transaction.status === 'Completed' ? "bg-green-50 text-green-700 border-green-200" :
              transaction.status === 'Pending' ? "bg-amber-50 text-amber-700 border-amber-200" :
              "bg-red-50 text-red-700 border-red-200"
            }>
              {transaction.status === 'Completed' ? 'Hoàn thành' : transaction.status === 'Pending' ? 'Chờ xử lý' : 'Đã hủy'}
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Amount Section */}
          <div className="flex flex-col items-center justify-center py-6 bg-slate-50/80 rounded-2xl border border-slate-100/50">
            <span className="text-sm font-medium text-slate-500 mb-1">Số tiền giao dịch</span>
            <span className={`text-3xl font-bold tracking-tight ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
            </span>
            <Badge variant="outline" className={`mt-3 font-normal border-slate-200 ${isIncome ? 'bg-emerald-50/50 text-emerald-700' : 'bg-rose-50/50 text-rose-700'}`}>
              {isIncome ? 'Phiếu thu' : 'Phiếu chi'}
            </Badge>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-5">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600 shrink-0">
                <Tag className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Phân loại</p>
                <p className="text-sm font-semibold text-slate-900">{transaction.category}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Thời gian</p>
                <p className="text-sm font-semibold text-slate-900">
                  {new Date(transaction.transactionDate).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600 shrink-0">
                <FileText className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Ghi chú / Diễn giải</p>
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  "{transaction.description || 'Không có ghi chú'}"
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            Đóng
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
