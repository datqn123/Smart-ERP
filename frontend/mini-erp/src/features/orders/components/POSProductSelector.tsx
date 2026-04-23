import { useState } from "react"
import { Search, Filter, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockInventory } from "@/features/inventory/mockData"
import { useOrderStore } from "../store/useOrderStore"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

export function POSProductSelector() {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tất cả")
  const addItem = useOrderStore(state => state.addItem)

  const filteredProducts = mockInventory.filter(p => 
    p.productName.toLowerCase().includes(search.toLowerCase()) ||
    p.skuCode.toLowerCase().includes(search.toLowerCase())
  )

  const handleFilterClick = () => {
    toast.info("Đang mở bộ lọc nâng cao...")
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Search & Filter Header */}
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
          onClick={handleFilterClick}
        >
          <Filter className="h-5 w-5 text-slate-600" />
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {["Tất cả", "Thực phẩm", "Đồ uống", "Hóa phẩm", "Gia dụng"].map((cat) => (
          <Button 
            key={cat} 
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-5 h-9 text-sm font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat 
                ? "bg-slate-900 text-white hover:bg-slate-800" 
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4">
          {filteredProducts.map((p) => (
            <Card 
              key={p.id}
              className="group cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl overflow-hidden flex flex-col border-slate-200 shadow-sm"
              onClick={() => addItem({
                id: Math.random(),
                productId: p.productId,
                productName: p.productName,
                skuCode: p.skuCode,
                quantity: 1,
                unitName: p.unitName,
                unitPrice: p.costPrice * 1.2,
                lineTotal: p.costPrice * 1.2
              })}
            >
              <div className="aspect-square bg-slate-100 relative">
                {/* Fallback pattern/icon if no image */}
                <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                  <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm text-[10px] font-bold">
                    {p.skuCode}
                  </Badge>
                </div>
                {p.quantity <= p.minQuantity && (
                  <Badge variant="destructive" className="absolute top-2 right-2 text-[8px] h-4">Sắp hết</Badge>
                )}
              </div>
              <div className="p-2 flex flex-col flex-1">
                <h3 className="text-xs font-semibold text-slate-900 line-clamp-2 leading-tight flex-1">
                  {p.productName}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.costPrice * 1.2)}
                  </span>
                  <div className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
