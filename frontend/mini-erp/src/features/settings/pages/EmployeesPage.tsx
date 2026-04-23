import { useEffect, useState } from "react"
import { usePageTitle } from "@/context/PageTitleContext"
import type { Employee } from "../types"
import { EmployeeTable } from "../components/EmployeeTable"
import { EmployeeToolbar } from "../components/EmployeeToolbar"
import { EmployeeDetailDialog } from "../components/EmployeeDetailDialog"
import { EmployeeForm } from "../components/EmployeeForm"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { toast } from "sonner"

const mockEmployees: Employee[] = [
  { id: 1, employeeCode: "NV001", fullName: "Nguyễn Văn A", email: "vana@minierp.com", phone: "0987654321", role: "Admin", status: "Active", joinedDate: "2023-01-01" },
  { id: 2, employeeCode: "NV002", fullName: "Trần Thị B", email: "thib@minierp.com", phone: "0912345678", role: "Manager", status: "Active", joinedDate: "2023-02-15" },
  { id: 3, employeeCode: "NV003", fullName: "Lê Văn C", email: "vanc@minierp.com", phone: "0900112233", role: "Warehouse", status: "Active", joinedDate: "2023-03-20" },
  { id: 4, employeeCode: "NV004", fullName: "Phạm Minh D", email: "minhd@minierp.com", phone: "0988776655", role: "Staff", status: "Inactive", joinedDate: "2023-05-10" },
]

export function EmployeesPage() {
  const { setTitle } = usePageTitle()
  
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  // Selection/Confirm states
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null)
  const [isDeletingBulk, setIsDeletingBulk] = useState(false)

  // Detail & Form states
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>()

  useEffect(() => {
    setTitle("Quản Lý Nhân Viên")
  }, [setTitle])

  const filtered = employees.filter(e => {
    if (roleFilter !== "all" && e.role !== roleFilter) return false
    if (search && !e.fullName.toLowerCase().includes(search.toLowerCase()) && !e.employeeCode.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Handlers
  const handleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filtered.map(e => e.id) : [])
  }

  const handleToolbarAction = (action: string) => {
    if (action === "delete") {
      setIsDeletingBulk(true)
    } else if (action === "create") {
      setEditingEmployee(undefined)
      setIsFormOpen(true)
    }
  }

  const handleView = (item: Employee) => {
    setSelectedEmployee(item)
    setIsDetailOpen(true)
  }
  const handleEdit = (item: Employee) => {
    setEditingEmployee(item)
    setIsFormOpen(true)
  }
  const handleDelete = (item: Employee) => setDeleteTarget(item)

  const confirmDelete = () => {
    if (deleteTarget) {
      setEmployees(prev => prev.filter(e => e.id !== deleteTarget.id))
      toast.success(`Đã xóa nhân viên: ${deleteTarget.fullName}`)
      setDeleteTarget(null)
    }
  }

  const confirmBulkDelete = () => {
    setEmployees(prev => prev.filter(e => !selectedIds.includes(e.id)))
    toast.success(`Đã xóa ${selectedIds.length} nhân viên`)
    setSelectedIds([])
    setIsDeletingBulk(false)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col h-full min-h-0 gap-4 md:gap-5 overflow-hidden">
      {/* Header */}
      <div className="shrink-0">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">Quản lý nhân viên</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý tài khoản, quyền hạn và trạng thái làm việc</p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 gap-4 md:gap-5">
        <EmployeeToolbar 
          searchStr={search}
          onSearch={setSearch}
          roleFilter={roleFilter}
          onRoleChange={setRoleFilter}
          selectedIds={selectedIds}
          onAction={handleToolbarAction}
        />
        
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-md">
          <EmployeeTable 
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

      {/* Confirmations */}
      <ConfirmDialog 
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        description={`Bạn có chắc muốn xóa nhân viên "${deleteTarget?.fullName}" khỏi hệ thống?`}
      />

      <ConfirmDialog 
        open={isDeletingBulk}
        onOpenChange={setIsDeletingBulk}
        onConfirm={confirmBulkDelete}
        title="Xác nhận xóa nhiều"
        description={`Bạn có chắc chắn muốn xóa ${selectedIds.length} nhân viên đã chọn?`}
      />

      <EmployeeDetailDialog 
        employee={selectedEmployee}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      <EmployeeForm 
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        employee={editingEmployee}
        onSubmit={(data) => {
            if (editingEmployee) {
                setEmployees(prev => prev.map(e => e.id === editingEmployee.id ? { ...e, ...data } : e))
                toast.success("Cập nhật nhân viên thành công")
            } else {
                const newEmployee: Employee = {
                    id: Math.max(...employees.map(e => e.id)) + 1,
                    ...data,
                    joinedDate: new Date().toISOString().split('T')[0]
                }
                setEmployees(prev => [newEmployee, ...prev])
                toast.success("Thêm nhân viên thành công")
            }
        }}
      />
    </div>
  )
}
