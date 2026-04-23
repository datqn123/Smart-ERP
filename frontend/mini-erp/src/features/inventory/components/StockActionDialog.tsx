import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState, useEffect } from "react"
import type { InventoryItem } from "../types"
import { ArrowDownToLine, ArrowUpFromLine, AlertCircle } from "lucide-react"

interface StockActionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (adjustments: Record<number, number>) => void
  items: InventoryItem[]
  type: 'import' | 'export'
}

export function StockActionDialog({ isOpen, onClose, onConfirm, items, type }: StockActionDialogProps) {
  const [quantities, setQuantities] = useState<Record<number, number>>({})

  useEffect(() => {
    if (isOpen) {
      // Initialize with 0 or some default
      const initial: Record<number, number> = {}
      items.forEach(item => {
        initial[item.id] = 0
      })
      setQuantities(initial)
    }
  }, [isOpen, items])

  const handleQtyChange = (id: number, val: string) => {
    const num = parseInt(val) || 0
    setQuantities(prev => ({ ...prev, [id]: num }))
  }

  const isInvalid = items.length === 0 || Object.values(quantities).every(q => q <= 0)
  
  // Extra validation for export: cannot export more than available
  const hasExportError = type === 'export' && items.some(item => (quantities[item.id] || 0) > item.quantity)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-5xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-xl flex items-center gap-2">
            {type === 'import' ? (
              <><ArrowDownToLine className="h-5 w-5 text-blue-600" /> Nhập kho hàng loạt</>
            ) : (
              <><ArrowUpFromLine className="h-5 w-5 text-orange-600" /> Xuất kho hàng loạt</>
            )}
          </DialogTitle>
          <DialogDescription>
            Điều chỉnh số lượng cho {items.length} mặt hàng đã chọn
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[450px]">Sản phẩm</TableHead>
                <TableHead>Hiện tại</TableHead>
                <TableHead className="w-[150px]">Số lượng {type === 'import' ? 'nhập' : 'xuất'}</TableHead>
                <TableHead className="text-right">Dự kiến</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => {
                const adj = quantities[item.id] || 0
                const expected = type === 'import' ? item.quantity + adj : item.quantity - adj
                const error = type === 'export' && adj > item.quantity

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-bold text-slate-900">{item.productName}</div>
                      <div className="text-xs text-slate-500">{item.skuCode}</div>
                    </TableCell>
                    <TableCell className="text-slate-600 font-medium">
                      {item.quantity} {item.unitName}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Input 
                          type="number" 
                          min="0"
                          value={adj || ""} 
                          onChange={(e) => handleQtyChange(item.id, e.target.value)}
                          className={`h-9 rounded-lg ${error ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200 focus:border-blue-400'}`}
                        />
                        {error && (
                          <div className="text-[10px] text-red-600 font-bold flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Vượt quá tồn kho
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={`text-right font-bold ${expected < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                      {expected}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="p-6 border-t bg-slate-50/50">
          <Button variant="ghost" onClick={onClose} className="rounded-lg">Hủy</Button>
          <Button 
            disabled={isInvalid || hasExportError}
            onClick={() => onConfirm(quantities)}
            className={`rounded-lg px-8 ${type === 'import' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'}`}
          >
            Xác nhận {type === 'import' ? 'nhập kho' : 'xuất kho'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
