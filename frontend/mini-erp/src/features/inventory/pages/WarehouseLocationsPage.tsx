import { useEffect, useState } from "react"
import { usePageTitle } from "@/context/PageTitleContext"
import type { WarehouseLocation } from "../location-types"
import { LocationTable } from "../components/LocationTable"
import { LocationToolbar } from "../components/LocationToolbar"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { toast } from "sonner"

const mockLocations: WarehouseLocation[] = [
  { id: 1, locationCode: "A-01-01", area: "Khu vực A", shelf: "Kệ 01, Ô 01", capacity: 100, currentStock: 25, status: "Active", description: "Vị trí hàng dễ vỡ" },
  { id: 2, locationCode: "A-01-02", area: "Khu vực A", shelf: "Kệ 01, Ô 02", capacity: 100, currentStock: 95, status: "Full", description: "" },
  { id: 3, locationCode: "B-05-10", area: "Khu vực B", shelf: "Kệ 05, Ô 10", capacity: 500, currentStock: 0, status: "Active", description: "Hàng cồng kềnh" },
  { id: 4, locationCode: "C-01-01", area: "Khu vực C", shelf: "PCCC", capacity: 10, currentStock: 2, status: "Inactive", description: "Khu vực đang sửa chữa" },
]

export function WarehouseLocationsPage() {
  const { setTitle } = usePageTitle()
  
  const [locations, setLocations] = useState<WarehouseLocation[]>(mockLocations)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const [deleteTarget, setDeleteTarget] = useState<WarehouseLocation | null>(null)
  const [isDeletingBulk, setIsDeletingBulk] = useState(false)

  useEffect(() => {
    setTitle("Sơ đồ kho / Vị trí")
  }, [setTitle])

  const filtered = locations.filter(l => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false
    if (search && !l.locationCode.toLowerCase().includes(search.toLowerCase()) && !l.area.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filtered.map(l => l.id) : [])
  }

  const handleToolbarAction = (action: string) => {
    if (action === "delete") setIsDeletingBulk(true)
    else if (action === "create") toast.info("Mở form thêm vị trí mới")
  }

  const handleView = (item: WarehouseLocation) => toast.info(`Xem vị trí: ${item.locationCode}`)
  const handleEdit = (item: WarehouseLocation) => toast.info(`Chỉnh sửa vị trí: ${item.locationCode}`)
  const handleDelete = (item: WarehouseLocation) => setDeleteTarget(item)

  const confirmDelete = () => {
    if (deleteTarget) {
      setLocations(prev => prev.filter(l => l.id !== deleteTarget.id))
      toast.success(`Đã xóa vị trí: ${deleteTarget.locationCode}`)
      setDeleteTarget(null)
    }
  }

  const confirmBulkDelete = () => {
    setLocations(prev => prev.filter(l => !selectedIds.includes(l.id)))
    toast.success(`Đã xóa ${selectedIds.length} vị trí`)
    setSelectedIds([])
    setIsDeletingBulk(false)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 h-full flex flex-col">
      <div className="shrink-0 flex justify-between items-end">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">Sơ đồ kho & Vị trí</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý không gian kho và định vị hàng hóa</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 md:gap-5">
        <LocationToolbar 
          searchStr={search}
          onSearch={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          selectedIds={selectedIds}
          onAction={handleToolbarAction}
        />
        
        <LocationTable 
          data={filtered}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <ConfirmDialog 
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        description={`Bạn có chắc muốn xóa vị trí "${deleteTarget?.locationCode}"? Dữ liệu hàng hóa tại đây sẽ bị ảnh hưởng.`}
      />

      <ConfirmDialog 
        open={isDeletingBulk}
        onOpenChange={setIsDeletingBulk}
        onConfirm={confirmBulkDelete}
        title="Xác nhận xóa nhiều"
        description={`Bạn có chắc chắn muốn xóa ${selectedIds.length} vị trí đã chọn?`}
      />
    </div>
  )
}
