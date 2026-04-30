import { useEffect, useState } from "react"
import { usePageTitle } from "@/context/PageTitleContext"
import type { Employee } from "../types"
import { EmployeeTable } from "../components/EmployeeTable"
import { EmployeeToolbar } from "../components/EmployeeToolbar"
import { EmployeeDetailDialog } from "../components/EmployeeDetailDialog"
import {
  EmployeeForm,
  type EmployeeCreateFormData,
  type EmployeeEditFormData,
} from "../components/EmployeeForm"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { toast } from "sonner"
import { ApiRequestError } from "@/lib/api/http"
import {
  buildUserCreateBody,
  deleteUser,
  getUsersList,
  patchUser,
  postCreateUser,
  roleUiToRoleId,
  userResponseToEmployee,
} from "../api/usersApi"

const mockEmployees: Employee[] = [
  { id: 1, employeeCode: "NV001", fullName: "Nguyễn Văn A", email: "vana@minierp.com", phone: "0987654321", role: "Admin", status: "Active", joinedDate: "2023-01-01" },
  { id: 2, employeeCode: "NV002", fullName: "Trần Thị B", email: "thib@minierp.com", phone: "0912345678", role: "Staff", status: "Active", joinedDate: "2023-02-15" },
  { id: 3, employeeCode: "NV003", fullName: "Lê Văn C", email: "vanc@minierp.com", phone: "0900112233", role: "Staff", status: "Active", joinedDate: "2023-03-20" },
  { id: 4, employeeCode: "NV004", fullName: "Phạm Minh D", email: "minhd@minierp.com", phone: "0988776655", role: "Staff", status: "Inactive", joinedDate: "2023-05-10" },
]

export function EmployeesPage() {
  const { setTitle } = usePageTitle()
  
  const [employees, setEmployees] = useState<Employee[]>([])
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [loadingList, setLoadingList] = useState(false)

  // Selection/Confirm states
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null)
  const [isDeletingBulk, setIsDeletingBulk] = useState(false)

  // Detail & Form states
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>()
  const [createServerFieldErrors, setCreateServerFieldErrors] = useState<Record<string, string> | undefined>()
  const [editServerFieldErrors, setEditServerFieldErrors] = useState<Record<string, string> | undefined>()

  useEffect(() => {
    setTitle("Quản Lý Nhân Viên")
  }, [setTitle])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoadingList(true)
      try {
        const roleId =
          roleFilter === "Admin" ? 3 : roleFilter === "Staff" ? 2 : undefined
        const data = await getUsersList({
          search,
          status: "all",
          roleId,
          page: 1,
          limit: 20,
        })
        if (cancelled) return
        setEmployees(data.items.map(userResponseToEmployee))
      } catch (e) {
        if (cancelled) return
        if (e instanceof ApiRequestError) {
          toast.error(e.body.message)
        } else {
          toast.error("Không thể tải danh sách nhân viên")
          // fallback dev: vẫn hiển thị mock để UI không trống
          setEmployees(mockEmployees)
        }
      } finally {
        if (!cancelled) setLoadingList(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [search, roleFilter])

  const refetchUsersList = async () => {
    const roleId = roleFilter === "Admin" ? 3 : roleFilter === "Staff" ? 2 : undefined
    const data = await getUsersList({ search, status: "all", roleId, page: 1, limit: 20 })
    setEmployees(data.items.map(userResponseToEmployee))
  }

  const filtered = employees

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
      setCreateServerFieldErrors(undefined)
      setIsFormOpen(true)
    }
  }

  const handleView = (item: Employee) => {
    setSelectedEmployee(item)
    setIsDetailOpen(true)
  }
  const handleEdit = (item: Employee) => {
    setCreateServerFieldErrors(undefined)
    setEditServerFieldErrors(undefined)
    setEditingEmployee(item)
    setIsFormOpen(true)
  }
  const handleDelete = (item: Employee) => setDeleteTarget(item)

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteUser(deleteTarget.id)
      toast.success(`Đã vô hiệu hóa nhân viên: ${deleteTarget.fullName}`)
      await refetchUsersList()
      setDeleteTarget(null)
    } catch (e) {
      if (e instanceof ApiRequestError) {
        toast.error(e.body.message)
      } else {
        toast.error("Không thể vô hiệu hóa nhân viên")
      }
      throw e
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
          {loadingList && (
            <div className="px-4 py-3 text-sm text-slate-500 border-b border-slate-200/60 bg-slate-50/40">
              Đang tải danh sách nhân viên…
            </div>
          )}
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
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) {
            setCreateServerFieldErrors(undefined)
            setEditServerFieldErrors(undefined)
          }
        }}
        employee={editingEmployee}
        serverFieldErrors={editingEmployee ? editServerFieldErrors : createServerFieldErrors}
        onSubmit={async (data) => {
          if (editingEmployee) {
            const d = data as EmployeeEditFormData
            try {
              setEditServerFieldErrors(undefined)
              const updated = await patchUser(editingEmployee.id, {
                fullName: d.fullName,
                staffCode: d.employeeCode,
                email: d.email,
                phone: d.phone,
                status: d.status,
                roleId: roleUiToRoleId(d.role),
              })
              setEmployees((prev) =>
                prev.map((e) => (e.id === editingEmployee.id ? userResponseToEmployee(updated) : e)),
              )
              toast.success("Cập nhật nhân viên thành công")
              return
            } catch (e) {
              if (e instanceof ApiRequestError) {
                toast.error(e.body.message)
                if ((e.status === 400 || e.status === 409) && e.body.details) {
                  setEditServerFieldErrors(e.body.details)
                }
              } else {
                toast.error("Không thể cập nhật nhân viên")
              }
              throw e
            }
          }
          const d = data as EmployeeCreateFormData
          try {
            setCreateServerFieldErrors(undefined)
            const created = await postCreateUser(buildUserCreateBody(d))
            setEmployees((prev) => [userResponseToEmployee(created), ...prev])
            toast.success("Thêm nhân viên thành công")
          } catch (e) {
            if (e instanceof ApiRequestError) {
              toast.error(e.body.message)
              if (e.status === 400 && e.body.details) {
                setCreateServerFieldErrors(e.body.details)
              }
            } else {
              toast.error("Không thể tạo nhân viên")
            }
            throw e /* tín hiệu để form không đóng dialog */
          }
        }}
      />
    </div>
  )
}
