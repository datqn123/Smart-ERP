import React from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog"
import { formatDate } from "../utils"
import type { StockDispatch } from "../types"
import { StatusBadge } from "./StatusBadge"
import { Package, Calendar, User, Truck, MapPin, ClipboardList, CheckCircle2, XCircle, Printer, Boxes, Timer, Activity, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface DispatchDetailDialogProps {
  dispatch: StockDispatch | null;
  isOpen: boolean;
  onClose: () => void;
  canApprove?: boolean;
}

export function DispatchDetailDialog({ dispatch, isOpen, onClose, canApprove = false }: DispatchDetailDialogProps) {
  if (!dispatch) return null;

  const handleComplete = () => alert(`Đã hoàn tất xuất kho phiếu ${dispatch.dispatchCode}`);
  const handleCancel = () => alert(`Đã hủy phiếu ${dispatch.dispatchCode}`);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-full sm:max-w-5xl lg:max-w-5xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-slate-200 shadow-2xl rounded-2xl">
        <DialogHeader className="p-8 pb-4 bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="text-left">
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge status={dispatch.status} type="dispatch" />
                <span className="text-xs font-mono text-slate-400">Inventory ID: #{dispatch.id}</span>
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                Phiếu xuất kho <span className="text-slate-400 font-medium">#{dispatch.dispatchCode}</span>
              </DialogTitle>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2 font-medium">
                <UserCircle size={14} className="text-slate-300" /> Khách hàng: <span className="font-bold text-slate-900">{dispatch.customerName}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-right border-r pr-4 border-slate-100">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Mã đơn hàng</p>
                    <p className="text-sm font-black text-slate-900">{dispatch.orderCode}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Số lượng hàng</p>
                    <p className="text-2xl font-black text-slate-900">{dispatch.items.length} <span className="text-[10px] text-slate-400">SKU</span></p>
                </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 pt-6">
          {/* Progress Tracker (Premium Feel) */}
          <div className="mb-12 pt-4">
              <div className="flex justify-between relative">
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
                  <div className={cn("absolute top-1/2 left-0 h-0.5 bg-slate-900 -translate-y-1/2 z-0 transition-all duration-700", 
                    dispatch.status === "Pending" ? "w-0" : 
                    dispatch.status === "Partial" ? "w-1/2" : "w-full"
                  )} />
                  <Step icon={Timer} label="Tiếp nhận" active />
                  <Step icon={Activity} label="Đang soạn" active={["Partial", "Shipped"].includes(dispatch.status)} />
                  <Step icon={CheckCircle2} label="Đã xuất" active={ dispatch.status === "Shipped" } />
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
            <div className="space-y-6">
                <SectionHeader icon={ClipboardList} title="Chi tiết điều phối" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Ngày xuất dự kiến</p>
                        <p className="text-sm font-bold text-slate-900">{formatDate(dispatch.dispatchDate)}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Kho xuất hàng</p>
                        <p className="text-sm font-bold text-slate-900">Kho Trung Tâm</p>
                    </div>
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
                    <InfoLine icon={Truck} label="Hình thức" value="Giao hàng tận nơi" />
                    <InfoLine icon={User} label="Nhân viên phụ trách" value={dispatch.userName} />
                </div>

                {dispatch.notes && (
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <ClipboardList size={12} /> Chỉ dẫn Picking
                        </p>
                        <p className="text-sm text-slate-700 italic leading-relaxed">"{dispatch.notes}"</p>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <SectionHeader icon={Boxes} title="Picking List / Phiếu soạn hàng" />
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-0">
                                <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-wider h-10">Sản phẩm / Vị trí</TableHead>
                                <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-wider h-10 text-right">SL Đặt</TableHead>
                                <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-wider h-10 text-right">Thực xuất</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dispatch.items.map((item) => (
                                <TableRow key={item.id} className="hover:bg-slate-50/30 transition-colors border-slate-50">
                                    <TableCell className="py-3">
                                        <p className="font-bold text-slate-900">{item.productName}</p>
                                        <p className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded-md inline-block mt-1">
                                            {item.warehouseLocation} - {item.shelfCode}
                                        </p>
                                    </TableCell>
                                    <TableCell className="py-3 text-right">
                                        <span className="text-xs text-slate-400">{item.orderedQty} {item.unitName}</span>
                                    </TableCell>
                                    <TableCell className="py-3 text-right">
                                        <span className={cn(
                                            "font-black text-slate-900",
                                            item.dispatchQty < item.orderedQty && "text-amber-600"
                                        )}>{item.dispatchQty}</span>
                                        <span className="text-[10px] text-slate-400 ml-1">{item.unitName}</span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tình trạng soạn hàng</p>
                    <div className="flex items-center gap-2">
                         <div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-slate-900 transition-all duration-1000" 
                                style={{ width: `${(dispatch.items.filter(i => i.isFullyDispatched).length / dispatch.items.length) * 100}%` }}
                            />
                         </div>
                         <span className="text-[10px] font-black text-slate-900">
                             {dispatch.items.filter(i => i.isFullyDispatched).length}/{dispatch.items.length}
                         </span>
                    </div>
                </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
           <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-10 border-slate-300 bg-white shadow-sm">
                <Printer size={16} className="mr-2" /> In Picking List
              </Button>
           </div>
           
           <div className="flex gap-3 ml-auto">
              <Button variant="outline" onClick={onClose} className="border-slate-300 h-10 px-6">Đóng</Button>
              {canApprove && (dispatch.status === "Pending" || dispatch.status === "Partial") && (
                <>
                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 h-10 px-6" onClick={handleCancel}>
                    <XCircle className="w-4 h-4 mr-2" /> Hủy phiếu
                  </Button>
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white h-10 px-8 shadow-xl shadow-slate-200" onClick={handleComplete}>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Hoàn tất xuất kho
                  </Button>
                </>
              )}
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: any, title: string }) {
    return (
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-slate-100 rounded-lg"><Icon size={14} className="text-slate-900" /></div> {title}
        </h3>
    )
}

function InfoLine({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0">
            <div className="flex items-center gap-2 text-slate-400">
                <Icon size={14} />
                <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
            </div>
            <span className="text-sm font-bold text-slate-900">{value}</span>
        </div>
    )
}

function Step({ icon: Icon, label, active }: { icon: any, label: string, active?: boolean }) {
    return (
        <div className="flex flex-col items-center gap-2 relative z-10 group">
            <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500",
                active 
                    ? "bg-slate-900 border-slate-900 text-white shadow-[0_10px_20px_rgba(15,23,42,0.2)] scale-110" 
                    : "bg-white border-slate-100 text-slate-300"
            )}>
                <Icon size={18} />
            </div>
            <span className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                active ? "text-slate-900" : "text-slate-300"
            )}>{label}</span>
        </div>
    )
}
