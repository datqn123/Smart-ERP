import { useState } from "react"
import { Trash2, Plus, Minus, User, CreditCard, Receipt, Tag, Loader2 } from "lucide-react"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { useOrderStore } from "../store/useOrderStore"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ApiRequestError } from "@/lib/api/http"
import {
  buildRetailCheckoutBody,
  postRetailCheckout,
  postRetailVoucherPreview,
  SALES_ORDER_LIST_QUERY_KEY,
} from "../api/salesOrdersApi"
import { getVoucherById, getVouchersList, VOUCHERS_LIST_QUERY_KEY, type VoucherListItemDto } from "../api/vouchersApi"
import { POS_PRODUCTS_SEARCH_QUERY_KEY } from "../api/posProductsApi"

function numMoney(v: number | string): number {
  const n = typeof v === "number" ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

function checkoutErrorToast(e: unknown) {
  if (e instanceof ApiRequestError) {
    const msg = e.body?.message ?? e.message
    if (e.status === 409) {
      toast.error(msg, {
        description: "Voucher có thể đã hết lượt (xung đột khi thanh toán). Gỡ mã hoặc chọn voucher khác.",
      })
      return
    }
    const d = e.body?.details
    if (d && typeof d === "object") {
      const parts = Object.entries(d).map(([k, v]) => `${k}: ${v}`)
      if (parts.length > 0) {
        toast.error(msg, { description: parts.join(" · ") })
        return
      }
    }
    toast.error(msg)
    return
  }
  toast.error(e instanceof Error ? e.message : "Thanh toán thất bại.")
}

export function POSCartPanel() {
  const queryClient = useQueryClient()
  const {
    cart,
    removeItem,
    updateQuantity,
    getTotal,
    getFinalTotal,
    customerName,
    discount,
    voucherCode,
    clearCart,
    setVoucher,
  } = useOrderStore()
  const [voucherInput, setVoucherInput] = useState("")
  /** Khi chọn từ danh sách — gửi kèm `voucherId` cho preview/checkout khớp BE. */
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(null)

  /** Khi không còn mã — không gửi `voucherId` preview; tránh setState trong effect (eslint). */
  const voucherIdForPreview = voucherCode?.trim() ? selectedVoucherId : null

  const vouchersInfinite = useInfiniteQuery({
    queryKey: [...VOUCHERS_LIST_QUERY_KEY, "retail-panel"],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getVouchersList(pageParam, 5),
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((s, p) => s + p.items.length, 0)
      if (loaded >= lastPage.total) return undefined
      return lastPage.page + 1
    },
  })

  const cartPreviewKey = cart
    .map((i) => `${i.productId}:${i.unitId}:${i.quantity}:${i.unitPrice}`)
    .join("|")

  const previewQuery = useQuery({
    queryKey: [
      "retail-voucher-preview",
      voucherCode,
      voucherIdForPreview,
      cartPreviewKey,
      discount,
    ] as const,
    enabled: Boolean(voucherCode?.trim()) && cart.length > 0,
    queryFn: () => {
      const snap = useOrderStore.getState()
      const code = snap.voucherCode?.trim()
      return postRetailVoucherPreview({
        voucherId: voucherIdForPreview ?? undefined,
        voucherCode: code || undefined,
        lines: snap.cart.map((i) => ({
          productId: i.productId,
          unitId: i.unitId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        discountAmount: snap.discount,
      })
    },
    retry: false,
  })

  const checkoutMutation = useMutation({
    mutationFn: (paymentStatus: "Paid" | "Unpaid" | "Partial") => {
      const snap = useOrderStore.getState()
      const body = buildRetailCheckoutBody({
        cart: snap.cart.map((i) => ({
          productId: i.productId,
          unitId: i.unitId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        customerId: snap.customerId,
        discount: snap.discount,
        voucherCode: snap.voucherCode,
        paymentStatus,
        notes: null,
      })
      return postRetailCheckout(body)
    },
    onSuccess: (data) => {
      clearCart()
      setSelectedVoucherId(null)
      void queryClient.invalidateQueries({ queryKey: [...SALES_ORDER_LIST_QUERY_KEY] })
      void queryClient.invalidateQueries({ queryKey: [...POS_PRODUCTS_SEARCH_QUERY_KEY] })
      void queryClient.invalidateQueries({ queryKey: [...VOUCHERS_LIST_QUERY_KEY] })
      toast.success(`Thanh toán thành công — ${data.orderCode}`)
    },
    onError: checkoutErrorToast,
  })

  const handleApplyVoucher = () => {
    const v = voucherInput.trim()
    if (!v) return
    setSelectedVoucherId(null)
    setVoucher(v)
    setVoucherInput("")
    toast.success("Đã lưu mã — xác nhận khi thanh toán.")
  }

  const handlePickVoucherFromList = async (item: VoucherListItemDto) => {
    try {
      const fresh = await getVoucherById(item.id)
      setVoucher(fresh.code)
      setSelectedVoucherId(fresh.id)
      toast.success(`Đã chọn ${fresh.code}`)
    } catch (err) {
      if (err instanceof ApiRequestError) {
        toast.error(err.body?.message ?? err.message)
        return
      }
      toast.error(err instanceof Error ? err.message : "Không tải được voucher.")
    }
  }

  const runCheckout = (paymentStatus: "Paid" | "Unpaid" | "Partial") => {
    if (cart.length === 0) {
      toast.error("Giỏ hàng trống")
      return
    }
    checkoutMutation.mutate(paymentStatus)
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val)

  const pending = checkoutMutation.isPending
  const voucherRows = vouchersInfinite.data?.pages.flatMap((p) => p.items) ?? []
  const previewData = previewQuery.data
  const previewErr = previewQuery.error
  const preview400 =
    previewErr instanceof ApiRequestError && previewErr.status === 400 ? previewErr.body?.message ?? previewErr.message : null
  const previewApplicable = previewData?.applicable === true
  const displayTotal =
    voucherCode && previewApplicable && previewData
      ? numMoney(previewData.payableAmount)
      : getFinalTotal()

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <User className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-400 leading-none tracking-wider">Khách hàng</p>
              <p className="text-base font-semibold text-slate-900 mt-1">{customerName}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-slate-500 text-sm font-medium hover:text-slate-900">
            Thay đổi
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Receipt className="h-16 w-16 opacity-10" />
            <p className="text-base">Giỏ hàng đang trống</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={`${item.productId}-${item.unitId}`} className="group relative">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-6">
                  <h4 className="text-base font-semibold text-slate-900 line-clamp-2 leading-tight">{item.productName}</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    {item.skuCode}
                    {item.unitName ? ` · ${item.unitName}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => removeItem(item.productId, item.unitId)}
                  className="p-1.5 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 rounded-md disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden h-9 bg-white shadow-sm">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => updateQuantity(item.productId, item.unitId, item.quantity - 1)}
                    className="px-3 hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="w-12 text-center text-base font-bold text-slate-900 border-x border-slate-200">
                    {item.quantity}
                  </div>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => updateQuantity(item.productId, item.unitId, item.quantity + 1)}
                    className="px-3 hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-base font-bold text-slate-900">{formatCurrency(item.lineTotal)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 space-y-2">
        <div>
          <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Voucher áp dụng được</p>
          {vouchersInfinite.isLoading ? (
            <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Đang tải danh sách…
            </div>
          ) : vouchersInfinite.isError ? (
            <p className="text-xs text-red-600">
              {vouchersInfinite.error instanceof ApiRequestError
                ? vouchersInfinite.error.body?.message ?? vouchersInfinite.error.message
                : "Không tải được danh sách voucher."}
            </p>
          ) : (
            <>
              <ul className="max-h-28 overflow-y-auto space-y-1 pr-0.5">
                {voucherRows.map((row) => (
                  <li key={row.id}>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => void handlePickVoucherFromList(row)}
                      className="w-full text-left rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs hover:bg-slate-100 disabled:opacity-50 transition-colors"
                    >
                      <span className="font-semibold text-slate-900">{row.code}</span>
                      {row.name ? <span className="text-slate-500 ml-1 truncate">{row.name}</span> : null}
                    </button>
                  </li>
                ))}
              </ul>
              {vouchersInfinite.hasNextPage ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-8 text-xs text-slate-600 w-full"
                  disabled={pending || vouchersInfinite.isFetchingNextPage}
                  onClick={() => void vouchersInfinite.fetchNextPage()}
                >
                  {vouchersInfinite.isFetchingNextPage ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      Đang tải…
                    </>
                  ) : (
                    "Xem thêm"
                  )}
                </Button>
              ) : null}
            </>
          )}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Mã voucher..."
              className="pl-9 h-10 text-sm bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-400"
              value={voucherInput}
              disabled={pending}
              onChange={(e) => setVoucherInput(e.target.value)}
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            type="button"
            className="h-10 px-4 bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold"
            disabled={pending}
            onClick={handleApplyVoucher}
          >
            Áp dụng
          </Button>
        </div>
        {voucherCode && (
          <div className="mt-2 flex items-center justify-between text-xs gap-2">
            <div className="min-w-0">
              <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold py-1 max-w-full truncate">
                {voucherCode}
              </Badge>
              {previewQuery.isFetching ? (
                <p className="text-slate-500 mt-1 inline-flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Đang ước tính voucher…
                </p>
              ) : preview400 ? (
                <p className="text-red-600 mt-1">{preview400}</p>
              ) : previewData && !previewApplicable ? (
                <p className="text-amber-700 mt-1">{previewData.message ?? "Voucher không áp dụng cho giỏ này."}</p>
              ) : previewApplicable && previewData ? (
                <p className="text-slate-600 mt-1">
                  {previewData.message?.trim() ? `${previewData.message} · ` : null}
                  Giảm voucher: {formatCurrency(numMoney(previewData.voucherDiscountAmount))} — còn thanh toán{" "}
                  <span className="font-semibold">{formatCurrency(numMoney(previewData.payableAmount))}</span>
                </p>
              ) : (
                <p className="text-slate-500 mt-1">Giảm giá theo mã do hệ thống tính khi thanh toán.</p>
              )}
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setSelectedVoucherId(null)
                setVoucher(null)
              }}
              className="text-red-500 hover:underline font-medium shrink-0"
            >
              Gỡ bỏ
            </button>
          </div>
        )}
      </div>

      <div className="px-4 pt-3 pb-3 bg-slate-900 text-white shadow-[0_-10px_20px_rgba(0,0,0,0.1)] shrink-0">
        <div className="space-y-1.5">
          <div className="flex justify-between text-slate-400 text-xs font-medium">
            <span>Tạm tính ({cart.length} món)</span>
            <span>{formatCurrency(getTotal())}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-amber-200 text-xs font-medium">
              <span>Giảm giá</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}
          {voucherCode && (
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Mã voucher</span>
              <span className="truncate max-w-[55%] text-right">{voucherCode}</span>
            </div>
          )}
          <Separator className="bg-slate-800 my-1" />
          <div className="flex justify-between items-baseline gap-2">
            <span className="text-xs font-bold text-slate-400 shrink-0">Tổng cộng (ước tính)</span>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white text-right inline-flex items-center justify-end gap-1.5 min-w-0">
              {voucherCode && previewQuery.isFetching ? <Loader2 className="h-5 w-5 animate-spin text-slate-400 shrink-0" /> : null}
              <span className="tabular-nums break-all">{formatCurrency(displayTotal)}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <Button
            type="button"
            variant="outline"
            disabled={pending || cart.length === 0}
            className="bg-transparent border-slate-700 text-white hover:bg-slate-800 h-10 min-h-11 px-2 text-xs sm:text-sm inline-flex items-center justify-center gap-1.5"
            onClick={() => runCheckout("Unpaid")}
          >
            {pending && checkoutMutation.variables === "Unpaid" ? (
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            ) : (
              <CreditCard className="h-3.5 w-3.5 shrink-0" />
            )}
            <span className="text-center leading-tight">Thẻ/Chuyển khoản</span>
          </Button>
          <Button
            type="button"
            disabled={pending || cart.length === 0}
            className="bg-white text-slate-900 hover:bg-slate-100 h-10 min-h-11 px-2 text-xs sm:text-sm font-bold uppercase tracking-wide inline-flex items-center justify-center gap-1.5"
            onClick={() => runCheckout("Paid")}
          >
            {pending && checkoutMutation.variables === "Paid" ? (
              <Loader2 className="h-4 w-4 animate-spin shrink-0 text-slate-900" />
            ) : null}
            Tiền mặt
          </Button>
        </div>
      </div>
    </div>
  )
}
