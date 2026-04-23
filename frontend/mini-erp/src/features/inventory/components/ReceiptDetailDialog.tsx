import React from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog"
import { formatCurrency, formatDate } from "../utils"
import type { StockReceipt } from "../types"
import { StatusBadge } from "./StatusBadge"
import { Package, Calendar, User, Building2, Hash, FileText, CheckCircle2, XCircle, Timer, ClipboardCheck, Boxes, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface ReceiptDetailDialogProps {
  receipt: StockReceipt | null;
  isOpen: boolean;
  onClose: () => void;
  canApprove?: boolean;
}

export function ReceiptDetailDialog({ receipt, isOpen, onClose, canApprove = false }: ReceiptDetailDialogProps) {
  if (!receipt) return null;

  const handleApprove = () => alert(`Đã phê duyệt phiếu ${receipt.receiptCode} (Dữ liệu mock)`);
  const handleReject = () => alert(`Đã từ chối phiếu ${receipt.receiptCode} (Dữ liệu mock)`);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-full sm:max-w-5xl lg:max-w-5xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-slate-200 shadow-2xl rounded-2xl">
        <DialogHeader className="p-8 pb-4 bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="text-left">
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge status={receipt.status} />
                <span className="text-xs font-mono text-slate-400">Inventory ID: #{receipt.id}</span>
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                Phiếu nhập hàng <span className="text-slate-400 font-medium">#{receipt.receiptCode}</span>
              </DialogTitle>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2 font-medium">
                <Building2 size={14} className="text-slate-300" /> Nhà cung cấp: <span className="font-bold text-slate-900">{receipt.supplierName}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-right border-r pr-4 border-slate-100">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Số lượng</p>
                    <p className="text-sm font-black text-slate-900">{receipt.details.length} <span className="text-[10px] text-slate-400">SKU</span></p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Giá trị nhập</p>
                    <p className="text-2xl font-black text-slate-900">{formatCurrency(receipt.totalAmount)}</p>
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
                    receipt.status === "Draft" ? "w-0" : 
                    receipt.status === "Pending" ? "w-1/2" : "w-full"
                  )} />
                  <Step icon={Timer} label="Bản thảo" active />
                  <Step icon={Activity} label="Chờ duyệt" active={["Pending", "Approved"].includes(receipt.status)} />
                  <Step icon={CheckCircle2} label="Hoàn tất" active={ receipt.status === "Approved" } />
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
            <div className="space-y-6">
                <SectionHeader icon={ClipboardCheck} title="Thông tin nghiệp vụ" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Ngày lập phiếu</p>
                        <p className="text-sm font-bold text-slate-900">{formatDate(receipt.createdAt)}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Ngày nhập kho</p>
                        <p className="text-sm font-bold text-slate-900">{formatDate(receipt.receiptDate)}</p>
                    </div>
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
                    <InfoLine icon={Hash} label="Số hóa đơn" value={receipt.invoiceNumber || "—"} />
                    <InfoLine icon={User} label="Nhân viên tạo" value={receipt.staffName} />
                </div>

                {receipt.notes && (
                    <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
                        <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <FileText size={12} /> Ghi chú nội bộ
                        </p>
                        <p className="text-sm text-amber-900 italic leading-relaxed">"{receipt.notes}"</p>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <SectionHeader icon={Boxes} title="Danh sách hàng hóa" />
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-0">
                                <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-wider h-10">Sản phẩm</TableHead>
                                <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-wider h-10 text-right">SL</TableHead>
                                <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-wider h-10 text-right">Thành tiền</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {receipt.details.map((item) => (
                                <TableRow key={item.id} className="hover:bg-slate-50/30 transition-colors border-slate-50">
                                    <TableCell className="py-3">
                                        <p className="font-bold text-slate-900">{item.productName}</p>
                                        <p className="text-[10px] text-slate-400 font-mono italic">{item.skuCode}</p>
                                    </TableCell>
                                    <TableCell className="py-3 text-right">
                                        <span className="font-bold text-slate-900">{item.quantity}</span>
                                        <span className="text-[10px] text-slate-400 ml-1">{item.unitName}</span>
                                    </TableCell>
                                    <TableCell className="py-3 text-right font-black text-slate-900">
                                        {item.lineTotal.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="p-5 bg-slate-900 rounded-2xl text-white shadow-xl">
                    <div className="flex justify-between items-center mb-1 opacity-60 text-[10px] uppercase tracking-widest font-bold">
                        <span>Giá trị hàng hóa</span>
                        <span>{formatCurrency(receipt.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4 text-[10px] uppercase tracking-widest font-bold opacity-60">
                        <span>Thuế & Phí</span>
                        <span>0 ₫</span>
                    </div>
                    <Separator className="bg-white/10 mb-4" />
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Tổng thanh toán</span>
                        <span className="text-2xl font-black">{formatCurrency(receipt.totalAmount)}</span>
                    </div>
                </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
           {receipt.approvedByName && (
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-lg">
                    <CheckCircle2 size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Xác nhận nhập kho</p>
                    <p className="text-sm font-bold text-slate-900 leading-none">{receipt.approvedByName} <span className="text-slate-400 font-normal ml-1">vào {formatDate(receipt.approvedAt!)}</span></p>
                 </div>
              </div>
           )}
           
           <div className="flex gap-3 ml-auto">
              <Button variant="outline" onClick={onClose} className="border-slate-300 h-10 px-6">Đóng</Button>
              {canApprove && receipt.status === "Pending" && (
                <>
                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-10" onClick={handleReject}>
                    <XCircle className="w-4 h-4 mr-2" /> Từ chối
                  </Button>
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white h-10 shadow-lg" onClick={handleApprove}>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Duyệt phiếu
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
