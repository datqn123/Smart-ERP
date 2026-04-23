import { useEffect, useState, useRef } from "react"
import { usePageTitle } from "@/context/PageTitleContext"
import { mockCustomers } from "../mockData"
import type { Customer } from "../types"
import { CustomerToolbar } from "../components/CustomerToolbar"
import { CustomerTable } from "../components/CustomerTable"
import { CustomerDetailDialog } from "../components/CustomerDetailDialog"
import { CustomerForm } from "../components/CustomerForm"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { toast } from "sonner"

export function CustomersPage() {
  const { setTitle } = usePageTitle()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [customers, setCustomers] = useState(mockCustomers)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  // State cho xóa
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)
  const [isDeletingBulk, setIsDeletingBulk] = useState(false)

  // State cho Detail & Form
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>()

  useEffect(() => { setTitle("Khách hàng") }, [setTitle])

  const filtered = customers.filter(c => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.customerCode.toLowerCase().includes(search.toLowerCase()) && !c.phone.includes(search) && !(c.email && c.email.toLowerCase().includes(search.toLowerCase()))) return false
    return true
  })

  // Handlers
  const handleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filtered.map(c => c.id) : [])
  }

  const handleToolbarAction = (action: string) => {
    switch (action) {
      case "edit":
        toast.info(`Chỉnh sửa ${selectedIds.length} khách hàng`)
        break;
      case "delete":
        setIsDeletingBulk(true)
        break;
      case "create":
        setEditingCustomer(undefined)
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

  const handleView = (item: Customer) => {
    setSelectedCustomer(item)
    setIsDetailOpen(true)
  }

  const handleEdit = (item: Customer) => {
    setEditingCustomer(item)
    setIsFormOpen(true)
  }

  const handleDelete = (item: Customer) => {
    setDeleteTarget(item)
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      setCustomers(prev => prev.filter(c => c.id !== deleteTarget.id))
      toast.success(`Đã xóa khách hàng: ${deleteTarget.name}`)
      setDeleteTarget(null)
    }
  }

  const confirmBulkDelete = () => {
    setCustomers(prev => prev.filter(c => !selectedIds.includes(c.id)))
    toast.success(`Đã xóa ${selectedIds.length} khách hàng`)
    setSelectedIds([])
    setIsDeletingBulk(false)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col h-full min-h-0 gap-4 md:gap-5 overflow-hidden">
      {/* Header */}
      <div className="shrink-0">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">Khách hàng</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý thông tin khách hàng, điểm tích lũy</p>
      </div>

      {/* Toolbar */}
      <CustomerToolbar 
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
          <CustomerTable 
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
        description={`Bạn có chắc chắn muốn xóa khách hàng "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
      />

      <ConfirmDialog 
        open={isDeletingBulk}
        onOpenChange={setIsDeletingBulk}
        onConfirm={confirmBulkDelete}
        title="Xác nhận xóa nhiều"
        description={`Bạn có chắc chắn muốn xóa ${selectedIds.length} khách hàng đã chọn?`}
      />

      <CustomerDetailDialog 
        customer={selectedCustomer}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      <CustomerForm 
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        customer={editingCustomer}
        onSubmit={(data) => {
            if (editingCustomer) {
                setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...c, ...data } : c))
                toast.success("Cập nhật khách hàng thành công")
            } else {
                const newCustomer: Customer = {
                    id: Math.max(...customers.map(c => c.id)) + 1,
                    customerCode: data.customerCode,
                    name: data.name,
                    phone: data.phone,
                    email: data.email,
                    address: data.address,
                    loyaltyPoints: 0,
                    status: data.status,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
                setCustomers(prev => [newCustomer, ...prev])
                toast.success("Thêm khách hàng thành công")
            }
        }}
      />
    </div>
  )
}
