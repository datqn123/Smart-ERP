import React, { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Package, 
  Info, 
  MapPin, 
  Truck, 
  Hash, 
  ArrowRightCircle, 
  History,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { StockDispatch } from "../types"
import { cn } from "@/lib/utils"
import {
  FORM_LABEL_CLASS,
  FORM_INPUT_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_CELL_PRIMARY_CLASS,
  TABLE_CELL_SECONDARY_CLASS,
  TABLE_CELL_MONO_CLASS,
  TABLE_CELL_NUMBER_CLASS,
} from "@/lib/data-table-layout"

const dispatchSchema = z.object({
  orderCode: z.string().min(1, "Vui lòng nhập mã đơn đặt hàng"),
  customerName: z.string().min(1, "Vui lòng nhập tên khách hàng"),
  dispatchDate: z.string().min(1, "Vui lòng chọn ngày xuất hàng"),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.number().min(1, "Chọn sản phẩm"),
    dispatchQty: z.number().min(1, "SL > 0"),
    batchNumber: z.string().optional(),
    warehouseLocation: z.string().min(1, "Chọn kho"),
    shelfCode: z.string().min(1, "Kệ"),
  })).min(1, "Phải có ít nhất 1 dòng hàng")
})

type DispatchFormData = z.infer<typeof dispatchSchema>

interface DispatchFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dispatch?: StockDispatch
  onSubmit: (data: DispatchFormData) => void
}

const mockProducts = [
  { id: 1, name: "Sữa Ông Thọ", sku: "SP001", unit: "Hộp" },
  { id: 2, name: "Nước Ngọt Coca Cola", sku: "SP002", unit: "Chai" },
  { id: 3, name: "Bánh Quy Cosy", sku: "SP003", unit: "Gói" },
  { id: 5, name: "Mì Gói Hảo Hảo", sku: "SP005", unit: "Gói" },
]

const mockLocations = [
  { id: "WH01", name: "Kho Chính" },
  { id: "WH02", name: "Kho Phụ" },
]

const mockShelves = ["A1", "A2", "B1", "B2", "C1", "C2"]

