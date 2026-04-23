import { useEffect, useState } from "react"
import { usePageTitle } from "@/context/PageTitleContext"
import { mockOrders } from "../mockData"
import type { Order } from "../types"
import { OrderToolbar } from "../components/OrderToolbar"
import { OrderTable } from "../components/OrderTable"
import { OrderDetailDialog } from "../components/OrderDetailDialog"
import { ReturnFormDialog } from "../components/ReturnFormDialog"
import { toast } from "sonner"

export function ReturnsPage() {
  const { setTitle } = usePageTitle()
  
  const [orders, setOrders] = useState<Order[]>(mockOrders.filter(o => o.type === "Return"))
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => { setTitle("Trả hàng") }, [setTitle])

  const filtered = orders.filter(o => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false
    if (search && !o.customerName.toLowerCase().includes(search.toLowerCase()) && !o.orderCode.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Handlers
  const handleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filtered.map(o => o.id) : [])
  }

  const handleToolbarAction = (action: string) => {
    switch (action) {
      case "edit":
        if (selectedIds.length === 1) {
            const order = orders.find(o => o.id === selectedIds[0])
            if (order) {
                setSelectedOrder(order)
                setIsFormOpen(true)
            }
        } else {
            toast.info(`Vui lòng chọn duy nhất 1 phiếu trả hàng để chỉnh sửa`)
        }
        break;
      case "delete":
        toast.success(`Đã xóa ${selectedIds.length} phiếu trả hàng`)
        setSelectedIds([])
        break;
      case "create":
        setSelectedOrder(null)
        setIsFormOpen(true)
        break;
      case "export":
        toast.info("Đang xuất dữ liệu Excel...")
        break;
    }
  }

  const handleView = (item: Order) => {
    setSelectedOrder(item)
    setIsDetailOpen(true)
  }

  const handleEdit = (item: Order) => {
    setSelectedOrder(item)
    setIsFormOpen(true)
  }

  const handleDelete = (item: Order) => {
    toast.error(`Yêu cầu xóa phiếu trả: ${item.orderCode}`)
  }

  const handleSave = (data: any) => {
    if (selectedOrder) {
        toast.success(`Đã cập nhật phiếu trả hàng ${data.orderCode}`)
    } else {
        toast.success(`Đã tạo mới phiếu trả hàng ${data.orderCode}`)
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="shrink-0 text-left">
        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">Trả hàng</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Quản lý và xử lý các yêu cầu trả hàng từ khách hàng</p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-white shrink-0">
          <OrderToolbar 
            searchStr={search}
            onSearch={setSearch}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            selectedIds={selectedIds}
            onAction={handleToolbarAction}
          />
        </div>
        
        {/* Data Table */}
        <div className="flex-1 overflow-y-auto relative scroll-smooth [scrollbar-gutter:stable] min-h-0">
          <OrderTable 
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

      <OrderDetailDialog 
        order={selectedOrder}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      <ReturnFormDialog 
        order={selectedOrder}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}
