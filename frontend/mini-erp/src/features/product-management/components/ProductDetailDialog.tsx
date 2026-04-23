import React from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog"
import { formatDate } from "../../inventory/utils"
import type { Product } from "../types"
import { Package, Hash, Tag, Layers, Barcode, Calendar, Activity, DollarSign, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProductDetailDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailDialog({ product, isOpen, onClose }: ProductDetailDialogProps) {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-full sm:max-w-4xl lg:max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-slate-200 shadow-2xl rounded-2xl">
        <DialogHeader className="p-8 pb-4 bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex gap-6">
                <div className="h-24 w-24 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-200 overflow-hidden shadow-sm">
                    {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                        <ImageIcon size={40} />
                    )}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      product.status === "Active" ? "bg-green-50 text-green-700 border-green-100" : "bg-slate-100 text-slate-500 border-slate-200"
                    )}>
                      {product.status === "Active" ? "Active" : "Inactive"}
                    </span>
                    <span className="text-xs font-mono text-slate-400">SKU: {product.skuCode}</span>
                  </div>
                  <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">
                    {product.name}
                  </DialogTitle>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    Danh mục: <span className="text-slate-900">{product.categoryName || "Chưa phân loại"}</span>
                  </p>
                </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-right border-r pr-4 border-slate-100">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Tồn kho hiện tại</p>
                    <p className="text-2xl font-black text-slate-900">{product.currentStock || 0} <span className="text-sm font-normal text-slate-400">sp</span></p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Giá bán lẻ</p>
                    <p className="text-2xl font-black text-slate-900">{(product.currentPrice || 0).toLocaleString()} <span className="text-sm font-normal text-slate-400">đ</span></p>
                </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 pt-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <MetricItem icon={Barcode} label="Mã vạch (Barcode)" value={product.barcode || "—"} />
            <MetricItem icon={Layers} label="Khối lượng (Unit)" value={`${product.weight || 0} g`} />
            <MetricItem icon={Calendar} label="Ngày tạo sản phẩm" value={formatDate(product.createdAt)} />
          </div>

          <div className="space-y-6">
            <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-4 flex items-center gap-2">
                    <Tag size={16} className="text-slate-400" /> Mô tả chi tiết sản phẩm
                </h3>
                <div className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 min-h-[100px]">
                    {product.description || "Chưa có mô tả cho sản phẩm này."}
                </div>
            </div>
            
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <Activity size={20} />
                </div>
                <div>
                   <p className="text-sm font-bold text-amber-900 mb-1">Cảnh báo tồn kho</p>
                   <p className="text-xs text-amber-700 leading-relaxed">Sản phẩm này đang dưới định mức an toàn (mặc định 10 sp). Vui lòng kiểm tra và lên kế hoạch nhập hàng.</p>
                </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
           <Button variant="outline" onClick={onClose} className="px-6 border-slate-300">Đóng</Button>
           <Button className="bg-slate-900 hover:bg-slate-800 text-white px-6 shadow-lg shadow-slate-200">
             Chỉnh sửa sản phẩm
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
