import { useCallback, useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { usePageTitle } from "@/context/PageTitleContext"
import { Package, AlertTriangle, CalendarClock, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react"
import { formatCurrency } from "../utils"
import { Button } from "@/components/ui/button"
import type { InventoryItem, InventoryFilters, InventoryKPIs } from "../types"
import { toast } from "sonner"
import {
  getInventoryList,
  mapListItemToUi,
  mapSummaryToKpis,
  type GetInventoryListParams,
} from "../api/inventoryApi"
import { ApiRequestError } from "@/lib/api/http"

import { StockToolbar } from "../components/StockToolbar"
import { StockTable } from "../components/StockTable"
import { StockBatchDetailsDialog } from "../components/StockBatchDetailsDialog"
import { StockActionDialog } from "../components/StockActionDialog"
import { StockEditDialog } from "../components/StockEditDialog"

const EMPTY_KPIS: InventoryKPIs = {
  totalSKUs: 0,
  totalValue: 0,
  lowStockCount: 0,
  expiringSoonCount: 0,
}

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 400

function uiStatusToStockLevel(status: InventoryFilters["status"]): NonNullable<GetInventoryListParams["stockLevel"]> {
  switch (status) {
    case "in-stock":
      return "in_stock"
    case "low-stock":
      return "low_stock"
    case "out-of-stock":
      return "out_of_stock"
    case "all":
    default:
      return "all"
  }
}

function KPICard({ title, value, icon, color }: {
  title: string; value: string; icon: React.ReactNode; color: string
}) {
  return (
    <div className="bg-white p-4 md:p-5 flex items-start gap-3 border border-slate-200 rounded-lg shadow-sm">
      <div className={`p-2.5 ${color} rounded-md flex-shrink-0`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-lg md:text-xl font-semibold text-slate-900 truncate tracking-tight">{value}</p>
      </div>
    </div>
  )
}

export function StockPage() {
  const { setTitle } = usePageTitle()
  const [filters, setFilters] = useState<InventoryFilters>({ search: "", status: "all" })
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [filters.search])

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["inventory", "v1", "list", debouncedSearch, filters.status, page, PAGE_SIZE],
    queryFn: () =>
      getInventoryList({
        search: debouncedSearch.trim() || undefined,
        stockLevel: uiStatusToStockLevel(filters.status),
        page,
        limit: PAGE_SIZE,
        sort: "id:asc",
      }),
  })

  const kpis = useMemo((): InventoryKPIs => {
    if (!data?.summary) {
      return EMPTY_KPIS
    }
    return mapSummaryToKpis(data.summary)
  }, [data])

  const listItems: InventoryItem[] = useMemo(() => (data?.items ? data.items.map(mapListItemToUi) : []), [data])
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  useEffect(() => {
    if (isError && error instanceof ApiRequestError) {
      if (error.status === 401 || error.status === 403) {
        toast.error(error.body?.message ?? "Bạn chưa đủ quyền xem tồn kho (can_manage_inventory).")
      } else {
        toast.error(error.body?.message ?? "Không tải được danh sách tồn kho")
      }
    }
  }, [isError, error])

  // Custom states for selection and dialog tracking
  const [selectedBatchItem, setSelectedBatchItem] = useState<InventoryItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"import" | "export">("import")
  const [actionItems, setActionItems] = useState<InventoryItem[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [itemsToEdit, setItemsToEdit] = useState<InventoryItem[]>([])

  useEffect(() => { setTitle("Tồn kho") }, [setTitle])

  useEffect(() => {
    setSelectedIds([])
  }, [page])

  const allSelected = listItems.length > 0 && selectedIds.length === listItems.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < listItems.length

  const handleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? listItems.map((i) => i.id) : [])
  }

  const handleViewDetails = (item: InventoryItem) => {
    setSelectedBatchItem(item)
    setIsDialogOpen(true)
  }

  const notImplementedBulk = useCallback(
    (label: string) => {
      toast.info(`${label} — cập nhật tồn qua API ở Task007/010; hiện màn dùchỉ GET /api/v1/inventory.`)
    },
    []
  )

  const handleToolbarAction = (action: string) => {
    switch (action) {
    case "approve":
      notImplementedBulk("Phê duyệt tồn (Task010+)")
      break
    case "delete":
      notImplementedBulk("Xoá dòng tồn (sẽ nối khi BE có ghi phân tách)")
      break
    case "edit":
      setItemsToEdit(listItems.filter((i) => selectedIds.includes(i.id)))
      setIsEditDialogOpen(true)
      break
    case "import":
      setActionType("import")
      setActionItems(listItems.filter((i) => selectedIds.includes(i.id)))
      setIsActionDialogOpen(true)
      break
    case "export":
      setActionType("export")
      setActionItems(listItems.filter((i) => selectedIds.includes(i.id)))
      setIsActionDialogOpen(true)
      break
    }
  }

  const handleActionConfirm = (_adjustments: Record<number, number>) => {
    notImplementedBulk("Nhập / xuất điều chỉnh số lượng")
    setIsActionDialogOpen(false)
  }

  const handleEditConfirm = (_updatedItems: InventoryItem[]) => {
    notImplementedBulk("Cập nhật hàng loạt")
    setIsEditDialogOpen(false)
  }

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden p-4 md:p-6 lg:p-8 gap-4 md:gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">
            Danh sách tồn kho
          </h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý số lượng, vị trí và lô hàng (dữ liệu từ API)</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void refetch()} disabled={isPending}>
          Tải lại
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 shrink-0">
        <KPICard
          title="Tổng mặt hàng"
          value={isPending && !data ? "…" : String(kpis.totalSKUs)}
          icon={<Package className="h-5 w-5 text-slate-700" />}
          color="bg-slate-100"
        />
        <KPICard
          title="Tổng giá trị kho"
          value={isPending && !data ? "…" : formatCurrency(kpis.totalValue)}
          icon={<TrendingUp className="h-5 w-5 text-green-700" />}
          color="bg-green-50"
        />
        <KPICard
          title="Sắp hết hàng"
          value={isPending && !data ? "…" : String(kpis.lowStockCount)}
          icon={<AlertTriangle className="h-5 w-5 text-red-700" />}
          color="bg-red-50"
        />
        <KPICard
          title="Cận hạn sử dụng"
          value={isPending && !data ? "…" : String(kpis.expiringSoonCount)}
          icon={<CalendarClock className="h-5 w-5 text-amber-700" />}
          color="bg-amber-50"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 shrink-0">
        <StockToolbar
          searchStr={filters.search}
          onSearch={(v) => {
            setFilters((prev) => ({ ...prev, search: v }))
            setPage(1)
          }}
          status={filters.status}
          onStatusChange={(v) => {
            setFilters((prev) => ({ ...prev, status: v as InventoryFilters["status"] }))
            setPage(1)
            setSelectedIds([])
          }}
          selectedIds={selectedIds}
          onAction={handleToolbarAction}
        />
      </div>

      <div className="flex-1 min-h-0 bg-white border border-slate-200/60 rounded-xl shadow-md overflow-hidden flex flex-col">
        {isPending && !data ? (
          <div className="p-8 text-center text-slate-500 flex-1">Đang tải từ server…</div>
        ) : isError && !data ? (
          <div className="p-8 text-center text-red-600 flex-1">Không tải được dữ liệu. Bấm Tải lại hoặc kiểm tra mạng / quyền (can_manage_inventory).</div>
        ) : (
          <div className="flex-1 overflow-y-auto relative scroll-smooth [scrollbar-gutter:stable] min-h-0">
            <StockTable
              data={listItems}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onViewDetails={handleViewDetails}
              allSelected={allSelected}
              someSelected={someSelected}
              onSelectAll={handleSelectAll}
            />
          </div>
        )}
        {data && total > 0 && !isError && (
          <div className="flex items-center justify-between flex-wrap gap-2 px-3 py-2 border-t border-slate-200 bg-slate-50/80 text-sm text-slate-600">
            <span>
              Trang {data.page} / {totalPages} — {total} dòng
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-[40px]"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isPending}
                aria-label="Trang trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-[40px]"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isPending}
                aria-label="Trang sau"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <StockBatchDetailsDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        item={selectedBatchItem}
      />

      <StockActionDialog
        isOpen={isActionDialogOpen}
        onClose={() => setIsActionDialogOpen(false)}
        onConfirm={handleActionConfirm}
        items={actionItems}
        type={actionType}
      />

      <StockEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onConfirm={handleEditConfirm}
        items={itemsToEdit}
      />
    </div>
  )
}
