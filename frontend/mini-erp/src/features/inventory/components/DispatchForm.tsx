import React, { useEffect, useState } from "react"
import { useForm, useFieldArray, type UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { Truck, Package, Info, CheckCircle2, Plus, Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
} from "@/lib/data-table-layout"
import { getInventoryList } from "../api/inventoryApi"
import { getProductById, getProductList, parseProductDecimal } from "@/features/product-management/api/productsApi"
import { useAuthStore } from "@/features/auth/store/useAuthStore"
import { dispatchFormSchema, emptyLine, type DispatchFormData } from "./dispatchFormSchema"

export { dispatchFormSchema, type DispatchFormData } from "./dispatchFormSchema"

interface DispatchFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dispatch?: StockDispatch
  onSubmit: (data: DispatchFormData) => Promise<void>
}

export function DispatchForm({ open, onOpenChange, dispatch, onSubmit }: DispatchFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<DispatchFormData>({
    resolver: zodResolver(dispatchFormSchema),
    defaultValues: {
      dispatchDate: new Date().toISOString().split("T")[0],
      referenceLabel: "",
      notes: "",
      items: [],
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })

  useEffect(() => {
    if (!open && dispatch == null) {
      form.reset({
        dispatchDate: new Date().toISOString().split("T")[0],
        referenceLabel: "",
        notes: "",
        items: [],
      })
    }
  }, [open, dispatch, form])

  const handleLocalSubmit = async (data: DispatchFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      onOpenChange(false)
    }
    finally {
      setIsSubmitting(false)
    }
  }

  const isEditable = !dispatch

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-7xl max-h-[92vh] flex flex-col p-0 gap-0 border-slate-200 shadow-2xl overflow-hidden rounded-2xl">
        <DialogHeader className="p-8 pb-6 bg-slate-50/50 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Truck size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Xuất từ tồn kho</span>
              </div>
              <DialogTitle className="text-2xl font-black text-slate-900 leading-none">
                {dispatch ? "Chi tiết phiếu (chỉ xem)" : "Tạo phiếu xuất kho mới"}
              </DialogTitle>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Dòng hàng</p>
              <p className="text-2xl font-black text-slate-900">
                {fields.length} <span className="text-sm font-normal text-slate-400">dòng</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleLocalSubmit)} className="flex-1 overflow-y-auto flex flex-col gap-0 min-h-0 bg-white">
          <div className="p-8 space-y-8">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Info size={16} className="text-slate-400" />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Thông tin phiếu</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className={FORM_LABEL_CLASS}>Ngày xuất *</label>
                  <Input type="date" {...form.register("dispatchDate")} disabled={!isEditable} className={FORM_INPUT_CLASS} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className={FORM_LABEL_CLASS}>Nhãn tham chiếu</label>
                  <Input
                    placeholder="Khách / lý do xuất / tham chiếu nội bộ…"
                    {...form.register("referenceLabel")}
                    disabled={!isEditable}
                    className={FORM_INPUT_CLASS}
                  />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <label className={FORM_LABEL_CLASS}>Ghi chú</label>
                  <Input placeholder="Ghi chú phiếu…" {...form.register("notes")} disabled={!isEditable} className={FORM_INPUT_CLASS} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Package size={20} className="text-slate-900" />
                  <h3 className="text-lg font-black text-slate-900">Danh sách xuất hàng</h3>
                </div>
                {isEditable && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 border-slate-200 font-semibold"
                    onClick={() => append(emptyLine())}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Thêm dòng
                  </Button>
                )}
              </div>

              {fields.length === 0 && isEditable ? (
                <p className="text-sm text-slate-500 border border-dashed border-slate-200 rounded-lg p-6 text-center">
                  Chưa có dòng nào — bấm &quot;Thêm dòng&quot; để chọn sản phẩm và lô xuất.
                </p>
              ) : null}

              {fields.length > 0 ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white overflow-x-auto">
                  <Table className="table-auto w-full">
                    <TableHeader className="bg-slate-50 h-12">
                      <TableRow className="hover:bg-transparent border-b border-slate-200">
                        <TableHead className={cn(TABLE_HEAD_CLASS, "w-8 px-1 text-center whitespace-nowrap")}>STT</TableHead>
                        <TableHead className={cn(TABLE_HEAD_CLASS, "min-w-0 max-w-[min(22rem,42vw)]")}>Sản phẩm</TableHead>
                        <TableHead className={cn(TABLE_HEAD_CLASS, "w-max whitespace-nowrap text-center px-2")}>ĐVT</TableHead>
                        <TableHead className={cn(TABLE_HEAD_CLASS, "w-max whitespace-nowrap text-right px-2")}>Giá bán</TableHead>
                        <TableHead className={cn(TABLE_HEAD_CLASS, "min-w-[12rem] max-w-lg")}>Lô / vị trí tồn</TableHead>
                        <TableHead className={cn(TABLE_HEAD_CLASS, "min-w-[6.75rem] max-w-[7.5rem] text-right whitespace-nowrap px-1")}>SL xuất</TableHead>
                        {isEditable ? (
                          <TableHead className={cn(TABLE_HEAD_CLASS, "w-10 text-center p-1")} />
                        ) : null}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => (
                        <DispatchFormLineRow
                          key={field.id}
                          index={index}
                          form={form}
                          disabled={!isEditable}
                          onRemove={() => remove(index)}
                          showRemove={isEditable}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : null}
            </div>
          </div>

          <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-end shrink-0 gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-12 px-6 border-slate-200">
              Đóng
            </Button>
            {isEditable && (
              <Button type="submit" disabled={isSubmitting || fields.length === 0} className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {isSubmitting ? "Đang tạo…" : "Tạo phiếu xuất kho"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DispatchFormLineRow({
  index,
  form,
  disabled,
  onRemove,
  showRemove,
}: {
  index: number
  form: UseFormReturn<DispatchFormData>
  disabled: boolean
  onRemove: () => void
  showRemove: boolean
}) {
  const [productSearch, setProductSearch] = useState("")
  const productId = form.watch(`items.${index}.productId`)
  const inventoryId = form.watch(`items.${index}.inventoryId`)
  const dispatchQty = form.watch(`items.${index}.dispatchQty`)
  const productLabel = form.watch(`items.${index}.productLabel`)
  const isAdminViewer = useAuthStore((s) => s.user?.role === "Admin")

  const productsQ = useQuery({
    queryKey: ["products", "dispatch-form-row", productSearch],
    queryFn: () =>
      getProductList({
        search: productSearch.trim() || undefined,
        limit: 40,
        page: 1,
        status: "Active",
      }),
    enabled: !disabled && productId <= 0,
  })

  const productDetailQ = useQuery({
    queryKey: ["product-detail", "dispatch-form", productId],
    queryFn: () => getProductById(productId),
    enabled: productId > 0 && !disabled,
  })

  useEffect(() => {
    const d = productDetailQ.data
    if (!d) {
      return
    }
    const base = d.units?.find((u) => u.isBaseUnit) ?? d.units?.[0]
    form.setValue(`items.${index}.productLabel`, `${d.name} (${d.skuCode})`)
    form.setValue(`items.${index}.unitName`, base?.unitName ?? "")
    form.setValue(`items.${index}.unitPriceSnapshot`, parseProductDecimal(base?.currentSalePrice))
    form.setValue(`items.${index}.inventoryId`, 0)
    form.setValue(`items.${index}.batchNumber`, "")
  }, [productDetailQ.data, form, index])

  const invQ = useQuery({
    queryKey: ["inventory", "dispatch-form", productId],
    queryFn: () => getInventoryList({ productId, limit: 80, page: 1 }),
    enabled: productId > 0 && !disabled,
  })

  useEffect(() => {
    const rows = invQ.data?.items
    if (!rows?.length) {
      return
    }
    const cur = form.getValues(`items.${index}.inventoryId`)
    if (cur > 0) {
      return
    }
    const first = rows[0]
    form.setValue(`items.${index}.inventoryId`, first.id)
    form.setValue(`items.${index}.batchNumber`, first.batchNumber ?? "")
  }, [invQ.data, form, index])

  const invItems = invQ.data?.items ?? []
  const labelFor = (r: (typeof invItems)[0]) =>
    `${r.warehouseCode}/${r.shelfCode} · lô ${r.batchNumber ?? "—"} · tồn ${r.quantity}`

  const selectedInv = invItems.find((x) => x.id === inventoryId)
  const avail = selectedInv?.quantity ?? 0
  const qtyNum = typeof dispatchQty === "number" && !Number.isNaN(dispatchQty) ? dispatchQty : 0
  const lineShortage = inventoryId > 0 && qtyNum > avail
  const shortageAmount = lineShortage ? qtyNum - avail : 0

  return (
    <TableRow className="hover:bg-slate-50/30 border-b border-slate-100 text-slate-900 align-top">
      <TableCell className={cn("text-center pt-3 px-1", TABLE_CELL_MONO_CLASS)}>{index + 1}</TableCell>
      <TableCell className="pt-2 pb-2 min-w-0 max-w-[min(22rem,42vw)]">
        {productId <= 0 ? (
          <div className="space-y-2">
            <Input
              className={cn(FORM_INPUT_CLASS, "h-9 text-sm")}
              placeholder="Tìm SKU / tên…"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              disabled={disabled}
            />
            <Select
              value={undefined}
              onValueChange={(v) => {
                const id = parseInt(v, 10)
                form.setValue(`items.${index}.productId`, id)
                setProductSearch("")
              }}
              disabled={disabled}
            >
              <SelectTrigger className={cn(FORM_INPUT_CLASS, "h-10")}>
                <SelectValue placeholder="Chọn sản phẩm…" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {(productsQ.data?.items ?? []).map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    <span className="font-mono text-xs">{p.skuCode}</span> — {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-1">
            <p className={cn(TABLE_CELL_PRIMARY_CLASS, "text-sm font-medium leading-snug break-words")}>
              {productLabel || "…"}
            </p>
            <p className="text-[11px] text-slate-400 leading-tight">
              Đổi sản phẩm: xóa dòng và thêm dòng mới.
            </p>
          </div>
        )}
      </TableCell>
      <TableCell className="text-center pt-3 px-2 whitespace-nowrap w-max">
        <span className={cn(TABLE_CELL_SECONDARY_CLASS, "bg-slate-50 px-2 py-1 rounded text-xs inline-block")}>
          {form.watch(`items.${index}.unitName`) || "—"}
        </span>
      </TableCell>
      <TableCell className="text-right pt-3 px-2 text-sm font-mono text-slate-800 whitespace-nowrap w-max tabular-nums">
        {form.watch(`items.${index}.unitPriceSnapshot`)}
      </TableCell>
      <TableCell className="px-2 pt-2 pb-2 min-w-[12rem]">
        {!invItems.length && productId > 0 && !invQ.isFetching ? (
          <p className="text-xs text-amber-700 mb-1">Chưa có tồn — không thể xuất dòng này cho đến khi nhập kho.</p>
        ) : null}
        <Select
          value={inventoryId > 0 ? String(inventoryId) : undefined}
          onValueChange={(v) => {
            const id = parseInt(v, 10)
            form.setValue(`items.${index}.inventoryId`, id)
            const row = invItems.find((x) => x.id === id)
            if (row) {
              form.setValue(`items.${index}.batchNumber`, row.batchNumber ?? "")
            }
          }}
          disabled={disabled || !invItems.length}
        >
          <SelectTrigger className={cn(FORM_INPUT_CLASS, "h-10")}>
            <SelectValue placeholder={invItems.length ? "Chọn lô…" : "—"} />
          </SelectTrigger>
          <SelectContent>
            {invItems.map((r) => (
              <SelectItem key={r.id} value={String(r.id)}>
                <span className="text-xs">{labelFor(r)}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="px-1 pt-2 min-w-[6.75rem] max-w-[7.5rem] align-top">
        <div className="flex items-center justify-end gap-1">
          <Input
            type="number"
            min={1}
            {...form.register(`items.${index}.dispatchQty`, { valueAsNumber: true })}
            disabled={disabled}
            className={cn(FORM_INPUT_CLASS, "h-9 text-right text-sm tabular-nums w-full max-w-[4.25rem] min-w-0 shrink")}
          />
          {lineShortage && !isAdminViewer ? (
            <span
              className="shrink-0 text-red-600"
              title="Vượt tồn lô — có thể vẫn tạo phiếu"
              role="img"
              aria-label="Vượt tồn lô — có thể vẫn tạo phiếu"
            >
              <AlertTriangle className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            </span>
          ) : null}
        </div>
        {lineShortage && isAdminViewer ? (
          <p className="text-[10px] text-amber-800 mt-1 leading-tight">
            Thiếu {shortageAmount} (tồn lô {avail})
          </p>
        ) : null}
      </TableCell>
      {showRemove ? (
        <TableCell className="text-center pt-2 p-1 w-10">
          <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-600" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </TableCell>
      ) : null}
    </TableRow>
  )
}
