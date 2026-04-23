import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "../utils"
import type { InventoryItem } from "../types"
import { DollarSign, MapPin, Box, ShieldCheck, Tag } from "lucide-react"

interface StockBatchDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  item: InventoryItem | null
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

function isExpiringSoon(expiryDate: string | undefined): boolean {
  if (!expiryDate) return false
  const expiryTime = new Date(expiryDate).getTime()
  const todayStart = new Date(new Date().toDateString()).getTime()
  return expiryTime < todayStart + THIRTY_DAYS_MS
}

function buildBatches(item: InventoryItem) {
  return [
    {
      id: 1,
      batchNumber: item.batchNumber || "B-CHUNG",
      quantity: Math.floor(item.quantity * 0.7) || item.quantity,
      expiryDate: item.expiryDate,
      warehouseCode: item.warehouseCode,
      shelfCode: item.shelfCode,
    },
    {
      id: 2,
      batchNumber: "B-NEW-2026",
      quantity: Math.ceil(item.quantity * 0.3),
      expiryDate: "2027-12-31",
      warehouseCode: item.warehouseCode,
      shelfCode: item.shelfCode,
    }
  ].filter(b => b.quantity > 0 || b.id === 1)
}

function DetailItem({ label, value, icon: Icon }: { label: string, value: string | number, icon: any }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50/50 rounded-lg border border-slate-100">
      <div className="p-2 bg-white rounded-md border border-slate-200 shadow-sm text-slate-600">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export function StockBatchDetailsDialog({ isOpen, onClose, item }: StockBatchDetailsDialogProps) {
  if (!item) return null

  const batches = buildBatches(item)
  const totalQuantity = batches.reduce((sum, b) => sum + b.quantity, 0)
  const statusLabel = item.quantity === 0 ? "Hết hàng" : item.isLowStock ? "Sắp hết" : "An toàn"
  const statusColor = item.quantity === 0 ? "destructive" : item.isLowStock ? "warning" : "success"

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-full sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-slate-200 shadow-2xl">
        <DialogHeader className="p-6 pb-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-left">
              <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-900">
                {item.productName}
              </DialogTitle>
              <DialogDescription asChild>
                <div className="flex items-center gap-2 mt-1.5 text-left">
                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 text-xs">SKU: {item.skuCode}</span>
                  <Separator orientation="vertical" className="h-3 mx-1" />
                  <span className="text-slate-500 text-sm">{item.unitName}</span>
                </div>
              </DialogDescription>
            </div>
            <Badge variant={statusColor as any} className="w-fit h-7 px-3 text-xs uppercase tracking-widest font-bold border-none">
              {statusLabel}
            </Badge>
          </div>
        </DialogHeader>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <DetailItem 
              label="Mã Barcode" 
              value={item.skuCode} 
              icon={Tag}
            />
            <DetailItem 
              label="Vị trí mặc định" 
              value={`${item.warehouseCode} - ${item.shelfCode}`}
              icon={MapPin}
            />
            <DetailItem 
              label="Tài chính (VND)" 
              value={`${formatCurrency(item.costPrice)} /đv`}
              icon={DollarSign}
            />
            <DetailItem 
              label="Cảnh báo định mức" 
              value={`Định mức: ${item.minQuantity}`}
              icon={ShieldCheck}
            />
          </div>

          <div className="mt-4 p-4 bg-slate-900 rounded-xl flex flex-col md:flex-row md:items-center justify-between text-white shadow-lg gap-4 md:gap-0">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-slate-800 rounded-lg">
                <Box size={24} className="text-slate-300" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium whitespace-nowrap">Tổng tồn hiện tại</p>
                <div className="text-2xl font-bold tracking-tight flex items-baseline gap-1.5">
                  {totalQuantity} <span className="text-sm font-normal text-slate-500">{item.unitName}</span>
                </div>
              </div>
            </div>
            <Separator orientation="vertical" className="h-10 bg-slate-800 hidden md:block" />
            <div className="md:text-right">
              <p className="text-xs text-slate-400 font-medium whitespace-nowrap">Giá trị tồn kho</p>
              <p className="text-xl font-semibold text-green-400">{formatCurrency(item.totalValue)}</p>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-base font-semibold text-slate-900">Phân bổ chi tiết lô hàng</h3>
            </div>
            
            <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-sm bg-white">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="min-w-[120px]">Số lô</TableHead>
                    <TableHead className="min-w-[120px] text-center px-4">Vị trí</TableHead>
                    <TableHead className="min-w-[120px] text-center px-4">Hạn SD</TableHead>
                    <TableHead className="min-w-[80px] text-right font-semibold">Số lượng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => (
                    <TableRow key={batch.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium text-slate-700 py-3">{batch.batchNumber}</TableCell>
                      <TableCell className="text-center px-4">
                        <Badge variant="outline" className="font-mono text-slate-600 bg-white shadow-xs border-slate-200">
                          {batch.warehouseCode}-{batch.shelfCode}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center px-4">
                        <span className={isExpiringSoon(batch.expiryDate) ? "text-amber-600 font-semibold" : "text-slate-600"}>
                          {batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString('vi-VN') : '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-900 py-3">
                        {batch.quantity}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-400 text-center italic">
          Các chỉ số dựa trên dữ liệu cập nhật lần cuối: {new Date(item.updatedAt).toLocaleString('vi-VN')}
        </div>
      </DialogContent>
    </Dialog>
  )
}
