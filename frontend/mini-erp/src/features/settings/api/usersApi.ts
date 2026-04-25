import { apiJson } from "@/lib/api/http"
import type { Employee } from "../types"

/** Task078 — response `data` (Task077 shape, camelCase). */
export type UserResponseData = {
  id: number
  employeeCode: string
  fullName: string
  email: string
  phone: string | null
  roleId: number
  role: string
  status: string
  joinedDate: string | null
  avatar?: string | null
}

export type UserCreateBody = {
  username: string
  password: string
  fullName: string
  email: string
  phone?: string
  staffCode?: string
  roleId: number
  status?: "Active" | "Inactive"
}

/** Giá trị form tạo mới — khớp field gửi `POST /api/v1/users` (Task078). */
export type EmployeeCreateFormInput = {
  username: string
  password: string
  fullName: string
  employeeCode: string
  email: string
  phone: string
  role: Employee["role"]
  status: Employee["status"]
}

export function buildUserCreateBody(values: EmployeeCreateFormInput): UserCreateBody {
  const phone = values.phone.trim()
  return {
    username: values.username.trim(),
    password: values.password,
    fullName: values.fullName.trim(),
    email: values.email.trim(),
    ...(phone ? { phone } : {}),
    ...(values.employeeCode.trim() ? { staffCode: values.employeeCode.trim() } : {}),
    roleId: roleUiToRoleId(values.role),
    status: values.status,
  }
}

/**
 * Seed `Roles` (V1 baseline): 1 Owner, 2 Staff, 3 Admin — không có Manager/Warehouse;
 * map UI tạm thời để form vẫn dùng 4 nhãn (đồng bộ sau khi có API roles / migration đủ role).
 */
/** Khớp query `staffFamily` — Task078_02 (prefix theo dòng form). */
export function staffFamilyFromUiRole(role: Employee["role"]): "ADMIN" | "MANAGER" | "WAREHOUSE" | "STAFF" {
  switch (role) {
    case "Admin":
      return "ADMIN"
    case "Manager":
      return "MANAGER"
    case "Warehouse":
      return "WAREHOUSE"
    case "Staff":
      return "STAFF"
    default:
      return "STAFF"
  }
}

export type NextStaffCodeData = {
  nextCode: string
  prefix: string
  roleId: number
  staffFamily?: string | null
}

/** Task078_02 — Bearer; GET. */
export function getNextStaffCode(params: { roleId: number; staffFamily?: string }) {
  const q = new URLSearchParams({ roleId: String(params.roleId) })
  if (params.staffFamily) {
    q.set("staffFamily", params.staffFamily)
  }
  return apiJson<NextStaffCodeData>(`/api/v1/users/next-staff-code?${q.toString()}`, {
    method: "GET",
    auth: true,
  })
}

export function roleUiToRoleId(role: Employee["role"]): number {
  switch (role) {
    case "Admin":
      return 3
    case "Staff":
      return 2
    case "Manager":
      return 3
    case "Warehouse":
      return 2
    default:
      return 2
  }
}

export function userResponseToEmployee(u: UserResponseData): Employee {
  const roleLabel = u.role
  const role: Employee["role"] =
    roleLabel === "Admin"
      ? "Admin"
      : roleLabel === "Staff"
        ? "Staff"
        : roleLabel === "Owner"
          ? "Admin"
          : "Staff"

  return {
    id: u.id,
    employeeCode: u.employeeCode,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone ?? "",
    role,
    status: u.status === "Active" ? "Active" : "Inactive",
    joinedDate: u.joinedDate ?? new Date().toISOString().slice(0, 10),
    avatar: u.avatar ?? undefined,
  }
}

/** Task078 — Bearer; HTTP 201 + envelope success/data. */
export function postCreateUser(body: UserCreateBody) {
  return apiJson<UserResponseData>("/api/v1/users", {
    method: "POST",
    body: JSON.stringify(body),
    auth: true,
  })
}
