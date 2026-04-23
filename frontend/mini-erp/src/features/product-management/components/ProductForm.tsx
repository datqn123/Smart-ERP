import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Save, X, Package, Tag, Layers, Barcode, CheckCircle2, DollarSign, Image as ImageIcon, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { FORM_LABEL_CLASS, FORM_INPUT_CLASS, FORM_HELPER_CLASS } from "@/lib/data-table-layout"
import type { Product } from "../types"

const productSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên sản phẩm"),
  skuCode: z.string().min(1, "Vui lòng nhập mã SKU"),
  barcode: z.string().optional(),
  categoryId: z.number().optional().or(z.literal(0)),
  currentPrice: z.number().min(0, "Giá không được nhỏ hơn 0"),
  weight: z.number().optional().or(z.literal(0)),
  description: z.string().optional(),
  status: z.enum(["Active", "Inactive"]),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product
  categories?: { id: number, name: string }[]
  onSubmit: (data: ProductFormData) => void
}

export function ProductForm({ open, onOpenChange, product, categories = [], onSubmit }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      name: product.name,
      skuCode: product.skuCode,
      barcode: product.barcode || "",
      categoryId: product.categoryId || 0,
      currentPrice: product.currentPrice || 0,
      weight: product.weight || 0,
      description: product.description || "",
      status: product.status,
    } : {
      name: "",
      skuCode: `SP${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      barcode: "",
      categoryId: 0,
      currentPrice: 0,
      weight: 0,
      description: "",
      status: "Active",
    }
  })

  const handleLocalSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-slate-200 shadow-2xl rounded-2xl">
        <DialogHeader className="p-8 pb-6 bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center gap-3 text-slate-400 mb-1">
            <Package size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Hồ sơ hàng hóa</span>
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900">
            {product ? "Cập nhật sản phẩm" : "Thêm mới hàng hóa"}
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Thiết lập thông tin mã SKU, giá bán và đặc tính sản phẩm.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleLocalSubmit)} className="p-8 space-y-8 bg-white max-h-[65vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left: Image mock upload */}
            <div className="md:col-span-4 space-y-4">
                <Label className={FORM_LABEL_CLASS}>Hình ảnh sản phẩm</Label>
                <div className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 gap-2 cursor-pointer hover:bg-slate-100 transition-colors">
                    <ImageIcon size={32} />
                    <span className="text-xs font-medium">Tải ảnh lên</span>
                </div>
                <p className={FORM_HELPER_CLASS}>Định dạng JPG, PNG. Tối đa 2MB.</p>
            </div>

            {/* Right: Info */}
            <div className="md:col-span-8 grid grid-cols-2 gap-x-6 gap-y-5">
                <div className="space-y-1">
                    <Label className={FORM_LABEL_CLASS}>Mã SKU *</Label>
                    <Input 
                      {...form.register("skuCode")} 
                      className={cn(FORM_INPUT_CLASS, "font-mono")}
                    />
                </div>

                <div className="space-y-1">
                    <Label className={FORM_LABEL_CLASS}>Trạng thái</Label>
                    <Select 
                      defaultValue={form.getValues("status")}
                      onValueChange={(val) => form.setValue("status", val as any)}
                    >
                      <SelectTrigger className={FORM_INPUT_CLASS}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Đang kinh doanh</SelectItem>
                        <SelectItem value="Inactive">Ngừng kinh doanh</SelectItem>
                      </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2 col-span-2">
                    <Label className={FORM_LABEL_CLASS}>Tên sản phẩm *</Label>
                    <Input 
                        {...form.register("name")} 
                        className={FORM_INPUT_CLASS} 
                    />
                </div>

                <div className="space-y-1">
                    <Label className={FORM_LABEL_CLASS}>Danh mục</Label>
                    <Select 
                      value={form.watch("categoryId")?.toString()}
                      onValueChange={(val) => form.setValue("categoryId", parseInt(val))}
                    >
                      <SelectTrigger className={FORM_INPUT_CLASS}>
                        <SelectValue placeholder="Chọn danh mục..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className={FORM_LABEL_CLASS}>Mã vạch (Barcode)</Label>
                    <Input 
                        {...form.register("barcode")} 
                        className={cn(FORM_INPUT_CLASS, "font-mono")}
                    />
                </div>

                    <Label className={FORM_LABEL_CLASS}>Giá bán lẻ (VNĐ) *</Label>
                    <div className="relative">
                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input 
                            type="number"
                            {...form.register("currentPrice", { valueAsNumber: true })} 
                            className={cn(FORM_INPUT_CLASS, "pl-10 font-semibold")}
                        />
                    </div>

                <div className="space-y-1">
                    <Label className={FORM_LABEL_CLASS}>Khối lượng (Unit)</Label>
                    <Input 
                        type="number"
                        {...form.register("weight", { valueAsNumber: true })} 
                        className={FORM_INPUT_CLASS}
                    />
                </div>

                <div className="space-y-2 col-span-2">
                    <Label className={FORM_LABEL_CLASS}>Mô tả sản phẩm</Label>
                    <Textarea 
                      {...form.register("description")} 
                      className={cn(FORM_INPUT_CLASS, "h-28 py-3")}
                    />
                </div>
            </div>
          </div>
        </form>

        <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-11 px-6 border-slate-300 font-medium text-slate-600">
            Hủy bỏ
          </Button>
          <Button type="submit" disabled={isSubmitting} onClick={form.handleSubmit(handleLocalSubmit)} className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Lưu sản phẩm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
