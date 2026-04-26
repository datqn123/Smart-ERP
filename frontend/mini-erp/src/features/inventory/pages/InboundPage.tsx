import { useEffect, useMemo, useRef, useState } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { usePageTitle } from "@/context/PageTitleContext"
import {
  Plus, Search, Calendar, Upload, Download, Camera
} from "lucide-react"
import type { StockReceipt } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ReceiptTable } from "../components/ReceiptTable"
import { ReceiptDetailDialog } from "../components/ReceiptDetailDialog"
import { ReceiptForm } from "../components/ReceiptForm"
import { createReceipt, updateReceipt, deleteReceipt } from "../inventoryCrudLogic"
import {
  getStockReceiptList,
  mapStockReceiptListItemToUi,
  type GetStockReceiptListParams,
} from "../api/stockReceiptsApi"
import { ApiRequestError } from "@/lib/api/http"
import { toast } from "sonner"

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 400

const statusOptions = [
  { label: "Tất cả trạng thái", value: "all" },
  { label: "Nháp", value: "Draft" },
  { label: "Chờ duyệt", value: "Pending" },
  { label: "Đã duyệt", value: "Approved" },
  { label: "Từ chối", value: "Rejected" },
]

function parseSupplierId(raw: string): number | undefined {
  const t = raw.trim()
  if (!/^\d+$/.test(t)) {
    return undefined
  }
  const n = parseInt(t, 10)
  return n > 0 ? n : undefined
}

// ─── Main Page ────────────────────────────────────────────
export function InboundPage() {
  const { setTitle } = usePageTitle()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollRootRef = useRef<HTMLDivElement>(null)
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null)

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [supplierFilter, setSupplierFilter] = useState("")

  const [selectedReceipt, setSelectedReceipt] = useState<StockReceipt | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingReceipt, setEditingReceipt] = useState<StockReceipt | undefined>()

  const supplierIdParam = parseSupplierId(supplierFilter)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => { setTitle("Phiếu nhập kho") }, [setTitle])

  const listQueryKey = useMemo(
    () => ["stock-receipts", "v1", "list", debouncedSearch, statusFilter, dateFrom, dateTo, supplierIdParam ?? "", PAGE_SIZE] as const,
    [debouncedSearch, statusFilter, dateFrom, dateTo, supplierIdParam],
  )

  const { data, isPending, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: listQueryKey,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      const base: GetStockReceiptListParams = {
        search: debouncedSearch.trim() || undefined,
        status: statusFilter as GetStockReceiptListParams["status"],
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        supplierId: supplierIdParam,
        page: pageParam,
        limit: PAGE_SIZE,
        sort: "id:desc",
      }
      return getStockReceiptList(base)
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.items.length < lastPage.limit) {
        return undefined
      }
      if (lastPage.page * lastPage.limit >= lastPage.total) {
        return undefined
      }
      return lastPage.page + 1
    },
  })

  const mergedRows: StockReceipt[] = useMemo(
    () => (data?.pages ? data.pages.flatMap((p) => p.items.map(mapStockReceiptListItemToUi)) : []),
    [data],
  )

  const supplierTrim = supplierFilter.trim().toLowerCase()
  const displayRows = useMemo(() => {
    if (supplierIdParam != null) {
      return mergedRows
    }
    if (!supplierTrim) {
      return mergedRows
    }
    return mergedRows.filter((r) => r.supplierName.toLowerCase().includes(supplierTrim))
  }, [mergedRows, supplierIdParam, supplierTrim])

  const firstPage = data?.pages[0]
  const serverTotal = firstPage?.total ?? 0

  useEffect(() => {
    const root = scrollRootRef.current
    const sentinel = loadMoreSentinelRef.current
    if (!root || !sentinel) {
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const e = entries[0]
        if (e?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage()
        }
      },
      { root, rootMargin: "80px", threshold: 0 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, data?.pages])

  useEffect(() => {
    if (isError && error instanceof ApiRequestError) {
      const dr = error.body?.details?.dateRange
      if (error.status === 400 && dr) {
        toast.error(dr)
        return
      }
      if (error.status === 401 || error.status === 403) {
        toast.error(error.body?.message ?? "Bạn chưa đủ quyền xem phiếu nhập (can_manage_inventory).")
      } else {
        toast.error(error.body?.message ?? "Không tải được danh sách phiếu nhập")
      }
    }
  }, [isError, error])

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

  const showEmpty = !isPending && !isError && displayRows.length === 0
  const listLoaded = displayRows.length > 0

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 gap-4 md:gap-5">
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

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shrink-0">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Mã phiếu, số hóa đơn (theo API)…" value={search}
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
          <Input placeholder="NCC: nhập ID số hoặc lọc tên (đã tải)…" value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)} className="h-9 sm:w-[280px]" />
        </div>
        <p className="text-xs text-slate-500">
          Hiển thị <span className="font-medium text-slate-700">{displayRows.length}</span>
          {supplierIdParam == null && supplierTrim ? " (lọc tên trên dữ liệu đã tải)" : ""}
          {" · "}
          Tổng server: <span className="font-medium text-slate-700">{serverTotal}</span> phiếu
        </p>
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-md">
        <div
          ref={scrollRootRef}
          data-testid="receipt-list-container"
          className="flex-1 overflow-y-auto relative scroll-smooth [scrollbar-gutter:stable] min-h-0"
        >
          {isPending && (
            <div className="flex justify-center py-20">
              <div className="animate-spin h-8 w-8 border-2 border-slate-300 border-t-slate-900 rounded-full" />
            </div>
          )}
          {showEmpty && (
            <div className="text-center py-16 bg-white">
              <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900">Không tìm thấy phiếu nào</h3>
              <p className="text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}
          {listLoaded && (
            <>
              <ReceiptTable
                receipts={displayRows}
                onAction={(r) => {
                  setSelectedReceipt(r);
                  setIsPanelOpen(true);
                }}
                onEdit={handleEditReceipt}
                onDelete={handleDeleteReceipt}
              />

              {isFetchingNextPage && (
                <div className="flex justify-center p-4">
                  <div className="animate-spin h-6 w-6 border-2 border-slate-300 border-t-slate-900 rounded-full" />
                </div>
              )}

              {hasNextPage && !isFetchingNextPage && (
                <div ref={loadMoreSentinelRef} className="h-4" />
              )}

              {!hasNextPage && displayRows.length > 0 && (
                <p className="text-center text-xs text-slate-400 py-6">
                  — Đã tải {mergedRows.length} / {serverTotal} phiếu —
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