export function DispatchForm({ open, onOpenChange, dispatch, onSubmit }: DispatchFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<DispatchFormData>({
    resolver: zodResolver(dispatchSchema),
    defaultValues: dispatch ? {
      orderCode: dispatch.orderCode,
      customerName: dispatch.customerName,
      dispatchDate: dispatch.dispatchDate,
      notes: dispatch.notes || "",
      items: dispatch.items.map(i => ({
        productId: i.productId,
        dispatchQty: i.dispatchQty,
        batchNumber: i.batchNumber || "",
        warehouseLocation: i.warehouseLocation,
        shelfCode: i.shelfCode,
      }))
    } : {
      orderCode: "",
      customerName: "",
      dispatchDate: new Date().toISOString().split("T")[0],
      notes: "",
      items: [{ productId: 0 as any, dispatchQty: 1, batchNumber: "", warehouseLocation: "WH01", shelfCode: "A1" }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  })

  const handleLocalSubmit = async (data: DispatchFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEditable = !dispatch || (dispatch.status === "Pending" || dispatch.status === "Partial")

  const totalSKUs = fields.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-7xl max-h-[92vh] flex flex-col p-0 gap-0 border-slate-200 shadow-2xl overflow-hidden rounded-2xl">
        <DialogHeader className="p-8 pb-6 bg-slate-50/50 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Truck size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Quy trình điều phối</span>
              </div>
              <DialogTitle className="text-2xl font-black text-slate-900 leading-none">
                {dispatch ? (isEditable ? "Sửa phiếu điều phối" : "Chi tiết điều phối") : "Tạo mới phiếu xuất kho"}
              </DialogTitle>
            </div>
            <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Mặt hàng đang chọn</p>
                <p className="text-2xl font-black text-slate-900">{totalSKUs} <span className="text-sm font-normal text-slate-400">SKU</span></p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleLocalSubmit)} className="flex-1 overflow-y-auto flex flex-col gap-0 min-h-0 bg-white">
          <div className="p-8 space-y-8">
            {/* Header Info Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Info size={16} className="text-slate-400" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Thông tin đơn hàng & khách hàng</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className={FORM_LABEL_CLASS}>Mã đơn hàng *</label>
                        <Input 
                            placeholder="ORD-..."
                            {...form.register("orderCode")}
                            disabled={!isEditable}
                            className={cn(FORM_INPUT_CLASS, "font-mono")}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className={FORM_LABEL_CLASS}>Khách hàng *</label>
                        <Input 
                            placeholder="Tên khách hàng..."
                            {...form.register("customerName")}
                            disabled={!isEditable}
                            className={cn(FORM_INPUT_CLASS, "font-semibold")}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className={FORM_LABEL_CLASS}>Ngày xuất hàng *</label>
                        <Input 
                            type="date" 
                            {...form.register("dispatchDate")}
                            disabled={!isEditable}
                            className={FORM_INPUT_CLASS}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className={FORM_LABEL_CLASS}>Ghi chú</label>
                        <Input 
                            placeholder="Nội dung/Yêu cầu..."
                            {...form.register("notes")}
                            disabled={!isEditable}
                            className={FORM_INPUT_CLASS}
                        />
                    </div>
                </div>
            </div>

            {/* Picking Table Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Package size={20} className="text-slate-900" />
                        <h3 className="text-lg font-black text-slate-900">Danh sách xuất hàng (Picking List)</h3>
                    </div>
                    {isEditable && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 border-slate-200 hover:bg-slate-50 font-bold"
                            onClick={() => append({ productId: 0 as any, dispatchQty: 1, batchNumber: "", warehouseLocation: "WH01", shelfCode: "A1" })}
                        >
                            <Plus className="h-4 w-4 mr-2" /> Thêm sản phẩm
                        </Button>
                    )}
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                    <Table>
                        <TableHeader className="bg-slate-50 h-12">
                            <TableRow className="hover:bg-transparent border-b border-slate-200">
                                <TableHead className={cn(TABLE_HEAD_CLASS, "w-[50px] text-center")}>STT</TableHead>
                                <TableHead className={cn(TABLE_HEAD_CLASS, "min-w-[300px]")}>Sản phẩm xuất</TableHead>
                                <TableHead className={cn(TABLE_HEAD_CLASS, "w-[100px] text-center")}>ĐVT</TableHead>
                                <TableHead className={cn(TABLE_HEAD_CLASS, "w-[120px] text-right")}>Số lượng</TableHead>
                                <TableHead className={cn(TABLE_HEAD_CLASS, "w-[150px]")}>Kho xuất</TableHead>
                                <TableHead className={cn(TABLE_HEAD_CLASS, "w-[100px]")}>Vị trí (Kệ)</TableHead>
                                <TableHead className={cn(TABLE_HEAD_CLASS, "w-[150px]")}>Số lô</TableHead>
                                <TableHead className={cn(TABLE_HEAD_CLASS, "w-[60px] text-center")}>Xóa</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fields.map((field, index) => {
                                const selectedProductId = form.watch(`items.${index}.productId`);
                                const product = mockProducts.find(p => p.id === selectedProductId);

                                return (
                                    <TableRow key={field.id} className="hover:bg-slate-50/30 transition-colors group h-14 border-b border-slate-100 last:border-0 text-slate-900">
                                        <TableCell className={cn("text-center", TABLE_CELL_MONO_CLASS)}>{index + 1}</TableCell>
                                        <TableCell className="px-1">
                                            <Select
                                              value={selectedProductId?.toString() || ""}
                                              onValueChange={(val) => form.setValue(`items.${index}.productId`, parseInt(val))}
                                              disabled={!isEditable}
                                            >
                                              <SelectTrigger className={cn(FORM_INPUT_CLASS, "h-10 group-hover:bg-white focus:bg-white transition-all shadow-none")}>
                                                <SelectValue placeholder="Chọn sản phẩm xuất..." />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {mockProducts.map(p => (
                                                  <SelectItem key={p.id} value={p.id.toString()}>
                                                    <div className="flex flex-col text-left">
                                                        <span className={TABLE_CELL_PRIMARY_CLASS}>{p.name}</span>
                                                        <span className={cn(TABLE_CELL_MONO_CLASS, "text-[10px] text-slate-400")}>SKU: {p.sku}</span>
                                                    </div>
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-center px-4">
                                            <span className={cn(TABLE_CELL_SECONDARY_CLASS, "bg-slate-50 px-2 py-1 rounded")}>
                                              {product?.unit || "—"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-1">
                                            <Input
                                              type="number"
                                              {...form.register(`items.${index}.dispatchQty`, { valueAsNumber: true })}
                                              disabled={!isEditable}
                                              className={cn(FORM_INPUT_CLASS, "h-10 text-right group-hover:bg-white focus:bg-white")}
                                            />
                                        </TableCell>
                                        <TableCell className="px-1">
                                          <Select
                                            value={form.watch(`items.${index}.warehouseLocation`)}
                                            onValueChange={(val) => form.setValue(`items.${index}.warehouseLocation`, val)}
                                            disabled={!isEditable}
                                          >
                                            <SelectTrigger className={cn(FORM_INPUT_CLASS, "h-10 group-hover:bg-white focus:bg-white transition-all shadow-none")}>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {mockLocations.map(loc => (
                                                <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </TableCell>
                                        <TableCell className="px-1">
                                          <Select
                                            value={form.watch(`items.${index}.shelfCode`)}
                                            onValueChange={(val) => form.setValue(`items.${index}.shelfCode`, val)}
                                            disabled={!isEditable}
                                          >
                                            <SelectTrigger className={cn(FORM_INPUT_CLASS, "h-10 group-hover:bg-white focus:bg-white transition-all shadow-none")}>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {mockShelves.map(s => (
                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </TableCell>
                                        <TableCell className="px-1">
                                            <Input
                                              placeholder="BATCH..."
                                              {...form.register(`items.${index}.batchNumber`)}
                                              disabled={!isEditable}
                                              className={cn(FORM_INPUT_CLASS, "h-10 font-mono text-xs group-hover:bg-white focus:bg-white")}
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {isEditable && fields.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => remove(index)}
                                                    className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
          </div>

          <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-slate-400">
                <History size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Lưu nháp tự động lúc 13:30</span>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-12 px-6 border-slate-200 hover:bg-white font-medium text-slate-600">
                Hủy bỏ
              </Button>
              {isEditable && (
                <Button type="submit" disabled={isSubmitting} className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white border-none shadow-lg shadow-slate-200 group">
                  <CheckCircle2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Xác nhận xuất kho & Hoàn tất
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
