import React from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog"
import { formatDate } from "../../inventory/utils"
import type { Customer } from "../types"
import { User, Phone, Mail, MapPin, Trophy, Wallet, ShoppingBag, Calendar, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface CustomerDetailDialogProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerDetailDialog({ customer, isOpen, onClose }: CustomerDetailDialogProps) {
  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-full sm:max-w-4xl lg:max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-slate-200 shadow-2xl rounded-2xl">
        <DialogHeader className="p-8 pb-4 bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-left">
              <div className="flex items-center gap-3 mb-2">
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                  customer.status === "Active" ? "bg-green-50 text-green-700 border-green-100" : "bg-slate-100 text-slate-500 border-slate-200"
                )}>
                  {customer.status === "Active" ? "Active" : "Inactive"}
                </span>
                <span className="text-xs font-mono text-slate-400">#{customer.customerCode}</span>
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                {customer.name}
              </DialogTitle>
              <DialogDescription className="text-slate-500 mt-1 flex items-center gap-4">
                <span className="flex items-center gap-1"><Phone size={14} /> {customer.phone}</span>
                {customer.email && <span className="flex items-center gap-1"><Mail size={14} /> {customer.email}</span>}
              </DialogDescription>
            </div>
            
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-right border-r pr-4 border-slate-100">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Điểm tích lũy</p>
                    <p className="text-2xl font-black text-slate-900">{customer.loyaltyPoints} <span className="text-sm font-normal text-slate-400">pts</span></p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Tổng chi tiêu</p>
                    <p className="text-2xl font-black text-slate-900">{(customer.totalSpent || 0).toLocaleString()} <span className="text-sm font-normal text-slate-400">đ</span></p>
                </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 pt-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <MetricItem icon={ShoppingBag} label="Tổng đơn hàng" value={`${customer.orderCount || 0} đơn`} />
            <MetricItem icon={Calendar} label="Ngày gia nhập" value={formatDate(customer.createdAt)} />
            <MetricItem icon={Activity} label="Lần cuối mua hàng" value="15 ngày trước" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-4 flex items-center gap-2">
                        <MapPin size={16} className="text-slate-400" /> Địa chỉ giao hàng
                    </h3>
                    <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                        {customer.address || "Chưa cập nhật địa chỉ"}
                    </p>
                </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative shadow-xl">
                <Trophy className="absolute -bottom-6 -right-6 text-white/10" size={120} />
                <h3 className="text-sm font-black uppercase tracking-widest text-white/60 mb-1">Hạng thành viên</h3>
                <p className="text-3xl font-black mb-4">GOLD MEMBER</p>
                <div className="space-y-2 relative z-10">
                    <div className="flex justify-between text-xs font-bold text-white/60 uppercase">
                        <span>Tiến trình lên Platinum</span>
                        <span>75%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white w-3/4 rounded-full shadow-[0_0_10px_white]" />
                    </div>
                </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
           <Button variant="outline" onClick={onClose} className="px-6 border-slate-300">Đóng</Button>
           <Button className="bg-slate-900 hover:bg-slate-800 text-white px-6 shadow-lg shadow-slate-200">
             Chỉnh sửa hồ sơ
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MetricItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-slate-300 transition-colors">
      <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-50">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1.5">{label}</p>
        <p className="text-sm font-black text-slate-900 leading-none">{value}</p>
      </div>
    </div>
  )
}

import { cn } from "@/lib/utils"
