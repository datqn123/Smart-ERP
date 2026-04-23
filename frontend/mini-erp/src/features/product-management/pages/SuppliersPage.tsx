import { useEffect, useState, useRef } from "react"
import { usePageTitle } from "@/context/PageTitleContext"
import { mockSuppliers } from "../mockData"
import type { Supplier } from "../types"
import { SupplierToolbar } from "../components/SupplierToolbar"
import { SupplierTable } from "../components/SupplierTable"
import { SupplierDetailDialog } from "../components/SupplierDetailDialog"
import { SupplierForm } from "../components/SupplierForm"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { toast } from "sonner"

export function SuppliersPage() {
  const { setTitle } = usePageTitle()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [suppliers, setSuppliers] = useState(mockSuppliers)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  // State cho xóa
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null)
  const [isDeletingBulk, setIsDeletingBulk] = useState(false)

  // State cho Detail & Form
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>()

  useEffect(() => { setTitle("Nhà cung cấp") }, [setTitle])

  const filtered = suppliers.filter(s => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.supplierCode.toLowerCase().includes(search.toLowerCase()) && !(s.phone && s.phone.includes(search))) return false
    return true
  })

  // Handlers
  const handleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filtered.map(s => s.id) : [])
  }

  const handleToolbarAction = (action: string) => {
    switch (action) {
      case "edit":
        toast.info(`Chỉnh sửa ${selectedIds.length} nhà cung cấp`)
        break;
      case "delete":
        setIsDeletingBulk(true)
        break;
      case "create":
        setEditingSupplier(undefined)
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

  const handleView = (item: Supplier) => {
    setSelectedSupplier(item)
    setIsDetailOpen(true)
  }

  const handleEdit = (item: Supplier) => {
    setEditingSupplier(item)
    setIsFormOpen(true)
  }

  const handleDelete = (item: Supplier) => {
    setDeleteTarget(item)
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      setSuppliers(prev => prev.filter(s => s.id !== deleteTarget.id))
      toast.success(`Đã xóa nhà cung cấp: ${deleteTarget.name}`)
      setDeleteTarget(null)
    }
  }

  const confirmBulkDelete = () => {
    setSuppliers(prev => prev.filter(s => !selectedIds.includes(s.id)))
    toast.success(`Đã xóa ${selectedIds.length} nhà cung cấp`)
    setSelectedIds([])
    setIsDeletingBulk(false)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col h-full min-h-0 gap-4 md:gap-5 overflow-hidden">
      {/* Header */}
      <div className="shrink-0">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">Nhà cung cấp</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý thông tin nhà cung cấp hàng hóa</p>
      </div>

      {/* Toolbar */}
      <SupplierToolbar 
        searchStr={search}
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        selectedIds={selectedIds}
        onAction={handleToolbarAction}
        fileInputRef={fileInputRef}
        onFileChange={handleFileChange}
      />
        
      {/* Data Table */}
      <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-md">
        <div className="flex-1 overflow-y-auto relative scroll-smooth [scrollbar-gutter:stable] min-h-0">
          <SupplierTable 
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
        description={`Bạn có chắc chắn muốn xóa nhà cung cấp "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
      />

      <ConfirmDialog 
        open={isDeletingBulk}
        onOpenChange={setIsDeletingBulk}
        onConfirm={confirmBulkDelete}
        title="Xác nhận xóa nhiều"
        description={`Bạn có chắc chắn muốn xóa ${selectedIds.length} nhà cung cấp đã chọn?`}
      />

      <SupplierDetailDialog 
        supplier={selectedSupplier}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      <SupplierForm 
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        supplier={editingSupplier}
        onSubmit={(data) => {
            if (editingSupplier) {
                setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? { ...s, ...data } : s))
                toast.success("Cập nhật nhà cung cấp thành công")
            } else {
                const newSupplier: Supplier = {
                    id: Math.max(...suppliers.map(s => s.id)) + 1,
                    supplierCode: data.supplierCode,
                    name: data.name,
                    contactPerson: data.contactPerson,
                    phone: data.phone,
                    email: data.email,
                    address: data.address,
                    taxCode: data.taxCode,
                    status: data.status,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
                setSuppliers(prev => [newSupplier, ...prev])
                toast.success("Thêm nhà cung cấp thành công")
            }
        }}
      />
    </div>
  )
}
