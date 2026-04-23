import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Save, FolderTree, Tag, Hash, CheckCircle2, ListTree, Info, ArrowRight, BarChart3 } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { FORM_LABEL_CLASS, FORM_INPUT_CLASS, FORM_HELPER_CLASS } from "@/lib/data-table-layout"
import type { Category } from "../types"

const categorySchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên danh mục"),
  categoryCode: z.string().min(1, "Vui lòng nhập mã danh mục"),
  parentId: z.number().optional().or(z.literal(0)),
  description: z.string().optional(),
  sortOrder: z.number().default(0),
  status: z.enum(["Active", "Inactive"]),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface CategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category
  allCategories?: Category[]
  onSubmit: (data: CategoryFormData) => void
}

export function CategoryForm({ open, onOpenChange, category, allCategories = [], onSubmit }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      categoryCode: "",
      parentId: 0,
      description: "",
      sortOrder: 0,
      status: "Active",
    }
  })

  // Reset form when category changes
  React.useEffect(() => {
    if (open) {
      if (category) {
        form.reset({
          name: category.id ? category.name : "",
          categoryCode: category.categoryCode || `CAT${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          parentId: category.parentId ?? 0,
          description: category.description || "",
          sortOrder: category.sortOrder || 0,
          status: category.status || "Active",
        })
      } else {
        form.reset({
          name: "",
          categoryCode: `CAT${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          parentId: 0,
          description: "",
          sortOrder: 0,
          status: "Active",
        })
      }
    }
  }, [category, open, form])

  const handleLocalSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Determine title based on context
  const isAddingSub = category && !category.id;
  const isEditing = category && category.id;
  const title = isEditing ? "Cập nhật danh mục" : (isAddingSub ? "Thêm danh mục con" : "Thêm danh mục mới");
  
  // Helper to render hierarchical categories in select
  const renderCategoryOptions = () => {
    const options: any[] = [<SelectItem key="0" value="0">Gốc (Root)</SelectItem>];
    
    const addOptions = (cats: Category[], level: number) => {
      cats.forEach(c => {
        // Don't allow selecting self or sub-tree (well, just self for now) as parent in edit mode
        if (isEditing && c.id === category?.id) return;
        
        options.push(
          <SelectItem key={c.id} value={c.id.toString()}>
            <div className="flex items-center gap-2">
              {level > 0 && <span className="text-slate-300">{"\u00A0".repeat(level * 4)} ⌞</span>}
              {c.name}
            </div>
          </SelectItem>
        );
        if (c.children) addOptions(c.children, level + 1);
      });
    };
    
    addOptions(allCategories, 0);
    return options;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-slate-200 shadow-3xl rounded-3xl">
        <DialogHeader className={cn(
            "p-8 pb-6 bg-slate-50 border-b border-slate-100",
            isEditing ? "border-l-4 border-l-slate-900" : isAddingSub ? "border-l-4 border-l-blue-600" : ""
        )}>
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                <FolderTree size={18} className="text-slate-900" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Phân loại hàng hóa</span>
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900 mb-1">
            {title}
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            {isAddingSub 
               ? `Đang tạo phân cấp dưới danh mục: ${category.parentName}` 
               : isEditing 
                  ? `Điều chỉnh thông tin định danh và cấu trúc cho nhóm hàng này`
                  : "Khởi tạo nhóm hàng mới để tối ưu hóa việc quản lý và tìm kiếm."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleLocalSubmit as any)} className="p-0 bg-white">
          {/* Status Indicator Bar for Sub-category */}
          {isAddingSub && (
            <div className="px-8 py-3 bg-blue-50/50 border-b border-blue-100 flex items-center gap-3">
                 <div className="p-1.5 bg-blue-600 rounded-full text-white"><ArrowRight size={10} strokeWidth={4} /></div>
                 <p className="text-xs font-bold text-blue-800">
                    Danh mục cha hiện tại: <span className="bg-blue-100 px-2 py-0.5 rounded-lg ml-1">{category.parentName}</span>
                 </p>
            </div>
          )}

          <div className="p-8 space-y-8">
            {/* Grid Layout - Row by Row for perfect alignment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
                {/* Row 1: Tên & Mã */}
                <div className="space-y-2.5">
                    <Label className={FORM_LABEL_CLASS}>
                        Tên danh mục <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                        {...form.register("name")} 
                        placeholder="Ví dụ: Đồ gia dụng, Điện tử..."
                        className={cn(FORM_INPUT_CLASS, "font-semibold")} 
                    />
                </div>

                <div className="space-y-2.5">
                    <Label className={FORM_LABEL_CLASS}>
                        Mã danh mục <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                        {...form.register("categoryCode")} 
                        placeholder="Nhập mã hoặc random..."
                        className={cn(FORM_INPUT_CLASS, "font-mono")}
                    />
                </div>

                {/* Row 2: Danh mục cha & Trạng thái */}
                <div className="space-y-2.5">
                    <Label className={FORM_LABEL_CLASS}>Thuộc nhóm (Danh mục cha)</Label>
                    <Select 
                        value={form.watch("parentId")?.toString()}
                        onValueChange={(val) => form.setValue("parentId", parseInt(val))}
                    >
                        <SelectTrigger className={FORM_INPUT_CLASS}>
                            <SelectValue placeholder="Chọn danh mục cha" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            {renderCategoryOptions()}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2.5">
                    <Label className={FORM_LABEL_CLASS}>Trạng thái hoạt động</Label>
                    <Select 
                        defaultValue={form.getValues("status")}
                        onValueChange={(val) => form.setValue("status", val as any)}
                    >
                        <SelectTrigger className={FORM_INPUT_CLASS}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                            <SelectItem value="Active" className="text-emerald-600 font-bold text-xs cursor-pointer">
                                <span className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    HOẠT ĐỘNG
                                </span>
                            </SelectItem>
                            <SelectItem value="Inactive" className="text-slate-400 font-bold text-xs cursor-pointer">
                                <span className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                                    TẠM NGƯNG
                                </span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Row 3: Thứ tự & Info Box */}
                <div className="space-y-2.5">
                    <Label className={FORM_LABEL_CLASS}>Thứ tự sắp xếp</Label>
                    <Input 
                        type="number"
                        {...form.register("sortOrder", { valueAsNumber: true })} 
                        className={FORM_INPUT_CLASS}
                    />
                </div>

                <div className="flex items-end">
                    <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex gap-3 h-12 items-center w-full">
                         <Info size={14} className="text-slate-400 shrink-0" />
                         <p className="text-[9px] text-slate-500 font-medium leading-tight">
                            Tên danh mục và Mã là thông tin bắt buộc để định danh.
                         </p>
                    </div>
                </div>
            </div>

            <Separator className="bg-slate-100" />

            <div className="space-y-2.5">
                <Label className={FORM_LABEL_CLASS}>Mô tả chi tiết</Label>
                <Textarea 
                {...form.register("description")} 
                placeholder="Nhập ghi chú hoặc mô tả về danh mục này..."
                className={cn(FORM_INPUT_CLASS, "min-h-[100px] p-4")}
                />
            </div>
          </div>
        </form>

        <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-12 px-6 font-bold text-slate-400 hover:text-slate-900">
            Hủy thao tác
          </Button>
          <Button type="submit" disabled={isSubmitting} onClick={form.handleSubmit(handleLocalSubmit as any)} className="h-12 px-10 bg-slate-900 hover:bg-slate-800 text-white shadow-2xl shadow-slate-300 rounded-2xl font-bold flex items-center gap-2">
            <Save size={18} />
            Xác nhận Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
