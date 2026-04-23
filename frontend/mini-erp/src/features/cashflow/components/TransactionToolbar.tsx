import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Filter, Download, Trash2, Edit2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TransactionToolbarProps {
  searchStr: string
  onSearch: (val: string) => void
  statusFilter: string
  onStatusChange: (val: string) => void
  typeFilter: string
  onTypeChange: (val: string) => void
  selectedIds: number[]
  onAction: (action: string) => void
}

export function TransactionToolbar({ 
  searchStr, onSearch, statusFilter, onStatusChange, typeFilter, onTypeChange, selectedIds, onAction 
}: TransactionToolbarProps) {
  const hasSelection = selectedIds.length > 0

  return (
    <div className="bg-white p-4 border border-slate-200 rounded-lg shrink-0 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
        <div className="relative w-full sm:w-[320px] group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <Input 
            placeholder="Tìm theo mã giao dịch, nội dung..." 
            className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all rounded-lg"
            value={searchStr}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="min-w-[170px] w-fit h-11 border-slate-200 rounded-lg bg-white shadow-sm">
              <Filter className="h-4 w-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent position="popper" className="bg-white border-slate-200 rounded-xl shadow-xl">
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="Completed">Hoàn thành</SelectItem>
              <SelectItem value="Pending">Chờ xử lý</SelectItem>
              <SelectItem value="Cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={onTypeChange}>
            <SelectTrigger className="min-w-[140px] w-fit h-11 border-slate-200 rounded-lg bg-white shadow-sm">
              <SelectValue placeholder="Loại giao dịch" />
            </SelectTrigger>
            <SelectContent position="popper" className="bg-white border-slate-200 rounded-xl shadow-xl">
              <SelectItem value="all">Tất cả loại hình</SelectItem>
              <SelectItem value="Income">Thu tiền</SelectItem>
              <SelectItem value="Expense">Chi tiền</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        {hasSelection ? (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-10 px-4 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-md"
              onClick={() => onAction("edit")}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Sửa ({selectedIds.length})
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-10 px-4 text-red-600 border-red-200 bg-red-50 hover:bg-red-100 rounded-md"
              onClick={() => onAction("delete")}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xoá
            </Button>
          </div>
        ) : (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-11 px-4 text-slate-600 border-slate-200 hover:bg-slate-50 rounded-lg"
              onClick={() => onAction("export")}
            >
              <Download className="h-4 w-4 mr-2" />
              Xuất Excel
            </Button>
            <Button 
              className="h-11 px-4 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200 rounded-lg ml-auto"
              onClick={() => onAction("create")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tạo phiếu
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
