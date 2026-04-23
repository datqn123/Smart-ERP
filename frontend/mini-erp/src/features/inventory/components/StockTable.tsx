import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Package } from "lucide-react"
import type { InventoryItem } from "../types"
import { cn } from "@/lib/utils"
import {
  DATA_TABLE_ROOT_CLASS,
  DATA_TABLE_ACTION_SINGLE_HEAD_CLASS,
  DATA_TABLE_ACTION_SINGLE_CELL_CLASS,
  STOCK_TABLE_COL,
  TABLE_HEAD_CLASS,
  TABLE_CELL_PRIMARY_CLASS,
  TABLE_CELL_SECONDARY_CLASS,
  TABLE_CELL_MONO_CLASS,
  TABLE_CELL_NUMBER_CLASS,
} from "@/lib/data-table-layout"

interface StockTableProps {
  data: InventoryItem[]
  selectedIds: number[]
  onSelect: (id: number) => void
  onViewDetails: (item: InventoryItem) => void
  allSelected: boolean
  someSelected: boolean
  onSelectAll: (checked: boolean) => void
}

export function StockTable({
  data,
  selectedIds,
  onSelect,
  onViewDetails,
  allSelected,
  someSelected,
  onSelectAll,
}: StockTableProps) {
  const getStatusInfo = (item: InventoryItem) => {
    if (item.status === "Draft") return { label: "Nháp", bg: "bg-slate-100 text-slate-700" }
    if (item.quantity === 0) return { label: "Hết hàng", bg: "bg-red-100 text-red-800" }
    if (item.isLowStock) return { label: "Sắp hết", bg: "bg-red-50 text-red-700 hover:bg-red-100" }
    if (item.isExpiringSoon) return { label: "Cận date", bg: "bg-amber-50 text-amber-700 hover:bg-amber-100" }
    return { label: "Chính thức", bg: "bg-green-50 text-green-700 hover:bg-green-100" }
  }

  return (
    <Table data-testid="stock-table" className={DATA_TABLE_ROOT_CLASS}>
      <TableHeader className="sticky top-0 z-20 bg-slate-50 shadow-sm border-b">
        <TableRow className="hover:bg-transparent border-b border-slate-200">
          <TableHead className={cn(STOCK_TABLE_COL.select, "px-4 text-center")}>
            <Checkbox
              checked={allSelected ? true : someSelected ? "indeterminate" : false}
              onCheckedChange={(checked) => onSelectAll(checked as boolean)}
              aria-label="Select all"
              className="border-slate-300 data-[state=checked]:bg-white data-[state=checked]:text-blue-600 data-[state=checked]:border-blue-600"
            />
          </TableHead>
          <TableHead className={cn(STOCK_TABLE_COL.skuCode, TABLE_HEAD_CLASS, "px-4")}>
            Mã SP
          </TableHead>
          <TableHead
            className={cn(STOCK_TABLE_COL.productName, TABLE_HEAD_CLASS, "px-4")}
          >
            Tên sản phẩm
          </TableHead>
          <TableHead className={cn(STOCK_TABLE_COL.location, TABLE_HEAD_CLASS, "px-4")}>
            Vị trí
          </TableHead>
          <TableHead
            className={cn(STOCK_TABLE_COL.quantity, TABLE_HEAD_CLASS, "px-4 text-right")}
          >
            Tồn kho
          </TableHead>
          <TableHead className={cn(STOCK_TABLE_COL.expiryDate, TABLE_HEAD_CLASS, "px-4")}>
            Hạn SD
          </TableHead>
          <TableHead className={cn(STOCK_TABLE_COL.status, TABLE_HEAD_CLASS, "px-4")}>
            Trạng thái
          </TableHead>
          <TableHead className={cn(DATA_TABLE_ACTION_SINGLE_HEAD_CLASS, TABLE_HEAD_CLASS)}>
            NV
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-slate-100 bg-white">
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="h-24 text-center text-slate-500 text-sm">
              Không tìm thấy sản phẩm nào.
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => {
            const status = getStatusInfo(item)
            const isSelected = selectedIds.includes(item.id)
            return (
              <TableRow
                key={item.id}
                className={cn("group h-14 cursor-pointer", isSelected ? "bg-slate-50" : "hover:bg-slate-50/50")}
                onClick={() => onSelect(item.id)}
              >
                <TableCell className={cn(STOCK_TABLE_COL.select, "px-4 text-center")} onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onSelect(item.id)}
                    aria-label={`Select ${item.productName}`}
                    className="border-slate-300 data-[state=checked]:bg-white data-[state=checked]:text-blue-600 data-[state=checked]:border-blue-600"
                  />
                </TableCell>
                <TableCell
                  className={cn(STOCK_TABLE_COL.skuCode, TABLE_CELL_MONO_CLASS, "px-4")}
                >
                  {item.skuCode}
                </TableCell>
                <TableCell className={cn(STOCK_TABLE_COL.productName, TABLE_CELL_PRIMARY_CLASS, "px-4 truncate")}>
                  {item.productName}
                </TableCell>
                <TableCell className={cn(STOCK_TABLE_COL.location, TABLE_CELL_SECONDARY_CLASS, "px-4")}>
                  <Badge variant="outline" className="text-xs font-normal border-slate-200 h-6">
                    {item.warehouseCode}-{item.shelfCode}
                  </Badge>
                </TableCell>
                <TableCell className={cn(STOCK_TABLE_COL.quantity, TABLE_CELL_NUMBER_CLASS, "px-4 text-right")}>
                  <div className="flex items-center justify-end gap-1">
                    <Package className="h-3 w-3 shrink-0 text-slate-400" />
                    {item.quantity}{" "}
                    <span className="text-xs font-normal text-slate-500">{item.unitName}</span>
                  </div>
                </TableCell>
                <TableCell className={cn(STOCK_TABLE_COL.expiryDate, TABLE_CELL_SECONDARY_CLASS, "px-4")}>
                  {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString("vi-VN") : "—"}
                </TableCell>
                <TableCell className={cn(STOCK_TABLE_COL.status, "px-4")}>
                  <Badge variant="secondary" className={`${status.bg} text-xs font-normal border-none`}>
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell className={cn(DATA_TABLE_ACTION_SINGLE_CELL_CLASS, "px-2")}>
                  <div className="flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-slate-400 hover:text-slate-900 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        onViewDetails(item)
                      }}
                      title="Xem chi tiết lô"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}
