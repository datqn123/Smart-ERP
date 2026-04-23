import { useEffect, useState, useRef } from "react"
import { usePageTitle } from "@/context/PageTitleContext"
import { MapPin, Truck, Eye, Search, Calendar, Download, Upload, Plus } from "lucide-react"
import { formatDate } from "../utils"
import { mockStockDispatchs } from "../mockData"
import type { StockDispatch } from "../types"
import { StatusBadge } from "../components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

import { DispatchTable } from "../components/DispatchTable"
import { DispatchDetailDialog } from "../components/DispatchDetailDialog"
import { DispatchForm } from "../components/DispatchForm"
import { createDispatch, confirmDispatch, cancelDispatch } from "../inventoryCrudLogic"

const PAGE_SIZE = 20

const statusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "Pending", label: "Chờ xuất" },
  { value: "Full", label: "Đủ hàng" },
  { value: "Partial", label: "Một phần" },
  { value: "Cancelled", label: "Đã hủy" },
]

export function DispatchPage() {
  const { setTitle } = usePageTitle()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // State
  const [dispatches] = useState(mockStockDispatchs)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  
  // UI State
  const [selectedDispatch, setSelectedDispatch] = useState<StockDispatch | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // CRUD UI State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingDispatch, setEditingDispatch] = useState<StockDispatch | undefined>()

  useEffect(() => { setTitle("Xuất kho & Điều phối") }, [setTitle])

  // Logic: Filter and Sort
  const filtered = dispatches.filter(d => {
    const matchesSearch = 
      d.dispatchCode.toLowerCase().includes(search.toLowerCase()) ||
      d.orderCode.toLowerCase().includes(search.toLowerCase()) ||
      d.customerName.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Infinite Scroll Handler
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setVisibleCount(prev => prev + PAGE_SIZE);
          setIsLoadingMore(false);
        }, 600);
      }
    }, { threshold: 0.1 });

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore]);

  const handleExportExcel = () => { toast.info("Đang xuất dữ liệu Excel...") }
  const handleImportExcel = () => { fileInputRef.current?.click() }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) toast.success(`Đã chọn file: ${file.name}. Đang xử lý import...`)
  }
  
  const handleCreateDispatch = () => {
    setEditingDispatch(undefined)
    setIsFormOpen(true)
  }

  const handleEditDispatch = (dispatch: StockDispatch) => {
    setEditingDispatch(dispatch)
    setIsFormOpen(true)
  }

  const handleDeleteDispatch = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn hủy phiếu xuất kho này?")) {
      cancelDispatch(id)
      toast.success("Đã hủy phiếu xuất kho!")
      window.location.reload()
    }
  }

  const handleFormSubmit = async (data: any) => {
    if (editingDispatch) {
      toast.success("Cập nhật phiếu xuất thành công (chức năng update sẽ được triển khai)")
      window.location.reload()
    } else {
      const newDispatch = createDispatch({
        orderId: Math.floor(Math.random() * 1000),
        orderCode: data.orderCode,
        customerName: data.customerName,
        dispatchDate: data.dispatchDate,
        notes: data.notes,
        items: data.items.map((i: any) => ({
          orderDetailId: Math.floor(Math.random() * 1000),
          productId: i.productId,
          productName: "",
          skuCode: "",
          unitId: 1,
          unitName: "",
          orderedQty: i.dispatchQty,
          alreadyDispatchedQty: 0,
          remainingQty: i.dispatchQty,
          dispatchQty: i.dispatchQty,
          warehouseLocation: i.warehouseLocation,
          shelfCode: i.shelfCode,
          batchNumber: i.batchNumber,
          availableStock: 1000,
          isFullyDispatched: true
        }))
      })
      confirmDispatch(newDispatch.id)
      toast.success("Tạo phiếu xuất kho thành công!")
      window.location.reload()
    }
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 gap-4 md:gap-5 overflow-hidden">
      {/* ── Header Area (Thanh tiêu đề và các nút chức năng) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-medium text-slate-900" style={{ letterSpacing: "-0.02em" }}>
            Xuất kho & Điều phối
          </h1>
          <p className="text-sm text-slate-500 mt-1">Xử lý xuất hàng theo đơn bán, tạo picking list</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCreateDispatch} className="h-11 bg-slate-900 hover:bg-slate-800 text-white">
            <Plus className="h-4 w-4 mr-2" /> Tạo phiếu xuất
          </Button>
          <Button onClick={handleExportExcel} variant="outline" className="h-11">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Button onClick={handleImportExcel} variant="outline" className="h-11">
            <Upload className="h-4 w-4 mr-2" /> Import
          </Button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
        </div>
      </div>

      {/* ── Filter Bar (Bộ lọc và tìm kiếm) ── */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3 shrink-0">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Tìm theo mã phiếu, đơn hàng, khách hàng..." value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleCount(PAGE_SIZE);
              }} className="pl-9 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all" />
          </div>
          <select value={statusFilter} onChange={(e) => {
            setStatusFilter(e.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
            className="h-11 px-3 border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 w-full sm:w-[180px] rounded-md transition-all">
            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
           <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-500">Từ ngày:</span>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 px-2 border border-slate-200 text-sm rounded bg-slate-50/50" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Đến ngày:</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="h-9 px-2 border border-slate-200 text-sm rounded bg-slate-50/50" />
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Hiển thị {visible.length} / {filtered.length} phiếu
          </p>
        </div>
      </div>

      {/* ── Table (một bảng thead+tbody trong cùng vùng cuộn — tránh lệch cột) ── */}
      <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-md">
        <div
          data-testid="dispatch-list-container"
          className="flex-1 overflow-y-auto relative scroll-smooth [scrollbar-gutter:stable] min-h-0"
        >
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-white">
              <Truck className="h-16 w-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">Không tìm thấy phiếu nào</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem kết quả</p>
              <Button onClick={() => {setSearch(""); setStatusFilter("all");}} variant="link" className="mt-2 text-slate-900">
                Xóa tất cả bộ lọc
              </Button>
            </div>
          ) : (
            <>
              <DispatchTable 
                dispatches={visible} 
                onAction={(d) => {
                  setSelectedDispatch(d);
                  setIsPanelOpen(true);
                }} 
                onEdit={handleEditDispatch}
                onDelete={handleDeleteDispatch}
              />

              {/* Skeleton loading more */}
              {isLoadingMore && (
                <div className="flex justify-center p-6 bg-slate-50/30">
                  <div className="animate-spin h-6 w-6 border-2 border-slate-300 border-t-slate-900 rounded-full" />
                </div>
              )}

              {/* Sentinel */}
              {hasMore && !isLoadingMore && (
                <div ref={sentinelRef} className="h-10" />
              )}

              {!hasMore && filtered.length > 0 && (
                <p className="text-center text-[11px] font-bold text-slate-400 py-8 uppercase tracking-widest bg-slate-50/10">
                  — Đã tải hết {filtered.length} phiếu xuất kho —
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <DispatchDetailDialog 
        dispatch={selectedDispatch}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        canApprove={true}
      />

      <DispatchForm 
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        dispatch={editingDispatch}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
