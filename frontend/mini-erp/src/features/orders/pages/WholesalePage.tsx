import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { usePageTitle } from "@/context/PageTitleContext"
import type { Order, OrderItem } from "../types"
import { OrderToolbar } from "../components/OrderToolbar"
import { OrderTable } from "../components/OrderTable"
import { OrderDetailDialog } from "../components/OrderDetailDialog"
import { Button } from "@/components/ui/button"
import { useRetailSalesHistoryListQuery } from "../hooks/useRetailSalesHistoryListQuery"
import {
  getRetailHistoryListSortLabel,
  getSalesOrderDetail,
  mapSalesOrderDetailLineDtoToOrderItem,
  type RetailHistoryListSort,
} from "../api/salesOrdersApi"

export function WholesalePage() {
  const { setTitle } = usePageTitle()
  const {
    orders,
    search,
    setSearch,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    page,
    setPage,
    sort,
    setSort,
    sortWhitelist,
    isListPending,
    isListFetching,
    isListError,
    total,
    totalPages,
  } = useRetailSalesHistoryListQuery()

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    setTitle("Lịch sử hóa đơn")
  }, [setTitle])

  const detailQuery = useQuery({
    queryKey: ["sales-orders", "detail", selectedOrder?.id],
    queryFn: () => getSalesOrderDetail(selectedOrder!.id),
    enabled: isDetailOpen && selectedOrder != null,
  })

  const detailLines: OrderItem[] | undefined = useMemo(() => {
    if (!isDetailOpen || !selectedOrder) return undefined
    if (detailQuery.isPending || detailQuery.isFetching) return []
    if (!detailQuery.data?.lines) return []
    return detailQuery.data.lines.map(mapSalesOrderDetailLineDtoToOrderItem)
  }, [isDetailOpen, selectedOrder, detailQuery.isPending, detailQuery.isFetching, detailQuery.data])

  const handleView = (item: Order) => {
    setSelectedOrder(item)
    setIsDetailOpen(true)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 h-full flex flex-col">
      <div className="shrink-0 text-left">
        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">
          Lịch sử hóa đơn bán lẻ
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Tra cứu hóa đơn đã bán tại quầy (POS). Chỉ xem — không chỉnh sửa hay hủy từ màn này.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0 text-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 whitespace-nowrap">Sắp xếp</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as RetailHistoryListSort)}
            className="h-9 px-2 border border-slate-200 bg-white rounded-md text-slate-900 min-w-[200px]"
          >
            {sortWhitelist.map((s) => (
              <option key={s} value={s}>
                {getRetailHistoryListSortLabel(s)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1 || isListPending}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Trước
          </Button>
          <span className="text-slate-600 tabular-nums">
            Trang {page}/{totalPages} · {total} hóa đơn
            {isListFetching && !isListPending ? " · …" : ""}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isListPending}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </Button>
        </div>
      </div>

      {(isListPending || isListFetching) && (
        <p className="text-sm text-slate-500 shrink-0" role="status">
          {isListPending ? "Đang tải danh sách…" : "Đang cập nhật…"}
        </p>
      )}
      {isListError && (
        <p className="text-sm text-red-600 shrink-0" role="alert">
          Không tải được lịch sử hóa đơn (kiểm tra quyền và kết nối).
        </p>
      )}

      <div className="flex-1 min-h-0 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <OrderToolbar
          variant="retailHistory"
          searchStr={search}
          onSearch={setSearch}
          statusFilter="all"
          onStatusChange={() => {}}
          selectedIds={[]}
          onAction={() => {}}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
        />

        <div className="flex-1 overflow-y-auto relative scroll-smooth [scrollbar-gutter:stable] min-h-0">
          <OrderTable
            data={orders}
            selectedIds={[]}
            onSelect={() => {}}
            onSelectAll={() => {}}
            onView={handleView}
            showCheckbox={false}
            hideStatusColumn
          />
        </div>
      </div>

      <OrderDetailDialog
        order={selectedOrder}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        readOnly
        detailLines={detailLines}
      />
    </div>
  )
}
