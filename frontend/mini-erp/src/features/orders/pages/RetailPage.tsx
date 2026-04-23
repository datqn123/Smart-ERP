import { useEffect } from "react"
import { usePageTitle } from "@/context/PageTitleContext"
import { POSProductSelector } from "../components/POSProductSelector"
import { POSCartPanel } from "../components/POSCartPanel"

export function RetailPage() {
  const { setTitle } = usePageTitle()

  useEffect(() => {
    setTitle("Bán lẻ (POS)")
  }, [setTitle])

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] overflow-hidden bg-slate-50">
      {/* Header Info - Desktop only quick shortcuts */}
      <div className="hidden lg:flex shrink-0 items-center justify-between px-6 py-3 bg-white border-b border-slate-200">
        <div className="flex gap-6">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-400 uppercase leading-none tracking-wider">Nhân viên</span>
            <span className="text-base font-semibold text-slate-700 mt-1">Nguyễn Văn A</span>
          </div>
          <div className="h-10 w-[1px] bg-slate-200" />
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-400 uppercase leading-none tracking-wider">Phiên làm việc</span>
            <span className="text-base font-semibold text-slate-700 mt-1">#SHIFT-0418</span>
          </div>
        </div>
        <div className="flex gap-3">
          <kbd className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm font-mono font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-100">F2: Tìm khách</kbd>
          <kbd className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm font-mono font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-100">F8: Mã vạch</kbd>
          <kbd className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm font-mono font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-100">F12: Thanh toán</kbd>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 min-h-0">
        {/* Left Side: Product Selection */}
        <div className="lg:col-span-8 flex flex-col p-4 lg:p-6 min-h-0">
          <POSProductSelector />
        </div>

        {/* Right Side: Cart Summary */}
        <div className="lg:col-span-4 flex flex-col p-4 bg-slate-100/50 border-l border-slate-200 min-h-0">
          <POSCartPanel />
        </div>
      </div>
    </div>
  )
}
