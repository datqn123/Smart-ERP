import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { User, Package, CreditCard, Clock, FileText } from "lucide-react"
import { formatCurrency } from "@/features/inventory/utils"
import type { Order } from "../types"
import { cn } from "@/lib/utils"
import {
  TABLE_HEAD_CLASS,
  TABLE_CELL_PRIMARY_CLASS,
  TABLE_CELL_SECONDARY_CLASS,
  TABLE_CELL_MONO_CLASS,
  TABLE_CELL_NUMBER_CLASS,
} from "@/lib/data-table-layout"

interface OrderDetailPanelProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
}

export function OrderDetailPanel({ order, isOpen, onClose }: OrderDetailPanelProps) {
  if (!order) return null

  // Mock data for display purposes
  const mockItems = [
    { id: 1, name: "Sữa Ông Thọ Hộp Giấy", sku: "SP001", qty: 10, price: 25000, total: 250000 },
    { id: 2, name: "Nước Ngọt Coca Cola 1.5L", sku: "SP002", qty: 5, price: 15000, total: 75000 },
  ]

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto custom-scrollbar px-8 md:px-10">
        <SheetHeader className="space-y-2 pr-10"> {/* pr-10 to avoid close button */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <SheetTitle className="text-2xl font-black text-slate-900 tracking-tight">{order.orderCode}</SheetTitle>
            <div className="flex">
              <Badge className={
                order.status === 'Completed' || order.status === 'Delivered' 
                  ? "bg-green-100 text-green-700 border-green-200 py-1 px-3 text-sm font-bold" 
                  : "bg-amber-100 text-amber-700 border-amber-200 py-1 px-3 text-sm font-bold"
              }>
                {order.status === 'Completed' || order.status === 'Delivered' ? 'Hoàn thành' : 'Đang xử lý'}
              </Badge>
            </div>
          </div>
          <SheetDescription className="flex items-center gap-2 text-base text-slate-500">
            <Clock className="h-4 w-4" />
            Ngày tạo: {new Date(order.date).toLocaleDateString('vi-VN')}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-10 space-y-10">
          {/* Customer Info */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-2 w-2 rounded-full bg-slate-900" />
              <h3 className="font-bold text-slate-900 uppercase tracking-widest text-sm">Thông tin khách hàng</h3>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xl font-bold text-slate-900">{order.customerName}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-400 uppercase tracking-tight">Số điện thoại</p>
                  <p className="text-base font-semibold text-slate-700">090xxxxxxx</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-400 uppercase tracking-tight">Địa chỉ giao hàng</p>
                  <p className="text-base font-semibold text-slate-700">Quận 1, TP. Hồ Chí Minh</p>
                </div>
              </div>
            </div>
          </section>

          {/* Items Table */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-2 w-2 rounded-full bg-slate-900" />
              <h3 className="font-bold text-slate-900 uppercase tracking-widest text-sm">Danh sách sản phẩm</h3>
            </div>
            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className={cn(TABLE_HEAD_CLASS, "py-4 pl-6")}>Sản phẩm</TableHead>
                    <TableHead className={cn(TABLE_HEAD_CLASS, "text-right py-4")}>Số lượng</TableHead>
                    <TableHead className={cn(TABLE_HEAD_CLASS, "text-right py-4 pr-6")}>Thành tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/50">
                      <TableCell className="py-5 pl-6">
                        <p className={cn(TABLE_CELL_PRIMARY_CLASS, "text-base")}>{item.name}</p>
                        <p className={cn(TABLE_CELL_MONO_CLASS, "text-[10px] mt-1 text-slate-400")}>{item.sku}</p>
                      </TableCell>
                      <TableCell className={cn(TABLE_CELL_NUMBER_CLASS, "text-right text-base")}>{item.qty}</TableCell>
                      <TableCell className={cn(TABLE_CELL_NUMBER_CLASS, "text-right text-base pr-6")}>{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>

          {/* Financial Summary */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-2 w-2 rounded-full bg-slate-900" />
              <h3 className="font-bold text-slate-900 uppercase tracking-widest text-sm">Kê khai thanh toán</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between text-base font-medium text-slate-500">
                <span>Giá trị hàng hóa</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-medium text-slate-500">
                <span>Chiết khấu (Khuyến mãi)</span>
                <span className="text-red-500 font-bold">-{formatCurrency(order.discountAmount || 0)}</span>
              </div>
              <Separator className="bg-slate-100" />
              <div className="flex justify-between items-center py-2">
                <span className="text-lg font-bold text-slate-900">Tổng thanh toán</span>
                <span className="text-3xl font-black text-slate-900 tracking-tighter">{formatCurrency(order.finalAmount)}</span>
              </div>
            </div>
          </section>

          {/* Notes */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-slate-900" />
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">Ghi chú</h3>
            </div>
            <p className="text-sm text-slate-500 italic bg-white p-3 border border-dashed border-slate-200 rounded-lg">
              {order.notes || "Không có ghi chú nào cho đơn hàng này."}
            </p>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}
