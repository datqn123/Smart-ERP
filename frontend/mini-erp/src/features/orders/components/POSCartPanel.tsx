import { useState } from "react"
import { Trash2, Plus, Minus, User, CreditCard, Receipt, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOrderStore } from "../store/useOrderStore"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export function POSCartPanel() {
  const { cart, removeItem, updateQuantity, getTotal, getFinalTotal, customerName, clearCart, setVoucher, voucherCode } = useOrderStore()
  const [voucherInput, setVoucherInput] = useState("")

  const handleApplyVoucher = () => {
    if (!voucherInput) return
    if (voucherInput === "DISCOUNT10") {
      setVoucher(voucherInput)
      toast.success("Đã áp dụng mã giảm giá 10%")
      setVoucherInput("")
    } else {
      toast.error("Mã giảm giá không hợp lệ")
    }
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Giỏ hàng trống")
      return
    }
    toast.success("Thanh toán thành công!")
    clearCart()
  }

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Customer Header */}
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

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Receipt className="h-16 w-16 opacity-10" />
            <p className="text-base">Giỏ hàng đang trống</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.productId} className="group relative">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-6">
                  <h4 className="text-base font-semibold text-slate-900 line-clamp-2 leading-tight">{item.productName}</h4>
                  <p className="text-sm text-slate-500 mt-1">{item.skuCode}</p>
                </div>
                <button 
                  onClick={() => removeItem(item.productId)}
                  className="p-1.5 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 rounded-md"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden h-9 bg-white shadow-sm">
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="px-3 hover:bg-slate-50 text-slate-600 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="w-12 text-center text-base font-bold text-slate-900 border-x border-slate-200">
                    {item.quantity}
                  </div>
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="px-3 hover:bg-slate-50 text-slate-600 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-base font-bold text-slate-900">
                  {formatCurrency(item.lineTotal)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Voucher Section */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Mã voucher..." 
              className="pl-9 h-10 text-sm bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-400"
              value={voucherInput}
              onChange={(e) => setVoucherInput(e.target.value)}
            />
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            className="h-10 px-4 bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold"
            onClick={handleApplyVoucher}
          >
            Áp dụng
          </Button>
        </div>
        {voucherCode && (
          <div className="mt-2 flex items-center justify-between text-xs">
            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold py-1">
              {voucherCode} (-10%)
            </Badge>
            <button 
              onClick={() => setVoucher(null)}
              className="text-red-500 hover:underline font-medium"
            >
              Gỡ bỏ
            </button>
          </div>
        )}
      </div>

      {/* Summary & Checkout */}
      <div className="p-4 bg-slate-900 text-white shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
        <div className="space-y-3">
          <div className="flex justify-between text-slate-400 text-sm font-medium">
            <span>Tạm tính ({cart.length} món)</span>
            <span>{formatCurrency(getTotal())}</span>
          </div>
          {voucherCode && (
            <div className="flex justify-between text-green-400 text-sm font-bold">
              <span>Voucher (10%)</span>
              <span>-{formatCurrency(getTotal() * 0.1)}</span>
            </div>
          )}
          <Separator className="bg-slate-800" />
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-slate-300">Tổng cộng</span>
            <span className="text-3xl font-black tracking-tighter text-white">{formatCurrency(getFinalTotal())}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-6">
          <Button variant="outline" className="bg-transparent border-slate-700 text-white hover:bg-slate-800 h-12">
            <CreditCard className="mr-2 h-4 w-4" />
            Thẻ/Chuyển khoản
          </Button>
          <Button onClick={handleCheckout} className="bg-white text-slate-900 hover:bg-slate-100 h-12 font-bold uppercase tracking-wide">
            Tiền mặt (F12)
          </Button>
        </div>
      </div>
    </div>
  )
}
