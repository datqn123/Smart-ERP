import React, { useEffect, useState } from "react"
import { useForm, useFieldArray, type UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQuery } from "@tanstack/react-query"
import { Truck, Package, Info, CheckCircle2 } from "lucide-react"
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
import { getSalesOrderList, getSalesOrderDetail } from "@/features/orders/api/salesOrdersApi"
import { getInventoryList } from "../api/inventoryApi"

const itemSchema = z.object({
  productId: z.number().min(1),
  inventoryId: z.number().min(1, "Chọn lô tồn"),
  dispatchQty: z.number().min(1, "SL > 0"),
  unitPriceSnapshot: z.coerce.number().min(0),
  unitName: z.string(),
  productLabel: z.string(),
  batchNumber: z.string().optional(),
})

const dispatchSchema = z.object({
  orderId: z.number().min(1, "Chọn đơn hàng"),
  dispatchDate: z.string().min(1, "Chọn ngày xuất"),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, "Đơn cần có ít nhất một dòng"),
})

export type DispatchFormData = z.infer<typeof dispatchSchema>

interface DispatchFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dispatch?: StockDispatch
  onSubmit: (data: DispatchFormData) => Promise<void>
}

function normPrice(v: number | string): number {
  if (typeof v === "number") {
    return Number.isFinite(v) ? v : 0
  }
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

export function DispatchForm({ open, onOpenChange, dispatch, onSubmit }: DispatchFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSearch, setOrderSearch] = useState("")
  const [pickedOrderId, setPickedOrderId] = useState<number | null>(null)

  const form = useForm<DispatchFormData>({
    resolver: zodResolver(dispatchSchema),
    defaultValues: {
      orderId: 0,
      dispatchDate: new Date().toISOString().split("T")[0],
      notes: "",
      items: [],
    },
  })

  const { fields } = useFieldArray({ control: form.control, name: "items" })

  const ordersQ = useQuery({
    queryKey: ["sales-orders", "dispatch-form", orderSearch],
    queryFn: () =>
      getSalesOrderList({
        search: orderSearch.trim() || undefined,
        page: 1,
        limit: 40,
        status: "all",
      }),
    enabled: open && dispatch == null,
  })

  const orderDetailQ = useQuery({
    queryKey: ["sales-order-detail", pickedOrderId],
    queryFn: () => getSalesOrderDetail(pickedOrderId!),
    enabled: open && dispatch == null && pickedOrderId != null && pickedOrderId > 0,
  })

  useEffect(() => {
    if (!open || dispatch != null) {
      return
    }
    if (!orderDetailQ.data) {
      return
    }
    const d = orderDetailQ.data
    form.reset({
      orderId: d.id,
      dispatchDate: new Date().toISOString().split("T")[0],
      notes: "",
      items: d.lines.map((line) => ({
        productId: line.productId,
        inventoryId: 0,
        dispatchQty: line.quantity,
        unitPriceSnapshot: normPrice(line.unitPrice),
        unitName: line.unitName,
        productLabel: `${line.productName} (${line.skuCode})`,
        batchNumber: "",
      })),
    })
  }, [open, dispatch, orderDetailQ.data, form])

  useEffect(() => {
    if (!open) {
      setPickedOrderId(null)
      setOrderSearch("")
    }
  }, [open])

  useEffect(() => {
    if (pickedOrderId != null && pickedOrderId > 0) {
      form.setValue("orderId", pickedOrderId)
    }
  }, [pickedOrderId, form])

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
                <span className="text-[10px] font-bold uppercase tracking-widest">Phiếu xuất gắn đơn</span>
              </div>
              <DialogTitle className="text-2xl font-black text-slate-900 leading-none">
                {dispatch ? "Chi tiết phiếu (chỉ xem)" : "Tạo phiếu xuất kho"}
              </DialogTitle>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Dòng hàng</p>
              <p className="text-2xl font-black text-slate-900">
                {fields.length} <span className="text-sm font-normal text-slate-400">SKU</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleLocalSubmit)} className="flex-1 overflow-y-auto flex flex-col gap-0 min-h-0 bg-white">
          <div className="p-8 space-y-8">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Info size={16} className="text-slate-400" />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Đơn hàng & ngày xuất</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className={FORM_LABEL_CLASS}>Đơn hàng *</label>
                  <Input
                    className={cn(FORM_INPUT_CLASS, "mb-2")}
                    placeholder="Tìm mã đơn / khách…"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    disabled={!isEditable}
                  />
                  <div className="max-h-44 overflow-y-auto rounded-lg border border-slate-200 bg-white divide-y divide-slate-100">
                    {(ordersQ.data?.items ?? []).length === 0 && !ordersQ.isFetching ? (
                      <p className="text-xs text-slate-500 p-3">Không có đơn — thử từ khóa khác.</p>
                    ) : null}
                    {(ordersQ.data?.items ?? []).map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        disabled={!isEditable}
                        onClick={() => setPickedOrderId(o.id)}
                        className={cn(
                          "w-full text-left px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors",
                          pickedOrderId === o.id && "bg-slate-100 font-semibold",
                        )}
                      >
                        <span className="font-mono">{o.orderCode}</span>
                        <span className="text-slate-600"> — {o.customerName}</span>
                      </button>
                    ))}
                  </div>
                  <input type="hidden" {...form.register("orderId", { valueAsNumber: true })} />
                  {orderDetailQ.isFetching ? (
                    <p className="text-xs text-slate-500">Đang tải chi tiết đơn…</p>
                  ) : null}
                  {orderDetailQ.error ? (
                    <p className="text-xs text-red-600">
                      Không đọc được đơn (cần quyền quản lý đơn). Đăng nhập tài khoản có quyền đơn hàng hoặc liên hệ quản trị.
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <label className={FORM_LABEL_CLASS}>Ngày xuất hàng *</label>
                  <Input type="date" {...form.register("dispatchDate")} disabled={!isEditable} className={FORM_INPUT_CLASS} />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <label className={FORM_LABEL_CLASS}>Ghi chú</label>
                  <Input placeholder="Ghi chú phiếu xuất…" {...form.register("notes")} disabled={!isEditable} className={FORM_INPUT_CLASS} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package size={20} className="text-slate-900" />
                <h3 className="text-lg font-black text-slate-900">Danh sách xuất hàng</h3>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                <Table>
                  <TableHeader className="bg-slate-50 h-12">
                    <TableRow className="hover:bg-transparent border-b border-slate-200">
                      <TableHead className={cn(TABLE_HEAD_CLASS, "w-[44px] text-center")}>STT</TableHead>
                      <TableHead className={cn(TABLE_HEAD_CLASS, "min-w-[220px]")}>Sản phẩm</TableHead>
                      <TableHead className={cn(TABLE_HEAD_CLASS, "w-[90px] text-center")}>ĐVT</TableHead>
                      <TableHead className={cn(TABLE_HEAD_CLASS, "w-[110px] text-right")}>Đơn giá</TableHead>
                      <TableHead className={cn(TABLE_HEAD_CLASS, "min-w-[280px]")}>Lô tồn xuất</TableHead>
                      <TableHead className={cn(TABLE_HEAD_CLASS, "w-[110px] text-right")}>SL xuất</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <DispatchFormLineRow key={field.id} index={index} form={form} disabled={!isEditable} />
                    ))}
                  </TableBody>
                </Table>
              </div>
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
}: {
  index: number
  form: UseFormReturn<DispatchFormData>
  disabled: boolean
}) {
  const productId = form.watch(`items.${index}.productId`)
  const inventoryId = form.watch(`items.${index}.inventoryId`)

  const invQ = useQuery({
    queryKey: ["inventory", "dispatch-form", productId],
    queryFn: () => getInventoryList({ productId, limit: 80, page: 1 }),
    enabled: productId > 0,
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

  const items = invQ.data?.items ?? []
  const labelFor = (r: (typeof items)[0]) =>
    `${r.warehouseCode}/${r.shelfCode} · lô ${r.batchNumber ?? "—"} · tồn ${r.quantity}`

  return (
    <TableRow className="hover:bg-slate-50/30 border-b border-slate-100 text-slate-900">
      <TableCell className={cn("text-center", TABLE_CELL_MONO_CLASS)}>{index + 1}</TableCell>
      <TableCell>
        <p className={TABLE_CELL_PRIMARY_CLASS}>{form.watch(`items.${index}.productLabel`)}</p>
      </TableCell>
      <TableCell className="text-center">
        <span className={cn(TABLE_CELL_SECONDARY_CLASS, "bg-slate-50 px-2 py-1 rounded text-xs")}>
          {form.watch(`items.${index}.unitName`) || "—"}
        </span>
      </TableCell>
      <TableCell className="text-right text-sm font-mono text-slate-800">
        {form.watch(`items.${index}.unitPriceSnapshot`)}
      </TableCell>
      <TableCell className="px-1">
        {!items.length && productId > 0 && !invQ.isFetching ? (
          <p className="text-xs text-amber-700 px-2">Chưa có tồn cho SKU này — vẫn có thể tạo phiếu (thiếu hàng).</p>
        ) : null}
        <Select
          value={inventoryId > 0 ? String(inventoryId) : ""}
          onValueChange={(v) => {
            const id = parseInt(v, 10)
            form.setValue(`items.${index}.inventoryId`, id)
            const row = items.find((x) => x.id === id)
            if (row) {
              form.setValue(`items.${index}.batchNumber`, row.batchNumber ?? "")
            }
          }}
          disabled={disabled || !items.length}
        >
          <SelectTrigger className={cn(FORM_INPUT_CLASS, "h-10")}>
            <SelectValue placeholder={items.length ? "Chọn lô tồn…" : "—"} />
          </SelectTrigger>
          <SelectContent>
            {items.map((r) => (
              <SelectItem key={r.id} value={String(r.id)}>
                <span className="text-xs">{labelFor(r)}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="px-1">
        <Input
          type="number"
          min={1}
          {...form.register(`items.${index}.dispatchQty`, { valueAsNumber: true })}
          disabled={disabled}
          className={cn(FORM_INPUT_CLASS, "h-10 text-right")}
        />
      </TableCell>
    </TableRow>
  )
}
