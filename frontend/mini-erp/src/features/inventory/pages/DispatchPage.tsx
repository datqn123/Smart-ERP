import { useEffect, useMemo, useRef, useState } from "react"
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"
import { usePageTitle } from "@/context/PageTitleContext"
import { Truck, Search, Calendar, Download, Upload, Plus } from "lucide-react"
import type { StockDispatch } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

import { DispatchTable } from "../components/DispatchTable"
import { DispatchDetailDialog } from "../components/DispatchDetailDialog"
import { DispatchForm, type DispatchFormData } from "../components/DispatchForm"
import { getStockDispatchList, mapStockDispatchListItemToUi } from "../api/dispatchApi"
import { ApiRequestError } from "@/lib/api/http"

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 400

const statusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "Pending", label: "Chờ xuất" },
  { value: "Full", label: "Đủ hàng" },
  { value: "Partial", label: "Một phần" },
  { value: "Cancelled", label: "Đã hủy" },
]

export function DispatchPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const { setTitle } = usePageTitle()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const [selectedDispatch, setSelectedDispatch] = useState<StockDispatch | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingDispatch, setEditingDispatch] = useState<StockDispatch | undefined>()
  const scrollRootRef = useRef<HTMLDivElement>(null)
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setTitle("Xuất kho & Điều phối")
  }, [setTitle])

  const highlightId = searchParams.get("highlight")
  useEffect(() => {
    if (!highlightId) {
      return
    }
    const id = parseInt(highlightId, 10)
    if (Number.isNaN(id)) {
      return
    }
    toast.success(`Đã tạo phiếu xuất #${id}`)
    setSearchParams({}, { replace: true })
  }, [highlightId, setSearchParams])

  const listQueryKey = useMemo(
    () =>
      ["stock-dispatches", "v1", "list", debouncedSearch, statusFilter, dateFrom, dateTo, PAGE_SIZE] as const,
    [debouncedSearch, statusFilter, dateFrom, dateTo],
  )

  const { data, isPending, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
      queryKey: listQueryKey,
      initialPageParam: 1,
      queryFn: async ({ pageParam }) => {
        const page = pageParam as number
        return getStockDispatchList({
          search: debouncedSearch.trim() || undefined,
          page,
          limit: PAGE_SIZE,
          status: statusFilter === "all" ? undefined : statusFilter,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        })
      },
      getNextPageParam: (lastPage) => {
        if (lastPage.items.length < PAGE_SIZE) {
          return undefined
        }
        if (lastPage.page * lastPage.limit >= lastPage.total) {
          return undefined
        }
        return lastPage.page + 1
      },
    })

  const dispatches = useMemo(() => {
    const pages = data?.pages ?? []
    const rows: StockDispatch[] = []
    for (const p of pages) {
      for (const it of p.items) {
        rows.push(mapStockDispatchListItemToUi(it))
      }
    }
    return rows
  }, [data?.pages])

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
      toast.error(error.body?.message ?? "Không tải được danh sách phiếu xuất")
    }
  }, [isError, error])

  const handleExportExcel = () => {
    toast.info("Đang xuất dữ liệu Excel...")
  }
  const handleImportExcel = () => {
    fileInputRef.current?.click()
  }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      toast.success(`Đã chọn file: ${file.name}. Đang xử lý import...`)
    }
  }

  const handleCreateDispatch = () => {
    toast.info("Để tạo phiếu xuất ghi nhận trên hệ thống: mở Tồn kho, chọn dòng, bấm Xuất và điền form.")
    setEditingDispatch(undefined)
    setIsFormOpen(true)
  }

  const handleFormSubmit = (_data: DispatchFormData) => {
    void queryClient.invalidateQueries({ queryKey: ["stock-dispatches", "v1", "list"] })
  }

  const total = data?.pages[0]?.total ?? 0

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 gap-4 md:gap-5 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-medium text-slate-900" style={{ letterSpacing: "-0.02em" }}>
            Xuất kho & Điều phối
          </h1>
          <p className="text-sm text-slate-500 mt-1">Danh sách phiếu xuất từ hệ thống</p>
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

      <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3 shrink-0">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm theo mã phiếu, đơn hàng, khách…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-3 border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 w-full sm:w-[180px] rounded-md transition-all"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-500">Từ ngày:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 px-2 border border-slate-200 text-sm rounded bg-slate-50/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Đến ngày:</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 px-2 border border-slate-200 text-sm rounded bg-slate-50/50"
              />
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            {isPending ? "Đang tải…" : `Hiển thị ${dispatches.length} / ${total} phiếu`}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-md">
        <div
          ref={scrollRootRef}
          data-testid="dispatch-list-container"
          className="flex-1 overflow-y-auto relative scroll-smooth [scrollbar-gutter:stable] min-h-0"
        >
          {isPending && dispatches.length === 0 ? (
            <div className="text-center py-20 text-slate-500 text-sm">Đang tải…</div>
          ) : dispatches.length === 0 ? (
            <div className="text-center py-20 bg-white">
              <Truck className="h-16 w-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">Không tìm thấy phiếu nào</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              <Button
                onClick={() => {
                  setSearch("")
                  setStatusFilter("all")
                  setDateFrom("")
                  setDateTo("")
                }}
                variant="link"
                className="mt-2 text-slate-900"
              >
                Xóa tất cả bộ lọc
              </Button>
            </div>
          ) : (
            <>
              <DispatchTable
                dispatches={dispatches}
                onAction={(d) => {
                  setSelectedDispatch(d)
                  setIsPanelOpen(true)
                }}
              />
              {isFetchingNextPage && (
                <div className="flex justify-center p-6 bg-slate-50/30">
                  <div className="animate-spin h-6 w-6 border-2 border-slate-300 border-t-slate-900 rounded-full" />
                </div>
              )}
              {hasNextPage && !isFetchingNextPage && <div ref={loadMoreSentinelRef} className="h-10" />}
              {!hasNextPage && dispatches.length > 0 && (
                <p className="text-center text-[11px] font-bold text-slate-400 py-8 uppercase tracking-widest bg-slate-50/10">
                  — Đã tải hết {dispatches.length} phiếu —
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

      <DispatchForm open={isFormOpen} onOpenChange={setIsFormOpen} dispatch={editingDispatch} onSubmit={handleFormSubmit} />
    </div>
  )
}
