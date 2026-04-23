import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Edit2, Trash2, Star } from "lucide-react"
import { formatCurrency } from "@/features/inventory/utils"
import { 
  DATA_TABLE_ROOT_CLASS, 
  DATA_TABLE_ACTION_HEAD_CLASS, 
  DATA_TABLE_ACTION_CELL_CLASS,
  CUSTOMER_TABLE_COL,
  TABLE_HEAD_CLASS,
  TABLE_CELL_PRIMARY_CLASS,
  TABLE_CELL_SECONDARY_CLASS,
  TABLE_CELL_MONO_CLASS,
  TABLE_CELL_NUMBER_CLASS,
} from "@/lib/data-table-layout"
import { cn } from "@/lib/utils"
import type { Customer } from "../types"

// Loyalty Badge
function LoyaltyBadge({ points }: { points: number }) {
  if (points >= 500) return <Badge className="bg-blue-100 text-blue-800 text-xs border-none"><Star className="h-3 w-3 mr-1" />{points}</Badge>
  if (points >= 100) return <Badge className="bg-blue-50 text-blue-700 text-xs border-none"><Star className="h-3 w-3 mr-1" />{points}</Badge>
  return <Badge className="bg-slate-100 text-slate-500 text-xs border-none">{points} điểm</Badge>
}

interface CustomerTableProps {
  data: Customer[]
  selectedIds: number[]
  onSelect: (id: number) => void
  onSelectAll: (checked: boolean) => void
  onView: (item: Customer) => void
  onEdit: (item: Customer) => void
  onDelete: (item: Customer) => void
}

export function CustomerTable({ 
  data, 
  selectedIds, 
  onSelect, 
  onSelectAll, 
  onView, 
  onEdit,
  onDelete
}: CustomerTableProps) {
  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  return (
    <Table className={DATA_TABLE_ROOT_CLASS}>
      <TableHeader className="sticky top-0 z-30 bg-slate-50 shadow-sm border-b">
        <TableRow className="hover:bg-transparent border-slate-200 border-b">
          <TableHead className={cn(CUSTOMER_TABLE_COL.select, "px-4 text-center", TABLE_HEAD_CLASS)}>
            <Checkbox 
              checked={allSelected ? true : someSelected ? "indeterminate" : false} 
              onCheckedChange={(checked) => onSelectAll(checked as boolean)}
              className="border-slate-300 data-[state=checked]:bg-white data-[state=checked]:text-blue-600 data-[state=checked]:border-blue-600"
            />
          </TableHead>
          <TableHead className={cn(CUSTOMER_TABLE_COL.code, TABLE_HEAD_CLASS, "px-4")}>Mã KH</TableHead>
          <TableHead className={cn(CUSTOMER_TABLE_COL.name, TABLE_HEAD_CLASS, "px-4")}>Khách hàng</TableHead>
          <TableHead className={cn(CUSTOMER_TABLE_COL.phone, TABLE_HEAD_CLASS, "px-4")}>SĐT</TableHead>
          <TableHead className={cn(CUSTOMER_TABLE_COL.email, TABLE_HEAD_CLASS, "px-4")}>Email</TableHead>
          <TableHead className={cn(CUSTOMER_TABLE_COL.loyalty, TABLE_HEAD_CLASS, "px-4")}>Điểm</TableHead>
          <TableHead className={cn(CUSTOMER_TABLE_COL.spending, TABLE_HEAD_CLASS, "px-4 text-right")}>Tổng chi</TableHead>
          <TableHead className={cn(CUSTOMER_TABLE_COL.orders, TABLE_HEAD_CLASS, "px-4 text-center")}>Đơn</TableHead>
          <TableHead className={cn(CUSTOMER_TABLE_COL.status, TABLE_HEAD_CLASS, "px-4")}>Trạng thái</TableHead>
          <TableHead className={cn(DATA_TABLE_ACTION_HEAD_CLASS, TABLE_HEAD_CLASS)}>Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-slate-100">
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={10} className="h-24 text-center text-slate-500 text-sm">
              Không tìm thấy khách hàng nào.
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <TableRow key={item.id} className={cn("group h-14", isSelected ? "bg-slate-50" : "hover:bg-slate-50/50")}>
                <TableCell className="px-4 text-center">
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={() => onSelect(item.id)}
                    className="border-slate-300 data-[state=checked]:bg-white data-[state=checked]:text-blue-600 data-[state=checked]:border-blue-600"
                  />
                </TableCell>
                <TableCell className={cn(CUSTOMER_TABLE_COL.code, TABLE_CELL_MONO_CLASS, "px-4")}>{item.customerCode}</TableCell>
                <TableCell className={cn(CUSTOMER_TABLE_COL.name, TABLE_CELL_PRIMARY_CLASS, "px-4 truncate")}>{item.name}</TableCell>
                <TableCell className={cn(CUSTOMER_TABLE_COL.phone, TABLE_CELL_SECONDARY_CLASS, "px-4")}>{item.phone}</TableCell>
                <TableCell className={cn(CUSTOMER_TABLE_COL.email, TABLE_CELL_SECONDARY_CLASS, "px-4 truncate")}>{item.email || '-'}</TableCell>
                <TableCell className="px-4"><LoyaltyBadge points={item.loyaltyPoints} /></TableCell>
                <TableCell className={cn(CUSTOMER_TABLE_COL.spending, TABLE_CELL_NUMBER_CLASS, "text-right px-4")}>
                  {item.totalSpent ? formatCurrency(item.totalSpent) : '-'}
                </TableCell>
                <TableCell className={cn(CUSTOMER_TABLE_COL.orders, TABLE_CELL_NUMBER_CLASS, "text-center px-4")}>{item.orderCount ?? 0}</TableCell>
                <TableCell className={cn(CUSTOMER_TABLE_COL.status, "px-4")}>
                  <Badge className={cn("text-xs font-normal border-none", item.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500')}>
                    {item.status === 'Active' ? 'Hoạt động' : 'Ngừng'}
                  </Badge>
                </TableCell>
                <TableCell className={DATA_TABLE_ACTION_CELL_CLASS}>
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onView(item)} title="Xem chi tiết" className="h-8 w-8 text-slate-500 hover:text-slate-900 transition-colors">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(item)} title="Chỉnh sửa" className="h-8 w-8 text-slate-500 hover:text-slate-900 transition-colors">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(item)} title="Xóa" className="h-8 w-8 text-slate-500 hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
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
