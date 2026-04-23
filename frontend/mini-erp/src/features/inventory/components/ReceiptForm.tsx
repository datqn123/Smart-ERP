import { useState, useMemo } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, X, Save, Send, ShoppingCart, Info, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "../utils"
import type { StockReceipt } from "../types"
import { calculateReceiptTotal, isExpiryValid } from "../inboundLogic"
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

const receiptSchema = z.object({
  supplierId: z.number().min(1, "Vui lòng chọn nhà cung cấp"),
  receiptDate: z.string().min(1, "Vui lòng chọn ngày nhập"),
  invoiceNumber: z.string().optional(),
  notes: z.string().optional(),
  details: z.array(z.object({
    productId: z.number().min(1, "Chọn sản phẩm"),
    quantity: z.number().min(1, "Min = 1"),
    costPrice: z.number().min(0, "Min = 0"),
    batchNumber: z.string().optional(),
    expiryDate: z.string().optional(),
  })).min(1, "Phải có ít nhất 1 sản phẩm")
}).refine((data) => {
  return data.details.every(d => isExpiryValid(data.receiptDate, d.expiryDate));
}, {
  message: "Hạn sử dụng không được nhỏ hơn ngày nhập",
  path: ["details"]
})

type ReceiptFormData = z.infer<typeof receiptSchema>

interface ReceiptFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  receipt?: StockReceipt
  onSubmit: (data: ReceiptFormData) => void
}

const mockSuppliers = [
  { id: 1, name: "Công ty TNHH Vinamilk" },
  { id: 2, name: "Nhà phân phối PepsiCo" },
  { id: 3, name: "Công ty Hàng Tiêu Dùng" },
  { id: 4, name: "Công ty Masan" },
  { id: 5, name: "Đại lý Unilever" },
]

const mockProducts = [
  { id: 1, name: "Sữa Ông Thọ Hộp Giấy", sku: "SP001", unit: "Hộp" },
  { id: 2, name: "Nước Ngọt Pepsi 330ml", sku: "SP002", unit: "Lon" },
  { id: 3, name: "Bánh Quy Oreo", sku: "SP003", unit: "Gói" },
  { id: 4, name: "Mì Gói Hảo Hảo", sku: "SP004", unit: "Thùng" },
  { id: 5, name: "Dầu ăn Tường An 1L", sku: "SP005", unit: "Chai" },
]

