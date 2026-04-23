import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Trash2, Clock } from "lucide-react"
import { 
  DATA_TABLE_ROOT_CLASS, 
  DATA_TABLE_ACTION_HEAD_CLASS, 
  DATA_TABLE_ACTION_CELL_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_CELL_PRIMARY_CLASS,
  TABLE_CELL_SECONDARY_CLASS,
  TABLE_CELL_MONO_CLASS,
} from "@/lib/data-table-layout"
import { cn } from "@/lib/utils"
import type { SystemLog } from "../log-types"

interface LogTableProps {
  data: SystemLog[]
  selectedIds: number[]
  onSelect: (id: number) => void
  onSelectAll: (checked: boolean) => void
  onView: (item: SystemLog) => void
  onDelete: (item: SystemLog) => void
}

export function LogTable({ 
  data, 
  selectedIds, 
  onSelect, 
  onSelectAll, 
  onView, 
  onDelete
}: LogTableProps) {
  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white border-x border-b border-slate-200/60 rounded-b-xl overflow-hidden shadow-md">
      <div className="flex-1 overflow-y-auto relative scroll-smooth [scrollbar-gutter:stable] min-h-0">
        <Table className={DATA_TABLE_ROOT_CLASS}>
          <TableHeader className="sticky top-0 z-30 bg-slate-50 border-b">
            <TableRow className="hover:bg-transparent">
              <TableHead className={cn("w-[48px] px-4 text-center", TABLE_HEAD_CLASS)}>
                <Checkbox 
                  checked={allSelected ? true : someSelected ? "indeterminate" : false} 
                  onCheckedChange={(checked) => onSelectAll(checked as boolean)}
                  className="border-slate-300 data-[state=checked]:bg-white data-[state=checked]:text-blue-600 data-[state=checked]:border-blue-600"
                />
              </TableHead>
              <TableHead className={cn("w-[180px] px-4", TABLE_HEAD_CLASS)}>Thời gian</TableHead>
              <TableHead className={cn("w-[150px] px-4", TABLE_HEAD_CLASS)}>Người thực hiện</TableHead>
              <TableHead className={cn("w-[120px] px-4 text-center", TABLE_HEAD_CLASS)}>Hành động</TableHead>
              <TableHead className={cn("w-[120px] px-4", TABLE_HEAD_CLASS)}>Module</TableHead>
              <TableHead className={cn("flex-1 px-4", TABLE_HEAD_CLASS)}>Nội dung</TableHead>
              <TableHead className={cn("w-[100px] px-4 text-center", TABLE_HEAD_CLASS)}>Mức độ</TableHead>
              <TableHead className={cn(DATA_TABLE_ACTION_HEAD_CLASS, TABLE_HEAD_CLASS)}>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-48 text-center text-slate-500 text-sm">
                  Không tìm thấy nhật ký nào.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                
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
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="h-3.5 w-3.5" />
                        <span className={TABLE_CELL_MONO_CLASS}>{item.timestamp}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200 uppercase shrink-0">
                          {item.user[0]}
                        </div>
                        <span className={cn(TABLE_CELL_PRIMARY_CLASS, "truncate")}>{item.user}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 text-center">
                      <span className={`text-[10px] font-bold uppercase tracking-tight px-2 py-0.5 rounded-full border h-5 inline-flex items-center ${
                        item.action === 'Delete' ? 'bg-red-50 text-red-700 border-red-100' :
                        item.action === 'Create' ? 'bg-green-50 text-green-700 border-green-100' :
                        'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {item.action}
                      </span>
                    </TableCell>
                    <TableCell className={cn(TABLE_CELL_SECONDARY_CLASS, "px-4")}>{item.module}</TableCell>
                    <TableCell className={cn(TABLE_CELL_SECONDARY_CLASS, "px-4 truncate max-w-[300px]")} title={item.description}>
                      {item.description}
                    </TableCell>
                    <TableCell className="px-4 text-center">
                      <Badge className={cn(
                        "text-[10px] font-bold uppercase h-5 px-1.5 border-none",
                        item.severity === 'Info' ? 'bg-blue-50 text-blue-700' : 
                        item.severity === 'Warning' ? 'bg-orange-50 text-orange-700' :
                        'bg-red-50 text-red-700'
                      )}>
                        {item.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className={DATA_TABLE_ACTION_CELL_CLASS}>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => onView(item)} title="Chi tiết" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                          <Eye className="h-4 w-4" />
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
