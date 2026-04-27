import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, Filter, Plus, Loader2, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useOrderStore } from "../store/useOrderStore"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { ApiRequestError } from "@/lib/api/http"
import {
  numUnitPrice,
  POS_PRODUCTS_SEARCH_QUERY_KEY,
  searchPosProducts,
  type PosProductRowDto,
} from "../api/posProductsApi"

const SEARCH_DEBOUNCE_MS = 400
const POS_PAGE_LIMIT = 40

function errToast(e: unknown) {
  if (e instanceof ApiRequestError) {
    toast.error(e.body?.message ?? e.message)
  } else {
    toast.error(e instanceof Error ? e.message : "Đã xảy ra lỗi")
  }
}

export function POSProductSelector() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const addItem = useOrderStore((state) => state.addItem)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [...POS_PRODUCTS_SEARCH_QUERY_KEY, debouncedSearch, POS_PAGE_LIMIT],
    queryFn: () =>
      searchPosProducts({
        search: debouncedSearch.trim() || undefined,
        limit: POS_PAGE_LIMIT,
      }),
    staleTime: 30_000,
  })

  useEffect(() => {
    if (isError) errToast(error)
  }, [isError, error])

  const items: PosProductRowDto[] = data?.items ?? []

  const handleFilterClick = () => {
    toast.info("Lọc nâng cao (danh mục, vị trí kho) sẽ bổ sung theo Task059.")
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val)

  const handleAddProduct = (p: PosProductRowDto) => {
    const unitPrice = numUnitPrice(p.unitPrice)
    if (unitPrice <= 0) {
      toast.error("Sản phẩm chưa có giá bán cho đơn vị này.")
      return
    }
    if (p.availableQty <= 0) {
      toast.error("Hết hàng — không thể thêm vào giỏ.")
      return
    }
    addItem({
      id: Date.now() + Math.floor(Math.random() * 1000),
      productId: p.productId,
      unitId: p.unitId,
      productName: p.productName,
      skuCode: p.skuCode,
      quantity: 1,
      unitName: p.unitName,
      unitPrice,
      lineTotal: unitPrice,
    })
    toast.success(`Đã thêm ${p.productName}`)
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Tìm sản phẩm (Tên, SKU, Barcode)..."
            className="pl-10 h-11 bg-white border-slate-200 text-base focus-visible:ring-1 focus-visible:ring-slate-400 focus-visible:border-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 h-11 w-11 border-slate-200 hover:bg-slate-50"
          type="button"
          onClick={handleFilterClick}
        >
          <Filter className="h-5 w-5 text-slate-600" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[200px]">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            <p className="text-sm">Đang tải sản phẩm…</p>
          </div>
        )}

        {!isLoading && isError && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-4">
            <p className="text-sm text-slate-600">Không tải được danh sách POS.</p>
            <Button variant="outline" size="sm" type="button" onClick={() => void refetch()}>
              Thử lại
            </Button>
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
            <Package className="h-12 w-12 opacity-20" />
            <p className="text-sm">Không có sản phẩm phù hợp.</p>
          </div>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4">
            {items.map((p) => {
              const unitPrice = numUnitPrice(p.unitPrice)
              const outOfStock = p.availableQty <= 0
              const lowStock = !outOfStock && p.availableQty <= 5
              return (
                <Card
                  key={`${p.productId}-${p.unitId}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      if (!outOfStock && unitPrice > 0) handleAddProduct(p)
                    }
                  }}
                  className={`group transition-all duration-300 overflow-hidden flex flex-col border-slate-200 shadow-sm ${
                    outOfStock || unitPrice <= 0
                      ? "opacity-60 cursor-not-allowed"
                      : "cursor-pointer hover:scale-[1.03] hover:shadow-xl"
                  }`}
                  onClick={() => {
                    if (!outOfStock && unitPrice > 0) handleAddProduct(p)
                  }}
                >
                  <div className="aspect-square bg-slate-100 relative">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                        <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm text-[10px] font-bold">
                          {p.skuCode}
                        </Badge>
                      </div>
                    )}
                    {outOfStock && (
                      <Badge variant="destructive" className="absolute top-2 right-2 text-[9px] h-5 px-1.5">
                        Hết hàng
                      </Badge>
                    )}
                    {lowStock && (
                      <Badge variant="destructive" className="absolute top-2 right-2 text-[8px] h-4">
                        Sắp hết
                      </Badge>
                    )}
                  </div>
                  <div className="p-2 flex flex-col flex-1">
                    <h3 className="text-xs font-semibold text-slate-900 line-clamp-2 leading-tight flex-1">
                      {p.productName}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                      {p.unitName} · Tồn: {p.availableQty}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-1">
                      <span className="text-sm font-bold text-slate-900 tabular-nums">
                        {formatCurrency(unitPrice)}
                      </span>
                      {!outOfStock && unitPrice > 0 && (
                        <div className="h-6 w-6 shrink-0 rounded-full bg-slate-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
