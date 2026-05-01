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
import { formatCurrency } from "../utils"
import { Edit3 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  TABLE_HEAD_CLASS,
  TABLE_CELL_PRIMARY_CLASS,
  TABLE_CELL_SECONDARY_CLASS,
  TABLE_CELL_MONO_CLASS,
  FORM_INPUT_CLASS,
} from "@/lib/data-table-layout"

interface StockEditDialogProps {
  isOpen: boolean
  onClose: () => void
  /** Caller gọi Task007 (1 dòng) hoặc Task008 bulk (nhiều dòng). */
  onConfirm: (updatedItems: InventoryItem[]) => void | Promise<void>
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

  const handleChange = (id: number, field: keyof InventoryItem, value: string | number | undefined) => {
    setEditedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[1700px] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <DialogHeader className="p-8 border-b bg-white sticky top-0 z-20 shrink-0 !text-left">
          <div className="flex justify-between items-start w-full text-left">
            <div className="w-full min-w-0 text-left">
              <DialogTitle className="text-2xl flex items-center justify-start gap-3 font-black text-slate-900 tracking-tight text-left">
                <Edit3 className="h-6 w-6 text-slate-900" /> Sửa thông tin tồn kho
              </DialogTitle>
              <DialogDescription className="text-base text-slate-500 font-medium mt-2 text-left">
                {items.length > 1
                  ? `Bạn đã chọn ${items.length} dòng. Bấm Lưu để gửi PATCH hàng loạt (tối đa 100 dòng có thay đổi); nếu một dòng lỗi, toàn bộ sẽ không được lưu.`
                  : "Chỉnh định mức tối thiểu, số lô, hạn sử dụng, mã vị trí kho và mã đơn vị tính. Giá vốn và tên đơn vị chỉ hiển thị để tham khảo; để đổi, vào mục Sản phẩm."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 custom-scrollbar bg-white text-left">
          <Table
            containerClassName="text-left"
            className="w-full table-fixed border-collapse text-base text-left [&_th]:!text-left [&_td]:!text-left [&_input]:!text-left"
          >
            <TableHeader className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-left">
              <TableRow className="hover:bg-transparent text-left">
                <TableHead className={cn(TABLE_HEAD_CLASS, "w-[8%] px-4 text-sm !text-left")}>Mã SP</TableHead>
                <TableHead className={cn(TABLE_HEAD_CLASS, "w-[16%] px-4 text-sm !text-left")}>Tên sản phẩm</TableHead>
                <TableHead className={cn(TABLE_HEAD_CLASS, "w-[14%] px-4 text-sm !text-left")}>Vị trí kho</TableHead>
                <TableHead className={cn(TABLE_HEAD_CLASS, "w-[9%] px-4 text-sm !text-left")}>Định mức</TableHead>
                <TableHead className={cn(TABLE_HEAD_CLASS, "w-[12%] px-4 text-sm !text-left")}>Đơn vị tính</TableHead>
                <TableHead className={cn(TABLE_HEAD_CLASS, "w-[10%] px-4 text-sm !text-left")}>Giá vốn</TableHead>
                <TableHead className={cn(TABLE_HEAD_CLASS, "w-[14%] px-4 text-sm !text-left")}>Số lô</TableHead>
                <TableHead className={cn(TABLE_HEAD_CLASS, "w-[11%] px-4 text-sm !text-left")}>Hạn SD</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-left [&_td]:text-left">
              {editedItems.map(item => (
                <TableRow
                  key={item.id}
                  className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0 text-left"
                >
                  {/* Mã SP */}
                  <TableCell className="px-4 py-4 align-middle text-left">
                    <div className={cn(TABLE_CELL_MONO_CLASS, "text-base bg-slate-50 px-2.5 py-1 rounded border border-slate-100 w-fit text-left")}>{item.skuCode}</div>
                  </TableCell>
                  
                  {/* Tên sản phẩm */}
                  <TableCell className="px-4 py-4 align-middle text-left">
                    <div className={cn(TABLE_CELL_PRIMARY_CLASS, "text-base leading-snug truncate text-left")} title={item.productName}>{item.productName}</div>
                  </TableCell>

                  {/* Vị trí: mã kệ + input cùng một hàng */}
                  <TableCell className="px-4 py-4 align-middle text-left">
                    <div className="flex flex-row flex-wrap items-center justify-start gap-2 min-w-0">
                      <span
                        className={cn(TABLE_CELL_SECONDARY_CLASS, "text-sm font-mono whitespace-nowrap truncate max-w-[min(100%,9rem)] text-left")}
                        title={`${item.warehouseCode}-${item.shelfCode}`}
                      >
                        {item.warehouseCode}-{item.shelfCode}
                      </span>
                      <Input
                        type="number"
                        min={1}
                        value={item.locationId}
                        onChange={(e) =>
                          handleChange(item.id, "locationId", parseInt(e.target.value, 10) || item.locationId)
                        }
                        title="Mã vị trí kho trong hệ thống"
                        aria-label="Mã vị trí kho"
                        className={cn(FORM_INPUT_CLASS, "min-h-11 w-[7.5rem] shrink-0 font-semibold text-left text-sm px-2")}
                      />
                    </div>
                  </TableCell>

                  {/* Định mức */}
                  <TableCell className="px-4 py-4 align-middle text-left">
                    <Input 
                      type="number"
                      min="0"
                      value={item.minQuantity} 
                      onChange={(e) => handleChange(item.id, 'minQuantity', parseInt(e.target.value) || 0)}
                      className={cn(FORM_INPUT_CLASS, "min-h-11 w-[7.5rem] font-semibold text-left text-sm px-2")}
                    />
                  </TableCell>

                  {/* Đơn vị: tên + mã đơn vị cùng một hàng */}
                  <TableCell className="px-4 py-4 align-middle text-left">
                    <div className="flex flex-row flex-wrap items-center justify-start gap-2 min-w-0">
                      <span
                        className={cn(TABLE_CELL_SECONDARY_CLASS, "text-sm max-w-[min(100%,7rem)] truncate shrink text-left")}
                        title={item.unitName}
                      >
                        {item.unitName}
                      </span>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Mã"
                        value={item.unitId ?? ""}
                        onChange={(e) => {
                          const raw = e.target.value
                          handleChange(item.id, "unitId", raw === "" ? undefined : parseInt(raw, 10))
                        }}
                        title="Mã đơn vị tính trong hệ thống"
                        aria-label="Mã đơn vị tính"
                        className={cn(FORM_INPUT_CLASS, "min-h-11 w-[7.5rem] shrink-0 font-semibold text-left text-sm px-2")}
                      />
                    </div>
                  </TableCell>

                  {/* Giá vốn — read-only */}
                  <TableCell className="px-4 py-4 align-middle text-left">
                    <span className={cn(TABLE_CELL_PRIMARY_CLASS, "text-base font-semibold inline-flex items-center justify-start min-h-11 tabular-nums text-left")}>
                      {formatCurrency(item.costPrice)}
                    </span>
                  </TableCell>

                  {/* Số lô */}
                  <TableCell className="px-4 py-4 align-middle text-left">
                    <Input 
                      value={item.batchNumber || ""} 
                      onChange={(e) => handleChange(item.id, 'batchNumber', e.target.value)}
                      placeholder="Số lô"
                      className={cn(FORM_INPUT_CLASS, "min-h-11 w-full max-w-[min(100%,14rem)] font-semibold text-sm text-left px-2")}
                    />
                  </TableCell>

                  {/* Hạn SD */}
                  <TableCell className="px-4 py-4 align-middle text-left">
                    <Input 
                      type="date"
                      value={item.expiryDate ? item.expiryDate.split('T')[0] : ""} 
                      onChange={(e) => handleChange(item.id, 'expiryDate', e.target.value)}
                      className={cn(FORM_INPUT_CLASS, "min-h-11 w-full max-w-[min(100%,13.5rem)] min-w-[11.5rem] font-semibold text-sm text-left px-2")}
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
            onClick={() => void Promise.resolve(onConfirm(editedItems))}
            className="rounded-xl px-12 bg-slate-900 hover:bg-black font-black text-white shadow-xl shadow-slate-200 transition-all h-12 uppercase tracking-widest text-xs"
          >
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
