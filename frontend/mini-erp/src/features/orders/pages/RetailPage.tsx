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
      {/* Header Info — một dòng để nhường chiều cao cho lưới sản phẩm */}
      <div className="hidden lg:flex shrink-0 items-baseline gap-2 px-6 py-2 bg-white border-b border-slate-200">
        <span className="text-[11px] font-bold text-slate-400 uppercase leading-none tracking-wider">Nhân viên</span>
        <span className="text-sm font-semibold text-slate-700 leading-none">Nguyễn Văn A</span>
      </div>

      {/* Main Grid */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 min-h-0">
        {/* Left Side: Product Selection */}
        <div className="lg:col-span-8 flex flex-col px-4 pb-4 pt-3 lg:px-6 lg:pb-6 lg:pt-4 min-h-0">
          <POSProductSelector />
        </div>

        {/* Right Side: Cart Summary */}
        <div className="lg:col-span-4 flex flex-col px-4 pb-4 pt-3 lg:pt-4 bg-slate-100/50 border-l border-slate-200 min-h-0">
          <POSCartPanel />
        </div>
      </div>
    </div>
  )
}
