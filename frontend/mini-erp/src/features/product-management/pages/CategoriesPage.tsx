import { useEffect, useState } from "react"
import { usePageTitle } from "@/context/PageTitleContext"
import { mockCategories } from "../mockData"
import type { Category } from "../types"
import { CategoryToolbar } from "../components/CategoryToolbar"
import { CategoryTable } from "../components/CategoryTable"
import { CategoryForm } from "../components/CategoryForm"
import { CategoryDetailDialog } from "../components/CategoryDetailDialog"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { toast } from "sonner"

// Helper to flatten categories for select all
function flattenCategories(categories: Category[]): Category[] {
  let result: Category[] = [];
  categories.forEach(c => {
    result.push(c);
    if (c.children) {
      result = result.concat(flattenCategories(c.children));
    }
  });
  return result;
}

export function CategoriesPage() {
  const { setTitle } = usePageTitle()
  
  const [categories, setCategories] = useState(mockCategories)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  // State cho xóa
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [isDeletingBulk, setIsDeletingBulk] = useState(false)

  // State cho Form
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | undefined>()
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null)

  useEffect(() => { setTitle("Danh mục sản phẩm") }, [setTitle])

  // Filter both parent and children simply here for demonstration
  const filtered = categories.filter(c => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.categoryCode.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Handlers
  const handleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleSelectAll = (checked: boolean) => {
    const flat = flattenCategories(filtered);
    setSelectedIds(checked ? flat.map(c => c.id) : [])
  }

  const handleToolbarAction = (action: string) => {
    switch (action) {
      case "delete":
        setIsDeletingBulk(true)
        break;
      case "create":
        setEditingCategory(undefined)
        setIsFormOpen(true)
        break;
    }
  }

  const handleView = (item: Category) => {
    setViewingCategory(item)
  }

  const handleEdit = (item: Category) => {
    setEditingCategory(item)
    setIsFormOpen(true)
  }

  const handleAddSub = (parent: Category) => {
    setEditingCategory({ 
        parentId: parent.id,
        parentName: parent.name,
        categoryCode: `SUB-${parent.categoryCode}`,
        status: "Active",
        sortOrder: 0,
        name: ""
    } as any)
    setIsFormOpen(true)
  }

  const handleDelete = (item: Category) => {
    setDeleteTarget(item)
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      // Recursive delete helper if needed, but here we just filter top level
      setCategories(prev => prev.filter(c => c.id !== deleteTarget.id))
      toast.success(`Đã xóa danh mục: ${deleteTarget.name}`)
      setDeleteTarget(null)
    }
  }

  const confirmBulkDelete = () => {
    setCategories(prev => prev.filter(c => !selectedIds.includes(c.id)))
    toast.success(`Đã xóa ${selectedIds.length} danh mục`)
    setSelectedIds([])
    setIsDeletingBulk(false)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col h-full min-h-0 gap-4 md:gap-5 overflow-hidden">
      {/* Header */}
      <div className="shrink-0">
        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">Danh mục sản phẩm</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Phân loại sản phẩm theo cấu trúc cây phân cấp</p>
      </div>

      {/* Toolbar */}
      <CategoryToolbar 
        searchStr={search}
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        selectedIds={selectedIds}
        onAction={handleToolbarAction}
      />
        
      {/* Data Table */}
      <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-md">
        <div className="flex-1 overflow-y-auto relative scroll-smooth [scrollbar-gutter:stable] min-h-0">
          <CategoryTable 
            data={filtered}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddSub={handleAddSub}
          />
        </div>
      </div>

      {/* Detail Dialog */}
      <CategoryDetailDialog 
        category={viewingCategory}
        isOpen={!!viewingCategory}
        onClose={() => setViewingCategory(null)}
      />

      {/* Confirm Deletion */}
      <ConfirmDialog 
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        description={`Bạn có chắc chắn muốn xóa danh mục "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
      />

      <ConfirmDialog 
        open={isDeletingBulk}
        onOpenChange={setIsDeletingBulk}
        onConfirm={confirmBulkDelete}
        title="Xác nhận xóa nhiều"
        description={`Bạn có chắc chắn muốn xóa ${selectedIds.length} danh mục đã chọn?`}
      />

      <CategoryForm 
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        category={editingCategory}
        allCategories={categories}
        onSubmit={(data) => {
            const parentName = data.parentId ? categories.find(c => c.id === data.parentId)?.name : undefined
            if (editingCategory) {
                setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...data, parentName } : c))
                toast.success("Cập nhật danh mục thành công")
            } else {
                const newCategory: Category = {
                    id: Math.max(...categories.map(c => c.id)) + 1,
                    categoryCode: data.categoryCode,
                    name: data.name,
                    parentId: data.parentId || undefined,
                    parentName,
                    sortOrder: data.sortOrder,
                    status: data.status,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
                setCategories(prev => [newCategory, ...prev])
                toast.success("Thêm danh mục thành công")
            }
        }}
      />
    </div>
  )
}
