import React from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog"
import { formatDate } from "../../inventory/utils"
import type { Supplier } from "../types"
import { Building2, Phone, Mail, MapPin, CreditCard, User, Package, Calendar, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface SupplierDetailDialogProps {
  supplier: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SupplierDetailDialog({ supplier, isOpen, onClose }: SupplierDetailDialogProps) {
  if (!supplier) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-full sm:max-w-4xl lg:max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-slate-200 shadow-2xl rounded-2xl">
        <DialogHeader className="p-8 pb-4 bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-left">
              <div className="flex items-center gap-3 mb-2">
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                  supplier.status === "Active" ? "bg-green-50 text-green-700 border-green-100" : "bg-slate-100 text-slate-500 border-slate-200"
                )}>
                  {supplier.status === "Active" ? "Active" : "Inactive"}
                </span>
                <span className="text-xs font-mono text-slate-400">#{supplier.supplierCode}</span>
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                {supplier.name}
              </DialogTitle>
              <DialogDescription className="text-slate-500 mt-1 flex items-center gap-4">
                <span className="flex items-center gap-1"><User size={14} /> {supplier.contactPerson || "N/A"}</span>
                <span className="flex items-center gap-1"><Phone size={14} /> {supplier.phone}</span>
              </DialogDescription>
            </div>
            
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Số phiếu nhập</p>
                    <p className="text-2xl font-black text-slate-900">{supplier.receiptCount || 0} <span className="text-sm font-normal text-slate-400">phiếu</span></p>
                </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 pt-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <MetricItem icon={CreditCard} label="Mã số thuế" value={supplier.taxCode || "—"} />
            <MetricItem icon={Mail} label="Email liên hệ" value={supplier.email || "—"} />
            <MetricItem icon={Calendar} label="Ngày hợp tác" value={formatDate(supplier.createdAt)} />
          </div>

          <div className="space-y-6">
            <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-4 flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" /> Trụ sở / Địa chỉ kho
                </h3>
                <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                    {supplier.address || "Chưa cập nhật địa chỉ"}
                </p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Package size={20} />
                </div>
                <div>
                   <p className="text-sm font-bold text-blue-900 mb-1">Đối tác cung ứng tin cậy</p>
                   <p className="text-xs text-blue-700 leading-relaxed">Nhà cung cấp này đã hoàn thành 100% các đơn nhập hàng đúng hạn trong 3 tháng qua.</p>
                </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
           <Button variant="outline" onClick={onClose} className="px-6 border-slate-300">Đóng</Button>
           <Button className="bg-slate-900 hover:bg-slate-800 text-white px-6 shadow-lg shadow-slate-200">
             Chỉnh sửa thông tin
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
