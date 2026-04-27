import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { usePageTitle } from "@/context/PageTitleContext"
import { ApiRequestError } from "@/lib/api/http"
import type { Order } from "../types"
import { OrderToolbar } from "../components/OrderToolbar"
import { OrderTable } from "../components/OrderTable"
import { OrderDetailDialog } from "../components/OrderDetailDialog"
import { ReturnFormDialog } from "../components/ReturnFormDialog"
import { SalesOrderCancelDialog } from "../components/SalesOrderCancelDialog"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useSalesOrdersListQuery } from "../hooks/useSalesOrdersListQuery"
import {
  postCancelSalesOrder,
  postSalesOrder,
  SALES_ORDER_LIST_QUERY_KEY,
  SALES_ORDER_LIST_SORT_WHITELIST,
  type SalesOrderCreateBody,
  type SalesOrderListSort,
} from "../api/salesOrdersApi"

export function ReturnsPage() {
  const { setTitle } = usePageTitle()
  const queryClient = useQueryClient()

  const {
    orders,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    paymentStatusFilter,
    setPaymentStatusFilter,
    page,
    setPage,
    sort,
    setSort,
    selectedIds,
    setSelectedIds,
    isListPending,
    isListFetching,
    isListError,
    total,
    totalPages,
  } = useSalesOrdersListQuery({ orderChannel: "Return" })

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [cancelOrderTarget, setCancelOrderTarget] = useState<Order | null>(null)

  useEffect(() => {
    setTitle("Trả hàng")
  }, [setTitle])

  const handleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? orders.map((o) => o.id) : [])
  }

  const handleToolbarAction = (action: string) => {
    switch (action) {
      case "edit":
        if (selectedIds.length === 1) {
          const order = orders.find((o) => o.id === selectedIds[0])
          if (order) {
            setSelectedOrder(order)
            setIsFormOpen(true)
          }
        } else {
          toast.info("Vui lòng chọn duy nhất 1 phiếu trả hàng để chỉnh sửa")
        }
        break
      case "delete":
        if (selectedIds.length === 1) {
          const o = orders.find((x) => x.id === selectedIds[0])
          if (o) {
            setCancelOrderTarget(o)
          }
        } else {
          toast.info("Chọn đúng một phiếu trả để hủy (Task058).")
        }
        break
      case "create":
        setSelectedOrder(null)
        setIsFormOpen(true)
        break
      case "export":
        toast.info("Đang xuất dữ liệu Excel...")
        break
    }
  }

  const handleView = (item: Order) => {
    setSelectedOrder(item)
    setIsDetailOpen(true)
  }

  const handleEdit = (item: Order) => {
    setSelectedOrder(item)
    setIsFormOpen(true)
  }

  const handleDelete = (item: Order) => {
    setCancelOrderTarget(item)
  }

  const handleCancelOrderConfirm = async (reason: string) => {
    const o = cancelOrderTarget
    if (!o) return
    const wasAlreadyCancelled = o.status === "Cancelled"
    try {
      await postCancelSalesOrder(o.id, reason ? { reason } : {})
      await queryClient.invalidateQueries({ queryKey: [...SALES_ORDER_LIST_QUERY_KEY] })
      if (wasAlreadyCancelled) {
        toast.info("Phiếu đã ở trạng thái hủy (OQ-5 — 200 idempotent).")
      } else {
        toast.success("Đã hủy phiếu trả hàng.")
      }
      setSelectedIds((prev) => prev.filter((id) => id !== o.id))
      setCancelOrderTarget(null)
    } catch (e) {
      if (e instanceof ApiRequestError && e.status === 409) {
        toast.error(
          e.body?.message ??
            "Không thể hủy — đã có phiếu xuất hoặc đã giao từ kho (OQ-6).",
        )
        throw e
      }
      if (e instanceof ApiRequestError) {
        toast.error(e.body?.message ?? e.message)
        throw e
      }
      toast.error(e instanceof Error ? e.message : "Không hủy được phiếu")
      throw e
    }
  }

  const handleCreateReturn = async (body: SalesOrderCreateBody) => {
    try {
      const created = await postSalesOrder(body)
      await queryClient.invalidateQueries({ queryKey: [...SALES_ORDER_LIST_QUERY_KEY] })
      toast.success(`Đã tạo phiếu trả ${created.orderCode}`)
      setIsFormOpen(false)
    } catch (e) {
      if (e instanceof ApiRequestError) {
        toast.error(e.body?.message ?? e.message)
        return
      }
      toast.error(e instanceof Error ? e.message : "Không tạo được phiếu trả")
    }
  }

  const handleSave = async () => {
    if (selectedOrder) {
      toast.info("Cập nhật phiếu trả qua API PATCH — chưa nối trong phiên này.")
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 h-full flex flex-col">
      <div className="shrink-0 text-left">
        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">Trả hàng</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Quản lý và xử lý các yêu cầu trả hàng từ khách hàng</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0 text-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 whitespace-nowrap">Sắp xếp</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SalesOrderListSort)}
            className="h-9 px-2 border border-slate-200 bg-white rounded-md text-slate-900 min-w-[200px]"
          >
            {SALES_ORDER_LIST_SORT_WHITELIST.map((s) => (
              <option key={s} value={s}>
                {s}
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
            Trang {page}/{totalPages} · {total} phiếu
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
          Không tải được danh sách phiếu trả (kiểm tra quyền và kết nối).
        </p>
      )}

      <div className="flex-1 min-h-0 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-white shrink-0">
          <OrderToolbar
            searchStr={search}
            onSearch={setSearch}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            paymentStatusFilter={paymentStatusFilter}
            onPaymentStatusChange={setPaymentStatusFilter}
            selectedIds={selectedIds}
            onAction={handleToolbarAction}
          />
        </div>

        <div className="flex-1 overflow-y-auto relative scroll-smooth [scrollbar-gutter:stable] min-h-0">
          <OrderTable
            data={orders}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <OrderDetailDialog
        order={selectedOrder}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onCancelOrder={(o) => {
          setCancelOrderTarget(o)
          setIsDetailOpen(false)
        }}
        onEditOrder={(o) => {
          setSelectedOrder(o)
          setIsFormOpen(true)
        }}
      />

      <SalesOrderCancelDialog
        order={cancelOrderTarget}
        open={cancelOrderTarget != null}
        onOpenChange={(open) => {
          if (!open) {
            setCancelOrderTarget(null)
          }
        }}
        onConfirm={handleCancelOrderConfirm}
      />

      <ReturnFormDialog
        order={selectedOrder}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        onCreateReturn={handleCreateReturn}
      />
    </div>
  )
}
