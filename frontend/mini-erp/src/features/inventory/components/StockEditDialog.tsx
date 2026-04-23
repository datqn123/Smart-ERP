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
import { Edit3 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  TABLE_HEAD_CLASS,
  TABLE_CELL_PRIMARY_CLASS,
  TABLE_CELL_SECONDARY_CLASS,
  TABLE_CELL_MONO_CLASS,
  FORM_INPUT_CLASS,
  FORM_LABEL_CLASS,
} from "@/lib/data-table-layout"

interface StockEditDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (updatedItems: InventoryItem[]) => void
  items: InventoryItem[]
}

export function StockEditDialog({ isOpen, onClose, onConfirm, items }: StockEditDialogProps) {
  const [editedItems, setEditedItems] = useState<InventoryItem[]>([])

  useEffect(() => {
    if (isOpen) {
      // Deep copy to avoid mutating original items before confirm
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditedItems(items.map(item => ({ ...item })))
    }
  }, [isOpen, items])

  const handleChange = (id: number, field: keyof InventoryItem, value: string | number) => {
    setEditedItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[1700px] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <DialogHeader className="p-8 border-b bg-white sticky top-0 z-20 shrink-0">
          <div className="flex justify-between items-start w-full">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-3 font-black text-slate-900 tracking-tight">
                <Edit3 className="h-6 w-6 text-slate-900" /> Sửa thông tin tồn kho
              </DialogTitle>
              <DialogDescription className="text-base text-slate-500 font-medium mt-2">
                Cập nhật vị trí, định mức và giá vốn cho {items.length} mặt hàng đã chọn
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 custom-scrollbar bg-white">
          <Table className="w-full table-fixed border-collapse">
            <TableHeader className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
              <TableRow className="hover:bg-transparent">
                <TableHead className={cn(TABLE_HEAD_CLASS, "w-[8%] px-4")}>Mã SP</TableHead>
                <TableHead className={cn(TABLE_HEAD_CLASS, "w-[18%] px-4")}>Tên sản phẩm</TableHead>
                <TableHead className={cn(TABLE_HEAD_CLASS, "w-[12%] px-4 text-center")}>Vị trí (Kho - Kệ)</TableHead>
                <TableHead className={cn(TABLE_HEAD_CLASS, "w-[10%] px-4 text-center")}>Định mức</TableHead>
                <TableHead className={cn(TABLE_HEAD_CLASS, "w-[8%] px-4 text-center")}>Đơn vị</TableHead>
                <TableHead className={cn(TABLE_HEAD_CLASS, "w-[12%] px-4 text-center")}>Giá vốn (VNĐ)</TableHead>
                <TableHead className={cn(TABLE_HEAD_CLASS, "w-[12%] px-4 text-center")}>Số lô</TableHead>
                <TableHead className={cn(TABLE_HEAD_CLASS, "w-[10%] px-4 text-center")}>Hạn SD</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {editedItems.map(item => (
                <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
                  {/* Mã SP */}
                  <TableCell className="px-4 py-3">
                    <div className={cn(TABLE_CELL_MONO_CLASS, "bg-slate-50 px-2 py-0.5 rounded border border-slate-100 w-fit")}>{item.skuCode}</div>
                  </TableCell>
                  
                  {/* Tên sản phẩm */}
                  <TableCell className="px-4 py-3">
                    <div className={cn(TABLE_CELL_PRIMARY_CLASS, "truncate")} title={item.productName}>{item.productName}</div>
                  </TableCell>

                  {/* Vị trí */}
                  <TableCell className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Input 
                        value={item.warehouseCode} 
                        onChange={(e) => handleChange(item.id, 'warehouseCode', e.target.value)}
                        placeholder="Kho"
                        className={cn(FORM_INPUT_CLASS, "h-8 w-14 font-bold text-center text-xs")}
                      />
                      <span className="text-slate-300 font-bold">-</span>
                      <Input 
                        value={item.shelfCode} 
                        onChange={(e) => handleChange(item.id, 'shelfCode', e.target.value)}
                        placeholder="Kệ"
                        className={cn(FORM_INPUT_CLASS, "h-8 w-14 font-bold text-center text-xs")}
                      />
                    </div>
                  </TableCell>

                  {/* Định mức */}
                  <TableCell className="px-4 py-3 text-center">
                    <Input 
                      type="number"
                      min="0"
                      value={item.minQuantity} 
                      onChange={(e) => handleChange(item.id, 'minQuantity', parseInt(e.target.value) || 0)}
                      className={cn(FORM_INPUT_CLASS, "h-8 w-20 mx-auto font-bold text-center text-xs")}
                    />
                  </TableCell>

                  {/* Đơn vị */}
                  <TableCell className="px-4 py-3 text-center">
                    <Input 
                      value={item.unitName} 
                      onChange={(e) => handleChange(item.id, 'unitName', e.target.value)}
                      className={cn(FORM_INPUT_CLASS, "h-8 w-16 mx-auto font-bold text-center text-xs")}
                    />
                  </TableCell>

                  {/* Giá vốn */}
                  <TableCell className="px-4 py-3 text-center">
                    <Input 
                      type="number"
                      min="0"
                      value={item.costPrice} 
                      onChange={(e) => handleChange(item.id, 'costPrice', parseInt(e.target.value) || 0)}
                      className={cn(FORM_INPUT_CLASS, "h-8 w-full max-w-[120px] mx-auto font-bold text-center text-xs")}
                    />
                  </TableCell>

                  {/* Số lô */}
                  <TableCell className="px-4 py-3 text-center">
                    <Input 
                      value={item.batchNumber || ""} 
                      onChange={(e) => handleChange(item.id, 'batchNumber', e.target.value)}
                      placeholder="Số lô"
                      className={cn(FORM_INPUT_CLASS, "h-8 w-full max-w-[100px] mx-auto font-bold text-xs text-center")}
                    />
                  </TableCell>

                  {/* Hạn SD */}
                  <TableCell className="px-4 py-3 text-center">
                    <Input 
                      type="date"
                      value={item.expiryDate ? item.expiryDate.split('T')[0] : ""} 
                      onChange={(e) => handleChange(item.id, 'expiryDate', e.target.value)}
                      className={cn(FORM_INPUT_CLASS, "h-8 w-full max-w-[130px] mx-auto font-bold text-[10px] text-center")}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="p-8 border-t bg-slate-50 sticky bottom-0 z-20 shrink-0">
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors h-12 px-8">Hủy</Button>
          <Button 
            onClick={() => onConfirm(editedItems)}
            className="rounded-xl px-12 bg-slate-900 hover:bg-black font-black text-white shadow-xl shadow-slate-200 transition-all h-12 uppercase tracking-widest text-xs"
          >
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
