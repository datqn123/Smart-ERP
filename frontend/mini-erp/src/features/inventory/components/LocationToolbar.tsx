import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Trash2, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface LocationToolbarProps {
  searchStr: string
  onSearch: (val: string) => void
  statusFilter: string
  onStatusChange: (val: string) => void
  selectedIds: number[]
  onAction: (action: string) => void
}

export function LocationToolbar({ 
  searchStr, 
  onSearch, 
  statusFilter, 
  onStatusChange, 
  selectedIds, 
  onAction 
}: LocationToolbarProps) {
  const hasSelection = selectedIds.length > 0;

  return (
    <div className="bg-white p-4 border border-slate-200 rounded-lg shrink-0 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
        <div className="relative w-full sm:w-[320px] group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <Input 
            placeholder="Tìm theo mã vị trí, khu vực..." 
            value={searchStr}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all rounded-lg"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="min-w-[160px] w-fit h-11 border-slate-200 rounded-lg bg-white shadow-sm">
            <Filter className="h-4 w-4 mr-2 text-slate-400" />
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent position="popper" className="bg-white border-slate-200 rounded-xl shadow-xl">
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="Active">Khả dụng</SelectItem>
            <SelectItem value="Full">Đã đầy</SelectItem>
            <SelectItem value="Inactive">Bảo trì</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        {hasSelection && (
          <Button variant="destructive" size="sm" className="h-11 px-4 rounded-lg" onClick={() => onAction("delete")}>
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa {selectedIds.length}
          </Button>
        )}

        <Button 
          variant="default" 
          size="sm" 
          className="h-11 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg ml-auto"
          onClick={() => onAction("create")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm vị trí
        </Button>
      </div>
    </div>
  )
}
