import { useEffect, useState, useRef } from "react"
import { usePageTitle } from "@/context/PageTitleContext"
import { mockProducts } from "../mockData"
import type { Product } from "../types"
import { ProductToolbar } from "../components/ProductToolbar"
import { ProductTable } from "../components/ProductTable"
import { ProductDetailDialog } from "../components/ProductDetailDialog"
import { ProductForm } from "../components/ProductForm"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { mockCategories } from "../mockData"
import { toast } from "sonner"

export function ProductsPage() {
  const { setTitle } = usePageTitle()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [products, setProducts] = useState(mockProducts)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  // State cho xóa
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [isDeletingBulk, setIsDeletingBulk] = useState(false)

  // State cho Detail & Form
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>()

  useEffect(() => { setTitle("Quản lý sản phẩm") }, [setTitle])

  const categories = Array.from(new Set(products.map(p => p.categoryName).filter((c): c is string => Boolean(c))))

  const filtered = products.filter(p => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false
    if (categoryFilter !== "all" && p.categoryName !== categoryFilter) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.skuCode.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Handlers
  const handleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filtered.map(p => p.id) : [])
  }

  const handleToolbarAction = (action: string) => {
    switch (action) {
      case "edit":
        toast.info(`Chỉnh sửa ${selectedIds.length} sản phẩm`)
        break;
      case "delete":
        setIsDeletingBulk(true)
        break;
      case "create":
        setEditingProduct(undefined)
        setIsFormOpen(true)
        break;
      case "export":
        toast.info("Đang xuất dữ liệu Excel...")
        break;
      case "import":
        fileInputRef.current?.click()
        break;
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) toast.success(`Đã chọn: ${file.name}. Đang xử lý import...`)
  }

  const handleView = (item: Product) => {
    setSelectedProduct(item)
    setIsDetailOpen(true)
  }

  const handleEdit = (item: Product) => {
    setEditingProduct(item)
    setIsFormOpen(true)
  }

  const handleDelete = (item: Product) => {
    setDeleteTarget(item)
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      setProducts(prev => prev.filter(p => p.id !== deleteTarget.id))
      toast.success(`Đã xóa sản phẩm: ${deleteTarget.name}`)
      setDeleteTarget(null)
    }
  }

  const confirmBulkDelete = () => {
    setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)))
    toast.success(`Đã xóa ${selectedIds.length} sản phẩm`)
    setSelectedIds([])
    setIsDeletingBulk(false)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col h-full min-h-0 gap-4 md:gap-5 overflow-hidden">
      {/* Header */}
      <div className="shrink-0">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">Quản lý sản phẩm</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý danh sách sản phẩm, SKU, giá cả</p>
      </div>

      {/* Toolbar */}
      <ProductToolbar 
        searchStr={search}
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categories={categories}
        selectedIds={selectedIds}
        onAction={handleToolbarAction}
        fileInputRef={fileInputRef}
        onFileChange={handleFileChange}
      />
        
      {/* Data Table */}
      <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-md">
        <div className="flex-1 overflow-y-auto relative scroll-smooth [scrollbar-gutter:stable] min-h-0">
          <ProductTable 
            data={filtered}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Confirm Deletion */}
      <ConfirmDialog 
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        description={`Bạn có chắc chắn muốn xóa sản phẩm "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
      />

      <ConfirmDialog 
        open={isDeletingBulk}
        onOpenChange={setIsDeletingBulk}
        onConfirm={confirmBulkDelete}
        title="Xác nhận xóa nhiều"
        description={`Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn?`}
      />

      <ProductDetailDialog 
        product={selectedProduct}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      <ProductForm 
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        product={editingProduct}
        categories={mockCategories}
        onSubmit={(data) => {
            const categoryName = mockCategories.find(c => c.id === data.categoryId)?.name
            if (editingProduct) {
                setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...data, categoryName } : p))
                toast.success("Cập nhật sản phẩm thành công")
            } else {
                const newProduct: Product = {
                    id: Math.max(...products.map(p => p.id)) + 1,
                    skuCode: data.skuCode,
                    name: data.name,
                    categoryId: data.categoryId,
                    categoryName,
                    barcode: data.barcode,
                    currentPrice: data.currentPrice,
                    weight: data.weight,
                    status: data.status,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
                setProducts(prev => [newProduct, ...prev])
                toast.success("Thêm sản phẩm thành công")
            }
        }}
      />
    </div>
  )
}
