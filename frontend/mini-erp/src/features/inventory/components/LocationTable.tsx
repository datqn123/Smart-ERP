import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Edit2, Trash2, MapPin } from "lucide-react"
import { 
  DATA_TABLE_ROOT_CLASS, 
  DATA_TABLE_ACTION_HEAD_CLASS, 
  DATA_TABLE_ACTION_CELL_CLASS,
} from "@/lib/data-table-layout"
import type { WarehouseLocation } from "../location-types"

interface LocationTableProps {
  data: WarehouseLocation[]
  selectedIds: number[]
  onSelect: (id: number) => void
  onSelectAll: (checked: boolean) => void
  onView: (item: WarehouseLocation) => void
  onEdit: (item: WarehouseLocation) => void
  onDelete: (item: WarehouseLocation) => void
}

export function LocationTable({ 
  data, 
  selectedIds, 
  onSelect, 
  onSelectAll, 
  onView, 
  onEdit,
  onDelete
}: LocationTableProps) {
  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-md">
      <div className="flex-1 overflow-y-auto relative scroll-smooth [scrollbar-gutter:stable] min-h-0">
        <Table className={DATA_TABLE_ROOT_CLASS}>
          <TableHeader className="sticky top-0 z-30 bg-slate-50 border-b">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[48px] px-4 text-center">
                <Checkbox 
                  checked={allSelected ? true : someSelected ? "indeterminate" : false} 
                  onCheckedChange={(checked) => onSelectAll(checked as boolean)}
                  className="border-slate-300 data-[state=checked]:bg-white data-[state=checked]:text-blue-600 data-[state=checked]:border-blue-600"
                />
              </TableHead>
              <TableHead className="w-[140px] text-sm font-semibold text-slate-900 px-4">Mã vị trí</TableHead>
              <TableHead className="w-[120px] text-sm font-semibold text-slate-900 px-4">Khu vực</TableHead>
              <TableHead className="w-[100px] text-sm font-semibold text-slate-900 px-4">Kệ/Ô</TableHead>
              <TableHead className="w-[140px] text-sm font-semibold text-slate-900 px-4 text-center">Tình trạng kho</TableHead>
              <TableHead className="w-[120px] text-sm font-semibold text-slate-900 px-4">Trạng thái</TableHead>
              <TableHead className="flex-1 text-sm font-semibold text-slate-900 px-4">Ghi chú</TableHead>
              <TableHead className={DATA_TABLE_ACTION_HEAD_CLASS}>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-48 text-center text-slate-500 text-sm">
                  Không tìm thấy vị trí kho nào.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const percent = Math.min(100, Math.round((item.currentStock / item.capacity) * 100));
                
                return (
                  <TableRow key={item.id} className={`${isSelected ? "bg-slate-50" : "hover:bg-slate-50/50"} h-14 group`}>
                    <TableCell className="px-4 text-center">
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={() => onSelect(item.id)}
                        className="border-slate-300 data-[state=checked]:bg-white data-[state=checked]:text-blue-600 data-[state=checked]:border-blue-600"
                      />
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-sm font-mono font-semibold text-slate-700">{item.locationCode}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 px-4">{item.area}</TableCell>
                    <TableCell className="text-sm text-slate-600 px-4 font-medium">{item.shelf}</TableCell>
                    <TableCell className="px-4">
                      <div className="flex flex-col gap-1 w-full max-w-[120px] mx-auto">
                        <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                          <span>{item.currentStock}/{item.capacity}</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-orange-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <Badge className={`${
                        item.status === 'Active' ? 'bg-green-50 text-green-700' : 
                        item.status === 'Full' ? 'bg-orange-50 text-orange-700' :
                        'bg-slate-100 text-slate-500'
                      } text-xs font-normal border-none`}>
                        {item.status === 'Active' ? 'Khả dụng' : item.status === 'Full' ? 'Đã đầy' : 'Bảo trì'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500 px-4 truncate max-w-[200px]">{item.description || '-'}</TableCell>
                    <TableCell className={DATA_TABLE_ACTION_CELL_CLASS}>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => onView(item)} title="Xem chi tiết" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onEdit(item)} title="Chỉnh sửa" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(item)} title="Xóa" className="h-8 w-8 text-slate-500 hover:text-red-600">
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
      </div>
    </div>
  )
}
