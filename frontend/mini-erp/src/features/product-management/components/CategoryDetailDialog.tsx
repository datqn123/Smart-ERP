import React from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog"
import type { Category } from "../types"
import { FolderTree, Tag, Hash, Calendar, Layers, Boxes, Activity, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/features/inventory/utils"

interface CategoryDetailDialogProps {
  category: Category | null
  isOpen: boolean
  onClose: () => void
}

export function CategoryDetailDialog({ category, isOpen, onClose }: CategoryDetailDialogProps) {
  if (!category) return null

  const childCount = category.children?.length || 0

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-slate-200 shadow-2xl rounded-2xl">
        <DialogHeader className="p-8 pb-6 bg-slate-50/50 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-left">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className={category.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}>
                  {category.status === 'Active' ? 'Hoạt động' : 'Tạm ngưng'}
                </Badge>
                <span className="text-xs font-mono text-slate-400">ID: #{category.id}</span>
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <FolderTree className="h-6 w-6 text-slate-400" />
                {category.name}
              </DialogTitle>
              <DialogDescription className="text-slate-500 mt-1 flex items-center gap-2 font-mono">
                Mã danh mục: <span className="font-bold text-slate-700">{category.categoryCode}</span>
              </DialogDescription>
            </div>

            <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-right border-r pr-4 border-slate-100">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Sản phẩm</p>
                    <p className="text-xl font-black text-slate-900">{category.productCount || 0}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Danh mục con</p>
                    <p className="text-xl font-black text-slate-900">{childCount}</p>
                </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <SectionHeader icon={Tag} title="Thông tin cơ bản" />
            
            <div className="space-y-4">
               <InfoRow icon={Layers} label="Danh mục cấp trên" value={category.parentName || "Gốc (Root)"} />
               <InfoRow icon={Hash} label="Thứ tự hiển thị" value={category.sortOrder.toString()} />
               <InfoRow icon={Calendar} label="Ngày tạo" value={formatDate(category.createdAt)} />
               <InfoRow icon={Activity} label="Cập nhật cuối" value={formatDate(category.updatedAt)} />
            </div>

            {category.description && (
              <div className="space-y-2 mt-6">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Mô tả chi tiết</p>
                 <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-600 leading-relaxed italic">
                    "{category.description}"
                 </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <SectionHeader icon={BarChart3} title="Phân tích & Thống kê" />
            
            <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-6">
               <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tỷ trọng sản phẩm</p>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-slate-900" style={{ width: '45%' }} />
                  </div>
                  <p className="text-[10px] text-slate-500 text-right">45% tổng kho</p>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <StatCard icon={Boxes} label="Mặt hàng" value={category.productCount || 0} color="text-blue-600" />
                  <StatCard icon={Layers} label="Nhóm con" value={childCount} color="text-amber-500" />
               </div>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl text-white flex items-center justify-between">
                <div>
                   <p className="text-[10px] opacity-60 uppercase font-bold tracking-widest">Trạng thái vận hành</p>
                   <p className="text-sm font-bold">Sẵn sàng sử dụng</p>
                </div>
                <Activity size={20} className="opacity-20 translate-x-1" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SectionHeader({ icon: Icon, title }: { icon: any, title: string }) {
    return (
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
            <div className="p-1.5 bg-slate-100 rounded-lg text-slate-900"><Icon size={14} /></div>
            {title}
        </h3>
    )
}

function InfoRow({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0 grow">
            <div className="flex items-center gap-2 text-slate-400">
                <Icon size={14} />
                <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
            </div>
            <span className="text-sm font-bold text-slate-900">{value}</span>
        </div>
    )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
    return (
        <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-50">
            <div className="flex items-center gap-2 mb-1">
                <Icon size={12} className="text-slate-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
            </div>
            <p className={cn("text-xl font-black", color)}>{value}</p>
        </div>
    )
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ')
