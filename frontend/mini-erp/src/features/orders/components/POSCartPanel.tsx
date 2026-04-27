import { useState } from "react"
import { Trash2, Plus, Minus, User, CreditCard, Receipt, Tag, Loader2 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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
  SALES_ORDER_LIST_QUERY_KEY,
} from "../api/salesOrdersApi"
import { POS_PRODUCTS_SEARCH_QUERY_KEY } from "../api/posProductsApi"

function checkoutErrorToast(e: unknown) {
  if (e instanceof ApiRequestError) {
    const msg = e.body?.message ?? e.message
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
      void queryClient.invalidateQueries({ queryKey: [...SALES_ORDER_LIST_QUERY_KEY] })
      void queryClient.invalidateQueries({ queryKey: [...POS_PRODUCTS_SEARCH_QUERY_KEY] })
      toast.success(`Thanh toán thành công — ${data.orderCode}`)
    },
    onError: checkoutErrorToast,
  })

  const handleApplyVoucher = () => {
    const v = voucherInput.trim()
    if (!v) return
    setVoucher(v)
    setVoucherInput("")
    toast.success("Đã lưu mã — xác nhận khi thanh toán.")
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

      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
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
              <p className="text-slate-500 mt-1">Giảm giá theo mã do hệ thống tính khi thanh toán.</p>
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={() => setVoucher(null)}
              className="text-red-500 hover:underline font-medium shrink-0"
            >
              Gỡ bỏ
            </button>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-900 text-white shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
        <div className="space-y-3">
          <div className="flex justify-between text-slate-400 text-sm font-medium">
            <span>Tạm tính ({cart.length} món)</span>
            <span>{formatCurrency(getTotal())}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-amber-200 text-sm font-medium">
              <span>Giảm giá</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}
          {voucherCode && (
            <div className="flex justify-between text-slate-400 text-xs">
              <span>Mã voucher</span>
              <span className="truncate max-w-[55%] text-right">{voucherCode}</span>
            </div>
          )}
          <Separator className="bg-slate-800" />
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-slate-300">Tổng cộng (ước tính)</span>
            <span className="text-3xl font-black tracking-tighter text-white">{formatCurrency(getFinalTotal())}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-6">
          <Button
            type="button"
            variant="outline"
            disabled={pending || cart.length === 0}
            className="bg-transparent border-slate-700 text-white hover:bg-slate-800 h-12 inline-flex items-center justify-center gap-2"
            onClick={() => runCheckout("Unpaid")}
          >
            {pending && checkoutMutation.variables === "Unpaid" ? (
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            ) : (
              <CreditCard className="h-4 w-4 shrink-0" />
            )}
            Thẻ/Chuyển khoản
          </Button>
          <Button
            type="button"
            disabled={pending || cart.length === 0}
            className="bg-white text-slate-900 hover:bg-slate-100 h-12 font-bold uppercase tracking-wide inline-flex items-center justify-center gap-2"
            onClick={() => runCheckout("Paid")}
          >
            {pending && checkoutMutation.variables === "Paid" ? (
              <Loader2 className="h-4 w-4 animate-spin shrink-0 text-slate-900" />
            ) : null}
            Tiền mặt (F12)
          </Button>
        </div>
      </div>
    </div>
  )
}