export function ReceiptForm({ open, onOpenChange, receipt, onSubmit }: ReceiptFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<ReceiptFormData>({
    resolver: zodResolver(receiptSchema),
    defaultValues: receipt ? {
      supplierId: receipt.supplierId,
      receiptDate: receipt.receiptDate,
      invoiceNumber: receipt.invoiceNumber || "",
      notes: receipt.notes || "",
      details: receipt.details.map(d => ({
        productId: d.productId,
        quantity: d.quantity,
        costPrice: d.costPrice,
        batchNumber: d.batchNumber || "",
        expiryDate: d.expiryDate ? new Date(d.expiryDate).toISOString().split('T')[0] : "",
      }))
    } : {
      supplierId: 0 as unknown as number,
      receiptDate: new Date().toISOString().split("T")[0],
      invoiceNumber: "",
      notes: "",
      details: [{ productId: 0 as unknown as number, quantity: 1, costPrice: 0, batchNumber: "", expiryDate: "" }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "details"
  })

  const formValues = form.watch()
  const totalAmount = useMemo(() => calculateReceiptTotal(formValues.details || []), [formValues.details])

  const handleSubmit = async (data: ReceiptFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEditable = !receipt || receipt.status === "Draft"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-7xl max-h-[92vh] flex flex-col p-0 overflow-hidden border-slate-200 shadow-3xl">
        <DialogHeader className="p-6 pb-4 bg-slate-50/50 border-b border-slate-100 flex-none text-left">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                {receipt ? (isEditable ? `Sửa phiếu: ${receipt.receiptCode}` : `Chi tiết phiếu: ${receipt.receiptCode}`) : "Tạo mới phiếu nhập kho"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 mt-1">
                Điền đầy đủ các thông tin hóa đơn và chi tiết mặt hàng nhập kho.
              </DialogDescription>
            </div>
            <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Ước tính giá trị (VNĐ)</p>
                <p className="text-2xl font-black text-slate-900">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <form id="receipt-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* Header Info Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Info size={16} className="text-slate-400" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Thông tin chung</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-1.5">
                    <label className={FORM_LABEL_CLASS}>Nhà cung cấp *</label>
                    <Select 
                        value={form.watch("supplierId")?.toString() || ""} 
                        onValueChange={(val) => form.setValue("supplierId", parseInt(val))}
                        disabled={!isEditable}
                    >
                        <SelectTrigger className={FORM_INPUT_CLASS}>
                        <SelectValue placeholder="Chọn đối tác..." />
                        </SelectTrigger>
                        <SelectContent>
                        {mockSuppliers.map(s => (
                            <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    {form.formState.errors.supplierId && (
                        <p className="text-[10px] text-red-500 font-bold px-1">{form.formState.errors.supplierId.message}</p>
                    )}
                    </div>

                    <div className="space-y-1.5">
                    <label className={FORM_LABEL_CLASS}>Ngày nhập thực tế *</label>
                    <Input 
                        type="date" 
                        {...form.register("receiptDate")}
                        disabled={!isEditable}
                        className={FORM_INPUT_CLASS}
                    />
                    {form.formState.errors.receiptDate && (
                        <p className="text-[10px] text-red-500 font-bold px-1">{form.formState.errors.receiptDate.message}</p>
                    )}
                    </div>

                    <div className="space-y-1.5">
                    <label className={FORM_LABEL_CLASS}>Số hóa đơn / Chứng từ</label>
                    <Input 
                        placeholder="VD: INV-001..." 
                        {...form.register("invoiceNumber")}
                        disabled={!isEditable}
                        className={cn(FORM_INPUT_CLASS, "font-mono")}
                    />
                    </div>

                    <div className="space-y-1.5">
                        <label className={FORM_LABEL_CLASS}>Ghi chú phiếu</label>
                        <Input 
                            placeholder="Mô tả ngắn..." 
                            {...form.register("notes")}
                            disabled={!isEditable}
                            className={FORM_INPUT_CLASS}
                        />
                    </div>
                </div>
            </div>

            {/* Product Items Table Section */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShoppingCart size={18} className="text-slate-400" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Chi tiết hàng hóa ({fields.length})</h3>
                </div>
                {isEditable && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ productId: 0 as unknown as number, quantity: 1, costPrice: 0, batchNumber: "", expiryDate: "" })}
                    className="h-9 border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Thêm mặt hàng
                  </Button>
                )}
              </div>

              <div className="overflow-x-auto min-h-[300px]">
                <Table className="border-collapse">
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className={cn(TABLE_HEAD_CLASS, "w-[50px] text-center")}>#</TableHead>
                      <TableHead className={cn(TABLE_HEAD_CLASS, "min-w-[280px]")}>Sản phẩm *</TableHead>
                      <TableHead className={cn(TABLE_HEAD_CLASS, "w-[100px] text-center")}>ĐVT</TableHead>
                      <TableHead className={cn(TABLE_HEAD_CLASS, "w-[120px] text-right")}>Số lượng *</TableHead>
                      <TableHead className={cn(TABLE_HEAD_CLASS, "w-[150px] text-right")}>Đơn giá *</TableHead>
                      <TableHead className={cn(TABLE_HEAD_CLASS, "w-[150px]")}>Số lô</TableHead>
                      <TableHead className={cn(TABLE_HEAD_CLASS, "w-[160px]")}>Hạn sử dụng</TableHead>
                      <TableHead className={cn(TABLE_HEAD_CLASS, "w-[150px] text-right")}>Thành tiền</TableHead>
                      {isEditable && <TableHead className="w-[60px]"></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100">
                    {fields.map((field, index) => {
                      const detail = formValues.details[index]
                      const product = mockProducts.find(p => p.id === detail?.productId)
                      const lineTotal = (detail?.quantity || 0) * (detail?.costPrice || 0)

                      return (
                        <TableRow key={field.id} className="hover:bg-slate-50/30 transition-colors group h-14">
                          <TableCell className={cn("text-center", TABLE_CELL_MONO_CLASS)}>
                            {index + 1}
                          </TableCell>
                          <TableCell className="px-2 py-1.5 focus-within:z-10">
                            <Select
                              value={detail?.productId?.toString() || ""}
                              onValueChange={(val) => form.setValue(`details.${index}.productId`, parseInt(val))}
                              disabled={!isEditable}
                            >
                              <SelectTrigger className={cn(FORM_INPUT_CLASS, "h-10 group-hover:bg-white focus:bg-white transition-all shadow-none")}>
                                <SelectValue placeholder="Chọn sản phẩm..." />
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
                          <TableCell className="text-center">
                             <span className={cn(TABLE_CELL_SECONDARY_CLASS, "bg-slate-50 px-2 py-1 rounded")}>
                                {product?.unit || "—"}
                             </span>
                          </TableCell>
                          <TableCell className="px-1">
                            <Input
                              type="number"
                              {...form.register(`details.${index}.quantity`, { valueAsNumber: true })}
                              disabled={!isEditable}
                              className={cn(FORM_INPUT_CLASS, "h-10 text-right group-hover:bg-white focus:bg-white")}
                            />
                          </TableCell>
                          <TableCell className="px-1">
                            <Input
                              type="number"
                              {...form.register(`details.${index}.costPrice`, { valueAsNumber: true })}
                              disabled={!isEditable}
                              className={cn(FORM_INPUT_CLASS, "h-10 text-right group-hover:bg-white focus:bg-white")}
                            />
                          </TableCell>
                          <TableCell className="px-1">
                            <Input
                              placeholder="BATCH..."
                              {...form.register(`details.${index}.batchNumber`)}
                              disabled={!isEditable}
                              className={cn(FORM_INPUT_CLASS, "h-10 font-mono text-xs group-hover:bg-white focus:bg-white")}
                            />
                          </TableCell>
                          <TableCell className="px-1">
                            <Input
                              type="date"
                              {...form.register(`details.${index}.expiryDate`)}
                              disabled={!isEditable}
                              className={cn(FORM_INPUT_CLASS, "h-10 text-xs group-hover:bg-white focus:bg-white px-2")}
                            />
                          </TableCell>
                          <TableCell className="text-right pr-6">
                             <span className={TABLE_CELL_NUMBER_CLASS}>{formatCurrency(lineTotal)}</span>
                          </TableCell>
                          
                          {isEditable && (
                            <TableCell className="w-[60px] text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                                className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              
              {fields.length === 0 && (
                  <div className="py-12 text-center text-slate-400 italic bg-white">
                      Nhấn "Thêm mặt hàng" để bắt đầu nhập liệu
                  </div>
              )}
            </div>
            
            {(form.formState.errors.details || form.formState.root) && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3">
                  <X className="text-red-500" size={18} />
                  <p className="text-sm text-red-600 font-bold">
                    {form.formState.errors.details?.message || form.formState.errors.details?.root?.message || "Dữ liệu không hợp lệ, vui lòng kiểm tra lại các trường đánh dấu *"}
                  </p>
              </div>
            )}
          </form>
        </div>

        <DialogFooter className="p-6 bg-slate-50 border-t border-slate-200 flex-none flex flex-col sm:flex-row gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-11 border-slate-300">
            Đóng
          </Button>
          <div className="flex-1" />
          {isEditable && (
            <>
              <Button form="receipt-form" type="submit" variant="outline" disabled={isSubmitting} className="h-11 border-slate-300 bg-white">
                <Save className="h-4 w-4 mr-2" />
                Lưu bản nháp
              </Button>
              <Button form="receipt-form" type="submit" disabled={isSubmitting} className="h-11 bg-slate-900 hover:bg-slate-800 text-white min-w-[140px]" onClick={() => {
                form.setValue("invoiceNumber", form.getValues("invoiceNumber") || "")
              }}>
                <Send className="h-4 w-4 mr-2" />
                Gửi yêu cầu duyệt
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}