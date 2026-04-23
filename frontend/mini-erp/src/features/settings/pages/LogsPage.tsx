import { useEffect, useState } from "react"
import { usePageTitle } from "@/context/PageTitleContext"
import type { SystemLog } from "../log-types"
import { LogTable } from "../components/LogTable"
import { LogToolbar } from "../components/LogToolbar"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { toast } from "sonner"

const mockLogs: SystemLog[] = [
  { id: 1, timestamp: "2024-03-20 10:30:15", user: "Nguyễn Văn A", action: "Create", module: "Products", description: "Tạo mới sản phẩm: iPhone 15 Pro Max", severity: "Info", ipAddress: "192.168.1.1" },
  { id: 2, timestamp: "2024-03-20 10:35:20", user: "Admin", action: "Delete", module: "Security", description: "Xóa quyền truy cập của NV004", severity: "Warning", ipAddress: "192.168.1.2" },
  { id: 3, timestamp: "2024-03-20 11:00:05", user: "Lê Văn C", action: "Update", module: "Inventory", description: "Cập nhật tồn kho tại A-01-02", severity: "Info", ipAddress: "192.168.1.3" },
  { id: 4, timestamp: "2024-03-20 11:15:45", user: "System", action: "Error", module: "Database", description: "Lỗi kết nối database (Timeout)", severity: "Error", ipAddress: "127.0.0.1" },
]

export function LogsPage() {
  const { setTitle } = usePageTitle()
  
  const [logs, setLogs] = useState<SystemLog[]>(mockLogs)
  const [search, setSearch] = useState("")
  const [moduleFilter, setModuleFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const [deleteTarget, setDeleteTarget] = useState<SystemLog | null>(null)
  const [isDeletingBulk, setIsDeletingBulk] = useState(false)

  useEffect(() => {
    setTitle("Nhật ký hệ thống")
  }, [setTitle])

  const filtered = logs.filter(l => {
    if (moduleFilter !== "all" && l.module !== moduleFilter) return false
    if (search && !l.description.toLowerCase().includes(search.toLowerCase()) && !l.user.toLowerCase().includes(search.toLowerCase())) return false
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
    else if (action === "export") toast.info("Đang xuất nhật ký hệ thống...")
  }

  const handleView = (item: SystemLog) => toast.info(`Xem chi tiết log #${item.id}`)
  const handleDelete = (item: SystemLog) => setDeleteTarget(item)

  const confirmDelete = () => {
    if (deleteTarget) {
      setLogs(prev => prev.filter(l => l.id !== deleteTarget.id))
      toast.success(`Đã xóa bản ghi nhật ký`)
      setDeleteTarget(null)
    }
  }

  const confirmBulkDelete = () => {
    setLogs(prev => prev.filter(l => !selectedIds.includes(l.id)))
    toast.success(`Đã xóa ${selectedIds.length} bản ghi nhật ký`)
    setSelectedIds([])
    setIsDeletingBulk(false)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 h-full flex flex-col">
      <div className="shrink-0">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">Nhật ký hệ thống</h1>
        <p className="text-sm text-slate-500 mt-1">Theo dõi hoạt động của người dùng và các sự kiện hệ thống</p>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <LogToolbar 
          searchStr={search}
          onSearch={setSearch}
          moduleFilter={moduleFilter}
          onModuleChange={setModuleFilter}
          selectedIds={selectedIds}
          onAction={handleToolbarAction}
        />
        
        <LogTable 
          data={filtered}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          onView={handleView}
          onDelete={handleDelete}
        />
      </div>

      <ConfirmDialog 
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa log"
        description="Bạn có chắc muốn xóa bản ghi nhật ký này? Hành động này có thể ảnh hưởng đến việc hậu kiểm."
      />

      <ConfirmDialog 
        open={isDeletingBulk}
        onOpenChange={setIsDeletingBulk}
        onConfirm={confirmBulkDelete}
        title="Xác nhận xóa nhiều log"
        description={`Bạn có chắc chắn muốn xóa ${selectedIds.length} bản ghi nhật ký đã chọn?`}
      />
    </div>
  )
}
