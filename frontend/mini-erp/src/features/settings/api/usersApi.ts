import { apiJson } from "@/lib/api/http"
import type { Employee } from "../types"

export type RoleItemData = {
  id: number
  name: string
  permissions: Record<string, boolean>
}

export type RolesListData = {
  items: RoleItemData[]
}

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

/** Task077 — response `data` (page). */
export type UsersListPageData = {
  items: UserResponseData[]
  page: number
  limit: number
  total: number
}

/** Task079 — response `data` (detail). */
export type UserDetailData = UserResponseData & {
  username?: string | null
  lastLogin?: string | null
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

export type UserPatchBody = Partial<Omit<UserCreateBody, "username" | "password">> & {
  password?: string
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

/** Task076 — Bearer; GET roles (dropdown). */
export function getRoles() {
  return apiJson<RolesListData>("/api/v1/roles", { method: "GET", auth: true })
}

/** Task077 — Bearer; GET list. */
export function getUsersList(query: {
  search?: string
  status?: "all" | "Active" | "Inactive"
  roleId?: number
  page?: number
  limit?: number
}) {
  const q = new URLSearchParams()
  if (query.search?.trim()) q.set("search", query.search.trim())
  if (query.status) q.set("status", query.status)
  if (query.roleId) q.set("roleId", String(query.roleId))
  q.set("page", String(query.page ?? 1))
  q.set("limit", String(query.limit ?? 20))
  return apiJson<UsersListPageData>(`/api/v1/users?${q.toString()}`, { method: "GET", auth: true })
}

/** Task079 — Bearer; GET by id (detail). */
export function getUserById(userId: number) {
  return apiJson<UserDetailData>(`/api/v1/users/${userId}`, { method: "GET", auth: true })
}

/** Khớp query `staffFamily` — Task078_02 (prefix theo dòng form). */
export function staffFamilyFromUiRole(role: Employee["role"]): "ADMIN" | "STAFF" {
  switch (role) {
    case "Admin":
      return "ADMIN"
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

/** Task080 — Bearer; PATCH partial. */
export function patchUser(userId: number, body: UserPatchBody) {
  return apiJson<UserDetailData>(`/api/v1/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    auth: true,
  })
}

/** Task081 — Bearer; DELETE (soft lock), success 204 no body. */
export function deleteUser(userId: number) {
  return apiJson<void>(`/api/v1/users/${userId}`, { method: "DELETE", auth: true })
}
