import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Trash2, Filter, Download } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface LogToolbarProps {
  searchStr: string
  onSearch: (val: string) => void
  moduleFilter: string
  onModuleChange: (val: string) => void
  selectedIds: number[]
  onAction: (action: string) => void
}

export function LogToolbar({ 
  searchStr, 
  onSearch, 
  moduleFilter, 
  onModuleChange, 
  selectedIds, 
  onAction 
}: LogToolbarProps) {
  const hasSelection = selectedIds.length > 0;

  return (
    <div className="bg-white border-x border-t border-slate-200/60 p-4 rounded-t-xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative w-full md:w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Tìm theo nội dung, người dùng..." 
            value={searchStr}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10 h-10 border-slate-200 focus:border-blue-400 focus:ring-blue-100"
          />
        </div>
        
        <Select value={moduleFilter} onValueChange={onModuleChange}>
          <SelectTrigger className="min-w-[160px] w-fit h-10 border-slate-200">
            <Filter className="h-4 w-4 mr-2 text-slate-400" />
            <SelectValue placeholder="Module" />
          </SelectTrigger>
          <SelectContent position="popper" className="bg-white">
            <SelectItem value="all">Tất cả Module</SelectItem>
            <SelectItem value="Products">Sản phẩm</SelectItem>
            <SelectItem value="Orders">Đơn hàng</SelectItem>
            <SelectItem value="Inventory">Kho hàng</SelectItem>
            <SelectItem value="Security">Bảo mật</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        {hasSelection && (
          <Button variant="destructive" size="sm" className="h-10" onClick={() => onAction("delete")}>
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa {selectedIds.length}
          </Button>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          className="h-10 px-4 border-slate-200 ml-auto"
          onClick={() => onAction("export")}
        >
          <Download className="h-4 w-4 mr-2 text-slate-500" />
          Xuất Log
        </Button>
      </div>
    </div>
  )
}
