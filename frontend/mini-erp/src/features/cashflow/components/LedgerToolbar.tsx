import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Download, Calendar } from "lucide-react"

interface LedgerToolbarProps {
  searchStr: string
  onSearch: (val: string) => void
  onAction: (action: string) => void
}

export function LedgerToolbar({ searchStr, onSearch, onAction }: LedgerToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border border-slate-200 rounded-lg shrink-0 shadow-sm mb-4">
      <div className="relative flex-1 w-full max-w-md group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
        <Input 
          placeholder="Tìm theo mã chứng từ, nội dung..." 
          className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all rounded-lg"
          value={searchStr}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        <Button variant="outline" className="h-11 bg-white border-slate-200 rounded-lg text-slate-600">
          <Calendar className="h-4 w-4 mr-2 text-slate-400" />
          Khoảng thời gian
        </Button>
        <Button 
          variant="outline" 
          className="h-11 px-4 text-slate-600 border-slate-200 hover:bg-slate-50 rounded-lg ml-auto sm:ml-0"
          onClick={() => onAction("export")}
        >
          <Download className="h-4 w-4 mr-2" />
          Xuất sổ cái
        </Button>
      </div>
    </div>
  )
}
