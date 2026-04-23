import { useEffect, useState, useRef, useCallback } from "react"
import { usePageTitle } from "@/context/PageTitleContext"
import {
  Plus, Search, Calendar, Upload, Download, Camera
} from "lucide-react"
import { mockStockReceipts } from "../mockData"
import type { StockReceipt } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { filterReceipts, paginateReceipts, sortByDate } from "../inboundLogic"
import { ReceiptTable } from "../components/ReceiptTable"
import { ReceiptDetailDialog } from "../components/ReceiptDetailDialog"
import { ReceiptForm } from "../components/ReceiptForm"
import { createReceipt, updateReceipt, deleteReceipt } from "../inventoryCrudLogic"

const PAGE_SIZE = 20 // Tăng size cho table layout

const statusOptions = [
  { label: "Tất cả trạng thái", value: "all" },
  { label: "Nháp", value: "Draft" },
  { label: "Chờ duyệt", value: "Pending" },
  { label: "Đã duyệt", value: "Approved" },
  { label: "Từ chối", value: "Rejected" },
]


// ─── Main Page ────────────────────────────────────────────
export function InboundPage() {
  const { setTitle } = usePageTitle()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [supplierFilter, setSupplierFilter] = useState("")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  
  // Selection state for Detail Panel
  const [selectedReceipt, setSelectedReceipt] = useState<StockReceipt | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingReceipt, setEditingReceipt] = useState<StockReceipt | undefined>()


  useEffect(() => { setTitle("Phiếu nhập kho") }, [setTitle])

  // Sort + filter
  const sorted = sortByDate(mockStockReceipts)
  const filtered = filterReceipts(sorted, { search, status: statusFilter, dateFrom, dateTo, supplier: supplierFilter })
  const visible = paginateReceipts(filtered, visibleCount)
  const hasMore = visibleCount < filtered.length

  // Reset visibleCount when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [search, statusFilter, dateFrom, dateTo, supplierFilter])

  // Infinite scroll via IntersectionObserver
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return
    setIsLoadingMore(true)
    // Simulate tiny async delay for skeleton to show
    setTimeout(() => {
      setVisibleCount(prev => prev + PAGE_SIZE)
      setIsLoadingMore(false)
    }, 300)
  }, [hasMore, isLoadingMore])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore() },
      { threshold: 0.1 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  const handleCreateReceipt = () => {
    setEditingReceipt(undefined)
    setIsFormOpen(true)
  }
  
  const handleEditReceipt = (receipt: StockReceipt) => {
    setEditingReceipt(receipt)
    setIsFormOpen(true)
  }
  
  const handleDeleteReceipt = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa phiếu nhập này?")) {
      deleteReceipt(id)
      alert("Xóa phiếu nhập thành công!")
      window.location.reload()
    }
  }
  
  const handleFormSubmit = async (data: any) => {
    const supplierMap: Record<number, string> = {
      1: "Công ty TNHH Vinamilk",
      2: "Nhà phân phối PepsiCo",
      3: "Công ty Hàng Tiêu Dùng",
      4: "Công ty Masan",
      5: "Đại lý Unilever",
    }
    
    if (editingReceipt) {
      updateReceipt(editingReceipt.id, {
        supplierId: data.supplierId,
        supplierName: supplierMap[data.supplierId] || "",
        receiptDate: data.receiptDate,
        invoiceNumber: data.invoiceNumber,
        notes: data.notes,
        details: data.details.map((d: any) => ({
          productId: d.productId,
          productName: "",
          skuCode: "",
          unitId: 1,
          unitName: "",
          quantity: d.quantity,
          costPrice: d.costPrice,
          batchNumber: d.batchNumber,
          expiryDate: d.expiryDate,
        }))
      })
      alert("Cập nhật phiếu nhập thành công!")
      window.location.reload()
    } else {
      createReceipt({
        supplierId: data.supplierId,
        supplierName: supplierMap[data.supplierId] || "",
        receiptDate: data.receiptDate,
        invoiceNumber: data.invoiceNumber,
        notes: data.notes,
        details: data.details.map((d: any) => ({
          productId: d.productId,
          productName: "",
          skuCode: "",
          unitId: 1,
          unitName: "",
          quantity: d.quantity,
          costPrice: d.costPrice,
          batchNumber: d.batchNumber,
          expiryDate: d.expiryDate,
        }))
      })
      alert("Tạo phiếu nhập mới thành công!")
      window.location.reload()
    }
  }
  const handleScanOCR = () => alert("Chức năng Quét hóa đơn (OCR) sẽ được triển khai khi có API Backend")
  const handleExportExcel = () => alert("Chức năng Export Excel sẽ được triển khai khi có API")
  const handleImportExcel = () => fileInputRef.current?.click()
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) alert(`Đã chọn file: ${file.name}. Chức năng Import Excel sẽ được triển khai.`)
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 gap-4 md:gap-5">
      {/* ── Header (sticky, outside scroll) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">Phiếu nhập kho</h1>
          <p className="text-sm text-slate-500 mt-1">Theo dõi lịch sử nhập hàng từ nhà cung cấp</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCreateReceipt} className="h-11 bg-slate-900 hover:bg-slate-800 text-white">
            <Plus className="h-4 w-4 mr-2" /> Tạo phiếu nhập
          </Button>
          <Button onClick={handleScanOCR} variant="outline" className="h-11">
            <Camera className="h-4 w-4 mr-2" /> Quét hóa đơn
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

      {/* ── Filters (sticky, outside scroll) ── */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shrink-0">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Tìm theo mã phiếu, NCC, người tạo..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="pl-9 h-11" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-3 border border-slate-200 bg-white text-sm text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 w-full sm:w-[180px]">
            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 whitespace-nowrap">Từ ngày:</span>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 px-2 border border-slate-200 rounded text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap">Đến ngày:</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="h-9 px-2 border border-slate-200 rounded text-sm" />
          </div>
          <Input placeholder="Lọc theo nhà cung cấp..." value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)} className="h-9 sm:w-[220px]" />
        </div>
        <p className="text-xs text-slate-500">
          Hiển thị <span className="font-medium text-slate-700">{visible.length}</span> / <span className="font-medium text-slate-700">{filtered.length}</span> phiếu
        </p>
      </div>

      {/* ── Table (một bảng thead+tbody trong cùng vùng cuộn — tránh lệch cột) ── */}
      <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-md">
        <div
          data-testid="receipt-list-container"
          className="flex-1 overflow-y-auto relative scroll-smooth [scrollbar-gutter:stable] min-h-0"
        >
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white">
              <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900">Không tìm thấy phiếu nào</h3>
              <p className="text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          ) : (
            <>
              <ReceiptTable 
                receipts={visible} 
                onAction={(r) => {
                  setSelectedReceipt(r);
                  setIsPanelOpen(true);
                }} 
                onEdit={handleEditReceipt}
                onDelete={handleDeleteReceipt}
              />

            {/* Skeleton khi đang tải thêm (Spinner hoặc Shimmer cho hàng mới) */}
            {isLoadingMore && (
              <div className="flex justify-center p-4">
                <div className="animate-spin h-6 w-6 border-2 border-slate-300 border-t-slate-900 rounded-full" />
              </div>
            )}

            {/* Sentinel element cho IntersectionObserver */}
            {hasMore && !isLoadingMore && (
              <div ref={sentinelRef} className="h-4" />
            )}

            {/* End of list message */}
            {!hasMore && filtered.length > 0 && (
              <p className="text-center text-xs text-slate-400 py-6">
                — Đã hiển thị toàn bộ {filtered.length} phiếu —
              </p>
            )}
          </>
        )}
        </div>

        <ReceiptDetailDialog 
          receipt={selectedReceipt} 
          isOpen={isPanelOpen} 
          onClose={() => setIsPanelOpen(false)}
          canApprove={true}
        />
        
        <ReceiptForm 
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          receipt={editingReceipt}
          onSubmit={handleFormSubmit}
        />
      </div>
    </div>
  )
}
