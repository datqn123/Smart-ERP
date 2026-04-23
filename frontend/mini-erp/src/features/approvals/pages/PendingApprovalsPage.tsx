import { useEffect, useState } from "react"
import { usePageTitle } from "@/context/PageTitleContext"
import { useApprovalStore } from "../store/useApprovalStore"
import { OrderTable } from "@/features/orders/components/OrderTable"
import { OrderDetailDialog } from "@/features/orders/components/OrderDetailDialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, AlertCircle, Calendar, Filter, Search, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export default function PendingApprovalsPage() {
  const { setTitle } = usePageTitle()
  const { pendingTransactions, approveTransaction, rejectTransaction } = useApprovalStore()
  
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [rejectId, setRejectId] = useState<number | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  // Filters
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [searchCode, setSearchCode] = useState("")

  useEffect(() => { setTitle("Chờ phê duyệt") }, [setTitle])

  const handleApprove = (id: number) => {
    approveTransaction(id)
    toast.success("Đã phê duyệt giao dịch thành công!")
  }

  const handleRejectClick = (id: number) => {
    setRejectId(id)
    setRejectionReason("")
  }

  const confirmReject = () => {
    if (!rejectionReason) {
      toast.error("Vui lòng nhập lý do từ chối")
      return
    }
    if (rejectId) {
      rejectTransaction(rejectId, rejectionReason)
      toast.error("Đã từ chối giao dịch")
      setRejectId(null)
    }
  }

  // Filtering Logic
  const filteredTransactions = pendingTransactions.filter(t => {
    if (searchCode && !t.transactionCode.toLowerCase().includes(searchCode.toLowerCase())) return false
    if (startDate && new Date(t.date) < new Date(startDate)) return false
    if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        if (new Date(t.date) > end) return false
    }
    return true
  })

  // Map to Order shape for the table
  const displayData = filteredTransactions.map(t => ({
    id: t.id,
    orderCode: t.transactionCode,
    type: t.type as any,
    customerName: t.creatorName, 
    date: t.date,
    totalAmount: t.totalAmount,
    finalAmount: t.totalAmount,
    status: t.status as any,
    itemsCount: 0 
  }))

  const resetFilters = () => {
      setStartDate("")
      setEndDate("")
      setSearchCode("")
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 h-full flex flex-col bg-slate-50/30">
      {/* Header & Summary */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-left">
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">Chờ phê duyệt</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Danh sách các giao dịch đang chờ Chủ cửa hàng xét duyệt</p>
        </div>
        <div className="bg-amber-50 px-5 py-3 rounded-2xl border border-amber-100 flex items-center gap-3 shadow-sm shadow-amber-50">
          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-amber-600/60 tracking-widest">Tiến độ xét duyệt</p>
            <p className="text-sm font-black text-amber-700">{pendingTransactions.length} Giao dịch cần xử lý</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-wrap items-end gap-5">
        <div className="space-y-2 flex-1 min-w-[200px]">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                <Search size={12} /> Tìm mã giao dịch
            </Label>
            <Input 
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Nhập mã đơn cần duyệt..."
                className="h-11 border-slate-200 focus:ring-0 focus:border-slate-900 rounded-xl bg-slate-50/30 text-sm font-bold"
            />
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
            title="Làm mới bộ lọc"
        >
            <RotateCcw size={18} />
        </Button>
      </div>

      {/* Table Container */}
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
            renderCustomActions={(item) => (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                  onClick={(e) => { e.stopPropagation(); handleApprove(item.id); }}
                  title="Phê duyệt nhanh"
                >
                  <CheckCircle2 size={18} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                  onClick={(e) => { e.stopPropagation(); handleRejectClick(item.id); }}
                  title="Từ chối giao dịch"
                >
                  <XCircle size={18} />
                </Button>
              </div>
            )}
          />
        </div>
      </div>

      {/* Reject Reason Dialog - Refactored for symmetry */}
      <Dialog open={rejectId !== null} onOpenChange={() => setRejectId(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-slate-200 shadow-2xl rounded-2xl">
          <DialogHeader className="p-8 pb-6 bg-slate-50/50 border-b border-slate-100 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 size-32 text-red-100/50 rotate-12">
               <XCircle size={128} />
            </div>
            <div className="flex items-center gap-4 mb-3 relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-200">
                    <AlertCircle size={24} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Xác nhận hành động</p>
                   <DialogTitle className="text-2xl font-black text-slate-900 uppercase italic">
                     Từ chối phê duyệt
                   </DialogTitle>
                </div>
            </div>
            <DialogDescription className="text-slate-500 font-medium relative z-10">
               Cần cung cấp lý do cụ thể để nhân viên liên quan nắm bắt và điều chỉnh lại giao dịch.
            </DialogDescription>
          </DialogHeader>

          <div className="p-8 space-y-6">
            <div className="space-y-2.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                Lý do từ chối (Bắt buộc)
              </Label>
              <Input 
                placeholder="VD: Sai thông tin hóa đơn, sai số lượng..." 
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="h-12 border-slate-200 focus:ring-0 focus:border-slate-900 rounded-xl bg-slate-50/30 text-sm font-bold"
                autoFocus
              />
            </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
            <Button variant="ghost" onClick={() => setRejectId(null)} className="px-6 font-bold text-slate-400 hover:text-slate-900 rounded-xl">Hủy</Button>
            <Button variant="destructive" onClick={confirmReject} className="bg-red-600 hover:bg-red-700 text-white px-8 font-black uppercase tracking-widest shadow-lg shadow-red-100 rounded-xl">
               Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <OrderDetailDialog 
        order={selectedOrder}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  )
}
