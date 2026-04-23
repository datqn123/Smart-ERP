import { useEffect, useState } from "react"
import { usePageTitle } from "@/context/PageTitleContext"
import { useApprovalStore } from "../store/useApprovalStore"
import { OrderTable } from "@/features/orders/components/OrderTable"
import { OrderDetailDialog } from "@/features/orders/components/OrderDetailDialog"
import { Button } from "@/components/ui/button"
import { History, Search, Calendar, RotateCcw, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

export default function ApprovalHistoryPage() {
  const { setTitle } = usePageTitle()
  const { approvalHistory } = useApprovalStore()
  
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  
  // Filters
  const [searchCode, setSearchCode] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => { setTitle("Lịch sử phê duyệt") }, [setTitle])

  const filtered = approvalHistory.filter(t => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false
    if (searchCode && !t.transactionCode.toLowerCase().includes(searchCode.toLowerCase())) return false
    if (startDate && new Date(t.date) < new Date(startDate)) return false
    if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        if (new Date(t.date) > end) return false
    }
    return true
  })

  // Map to Order shape
  const displayData = filtered.map(t => ({
    id: t.id,
    orderCode: t.transactionCode,
    type: t.type as any,
    customerName: t.creatorName,
    date: t.processedDate || t.date,
    totalAmount: t.totalAmount,
    finalAmount: t.totalAmount,
    status: t.status as any,
    itemsCount: 0 
  }))

  const resetFilters = () => {
    setSearchCode("")
    setStatusFilter("all")
    setStartDate("")
    setEndDate("")
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 h-full flex flex-col bg-slate-50/30">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-left">
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">Lịch sử phê duyệt</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Tra cứu các giao dịch đã được xử lý trong quá khứ</p>
        </div>
        <div className="bg-slate-100 px-5 py-3 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm">
          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm">
            <History size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tổng lưu trữ</p>
            <p className="text-sm font-black text-slate-700">{approvalHistory.length} Giao dịch</p>
          </div>
        </div>
      </div>

      {/* Modern Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-wrap items-end gap-5">
        <div className="space-y-2 flex-1 min-w-[200px]">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                <Search size={12} /> Tìm giao dịch
            </Label>
            <Input 
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Nhập mã đơn hoặc tên người tạo..."
                className="h-11 border-slate-200 focus:ring-0 focus:border-slate-900 rounded-xl bg-slate-50/30 text-sm font-bold"
            />
        </div>

        <div className="space-y-2 min-w-[160px]">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                <Filter size={12} /> Trạng thái
            </Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 border-slate-200 focus:ring-0 focus:border-slate-900 rounded-xl bg-slate-50/30 text-sm font-bold">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                <SelectItem value="all" className="font-bold">Tất cả trạng thái</SelectItem>
                <SelectItem value="Approved" className="text-emerald-600 font-bold">Đã phê duyệt</SelectItem>
                <SelectItem value="Rejected" className="text-red-600 font-bold">Đã từ chối</SelectItem>
              </SelectContent>
            </Select>
        </div>

        <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                <Calendar size={12} /> Từ ngày
            </Label>
            <Input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-11 border-slate-200 focus:ring-0 focus:border-slate-900 rounded-xl bg-slate-50/30 text-sm font-bold w-44"
            />
        </div>

        <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                <Calendar size={12} /> Đến ngày
            </Label>
            <Input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-11 border-slate-200 focus:ring-0 focus:border-slate-900 rounded-xl bg-slate-50/30 text-sm font-bold w-44"
            />
        </div>

        <Button 
            variant="outline" 
            onClick={resetFilters}
            className="h-11 px-4 border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
        >
            <RotateCcw size={18} />
        </Button>
      </div>

      {/* Table Section */}
      <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-md">
        <div className="flex-1 overflow-y-auto relative scroll-smooth [scrollbar-gutter:stable] min-h-0">
          <OrderTable 
            data={displayData}
            selectedIds={[]}
            onSelect={() => {}}
            onSelectAll={() => {}}
            showCheckbox={false}
            onView={(item) => {
              setSelectedOrder(item)
              setIsDetailOpen(true)
            }}
          />
        </div>
      </div>

      <OrderDetailDialog 
        order={selectedOrder}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  )
}
