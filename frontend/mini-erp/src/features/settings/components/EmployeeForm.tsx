import { useEffect, useMemo, useState } from "react"
import { useForm, type UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { User, Mail, Shield, CheckCircle2, UserPlus, Lock, Smartphone, Wand2 } from "lucide-react"
import { toast } from "sonner"
import { ApiRequestError } from "@/lib/api/http"
import { getNextStaffCode, getRoles, roleUiToRoleId, staffFamilyFromUiRole } from "../api/usersApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { Employee } from "../types"
import { cn } from "@/lib/utils"
import { FORM_LABEL_CLASS, FORM_INPUT_CLASS } from "@/lib/data-table-layout"

/** Task078_01 — trim trước khi kiểm tra độ dài (khớp BE). */
const trimmed = z.string().transform((s) => s.trim())

const employeeEditSchema = z.object({
  fullName: trimmed.pipe(z.string().min(1, "Vui lòng nhập họ tên").max(255, "Họ tên tối đa 255 ký tự")),
  employeeCode: trimmed.pipe(z.string().min(1, "Vui lòng nhập mã nhân viên").max(50, "Mã nhân viên tối đa 50 ký tự")),
  email: trimmed.pipe(z.string().email("Email không hợp lệ")),
  phone: trimmed.pipe(z.string().min(1, "Vui lòng nhập số điện thoại").max(20, "Số điện thoại tối đa 20 ký tự")),
  role: z.enum(["Admin", "Staff"]),
  status: z.enum(["Active", "Inactive"]),
})

const employeeCreateSchema = z.object({
  username: trimmed.pipe(
    z.string().min(3, "Tên đăng nhập ít nhất 3 ký tự").max(100, "Tên đăng nhập tối đa 100 ký tự"),
  ),
  password: z.string().min(8, "Mật khẩu ít nhất 8 ký tự").max(128, "Mật khẩu tối đa 128 ký tự"),
  fullName: trimmed.pipe(z.string().min(1, "Vui lòng nhập họ tên").max(255, "Họ tên tối đa 255 ký tự")),
  employeeCode: trimmed.pipe(
    z.string().min(1, "Vui lòng nhập mã nhân viên").max(50, "Mã nhân viên tối đa 50 ký tự"),
  ),
  email: trimmed.pipe(z.string().email("Email không hợp lệ")),
  phone: z.string().max(20, "Số điện thoại tối đa 20 ký tự"),
  role: z.enum(["Admin", "Staff"]),
  status: z.enum(["Active", "Inactive"]),
})

export type EmployeeEditFormData = z.infer<typeof employeeEditSchema>
export type EmployeeCreateFormData = z.infer<typeof employeeCreateSchema>

interface EmployeeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: Employee
  /** Lỗi 400 từ BE (`details` JSON key = field) — Task078_01 */
  serverFieldErrors?: Record<string, string>
  onSubmit: (data: EmployeeEditFormData | EmployeeCreateFormData) => void | Promise<void>
}

function randomEmployeeCode() {
  return `NV${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`
}

export function EmployeeForm({ open, onOpenChange, employee, serverFieldErrors, onSubmit }: EmployeeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fetchingStaffCode, setFetchingStaffCode] = useState(false)
  const [roleOptions, setRoleOptions] = useState<Array<{ label: Employee["role"]; roleId: number }>>([
    { label: "Admin", roleId: 3 },
    { label: "Staff", roleId: 2 },
  ])

  const resolver = useMemo(
    () => zodResolver(employee ? employeeEditSchema : employeeCreateSchema),
    [employee],
  )

  const form = useForm<EmployeeEditFormData | EmployeeCreateFormData>({
    resolver,
    defaultValues: employee
      ? {
          fullName: employee.fullName,
          employeeCode: employee.employeeCode,
          email: employee.email,
          phone: employee.phone,
          role: employee.role,
          status: employee.status,
        }
      : {
          username: "",
          password: "",
          fullName: "",
          employeeCode: randomEmployeeCode(),
          email: "",
          phone: "",
          role: "Staff",
          status: "Active",
        },
  })

  useEffect(() => {
    if (!open) return
    let cancelled = false
    void (async () => {
      try {
        const data = await getRoles()
        const options = data.items
          .filter((r) => r.name === "Admin" || r.name === "Staff")
          .map((r) => ({ label: r.name as Employee["role"], roleId: r.id }))
        if (!cancelled && options.length > 0) {
          setRoleOptions(options)
        }
      } catch {
        // fallback: giữ options mặc định
      }
    })()
    if (employee) {
      form.reset({
        fullName: employee.fullName,
        employeeCode: employee.employeeCode,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        status: employee.status,
      })
    } else {
      form.reset({
        username: "",
        password: "",
        fullName: "",
        employeeCode: randomEmployeeCode(),
        email: "",
        phone: "",
        role: "Staff",
        status: "Active",
      })
    }
    return () => {
      cancelled = true
    }
  }, [open, employee, form])

  useEffect(() => {
    if (!open || !serverFieldErrors) return
    form.clearErrors()
    Object.entries(serverFieldErrors).forEach(([key, message]) => {
      const field =
        key === "staffCode" ? "employeeCode" : key === "roleId" ? "role" : key
      const allowed = new Set([
        ...(employee ? [] : ["username", "password"]),
        "fullName",
        "email",
        "phone",
        "employeeCode",
        "status",
        "role",
      ])
      if (allowed.has(field)) {
        form.setError(field as any, { type: "server", message })
      }
    })
  }, [open, serverFieldErrors, employee, form])

  const createForm = form as UseFormReturn<EmployeeCreateFormData>
  const statusVal = form.watch("status")
  const roleVal = form.watch("role")

  const handleLocalSubmit = async (data: EmployeeEditFormData | EmployeeCreateFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      onOpenChange(false)
    } catch {
      /* Page đã toast; giữ dialog mở */
    } finally {
      setIsSubmitting(false)
    }
  }

  const isCreate = !employee

  const fetchSuggestedStaffCode = async () => {
    if (!isCreate) return
    const role = form.getValues("role") as Employee["role"]
    setFetchingStaffCode(true)
    try {
      const roleId = roleOptions.find((o) => o.label === role)?.roleId ?? roleUiToRoleId(role)
      const data = await getNextStaffCode({
        roleId,
        staffFamily: staffFamilyFromUiRole(role),
      })
      form.setValue("employeeCode", data.nextCode, { shouldValidate: true })
      toast.success("Đã điền mã nhân viên gợi ý từ server")
    } catch (e) {
      if (e instanceof ApiRequestError) {
        toast.error(e.body.message)
      } else {
        toast.error("Không lấy được mã nhân viên")
      }
    } finally {
      setFetchingStaffCode(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden border-slate-200 shadow-2xl rounded-2xl">
        <DialogHeader className="p-8 pb-6 bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center gap-3 text-slate-400 mb-1">
            <UserPlus size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Tài khoản nhân sự</span>
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900">
            {employee ? "Cập nhật hồ sơ nhân viên" : "Thêm mới nhân viên"}
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Thiết lập quyền truy cập và thông tin định danh cho nhân viên.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleLocalSubmit)} className="p-8 space-y-6 bg-white">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            {isCreate && (
              <>
                <div className="space-y-2 col-span-2">
                  <Label className={FORM_LABEL_CLASS}>Tên đăng nhập *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      autoComplete="username"
                      {...createForm.register("username")}
                      className={cn(FORM_INPUT_CLASS, "h-11 pl-10 font-mono")}
                    />
                  </div>
                  {createForm.formState.errors.username && (
                    <p className="text-xs text-red-600">{createForm.formState.errors.username.message}</p>
                  )}
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className={FORM_LABEL_CLASS}>Mật khẩu *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      type="password"
                      autoComplete="new-password"
                      {...createForm.register("password")}
                      className={cn(FORM_INPUT_CLASS, "h-11 pl-10")}
                    />
                  </div>
                  {createForm.formState.errors.password && (
                    <p className="text-xs text-red-600">{createForm.formState.errors.password.message}</p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <Label className={FORM_LABEL_CLASS}>Mã nhân viên *</Label>
                {isCreate && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 shrink-0 text-xs font-medium"
                    disabled={fetchingStaffCode}
                    onClick={() => void fetchSuggestedStaffCode()}
                  >
                    <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                    {fetchingStaffCode ? "Đang lấy…" : "Lấy mã từ server"}
                  </Button>
                )}
              </div>
              <Input {...form.register("employeeCode")} className={cn(FORM_INPUT_CLASS, "h-11 font-mono")} />
              {form.formState.errors.employeeCode && (
                <p className="text-xs text-red-600">{form.formState.errors.employeeCode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className={FORM_LABEL_CLASS}>Trạng thái</Label>
              <Select
                value={statusVal}
                onValueChange={(val) => form.setValue("status", val as EmployeeEditFormData["status"])}
              >
                <SelectTrigger className={cn(FORM_INPUT_CLASS, "h-11 font-bold")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Đang hoạt động</SelectItem>
                  <SelectItem value="Inactive">Tạm ngưng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label className={FORM_LABEL_CLASS}>Họ và tên nhân viên *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input {...form.register("fullName")} className={cn(FORM_INPUT_CLASS, "h-11 pl-10 font-bold")} />
              </div>
              {form.formState.errors.fullName && (
                <p className="text-xs text-red-600">{form.formState.errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className={FORM_LABEL_CLASS}>Vai trò / Quyền hạn *</Label>
              <Select
                value={roleVal}
                onValueChange={(val) => form.setValue("role", val as EmployeeEditFormData["role"])}
              >
                <SelectTrigger className={cn(FORM_INPUT_CLASS, "h-11 font-bold")}>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.some((o) => o.label === "Admin") && (
                    <SelectItem value="Admin">Admin (Toàn quyền)</SelectItem>
                  )}
                  {roleOptions.some((o) => o.label === "Staff") && (
                    <SelectItem value="Staff">Staff (Nhân viên)</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.role && (
                <p className="text-xs text-red-600">{form.formState.errors.role.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className={FORM_LABEL_CLASS}>{isCreate ? "Số điện thoại" : "Số điện thoại *"}</Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input {...form.register("phone")} className={cn(FORM_INPUT_CLASS, "h-11 pl-10 font-mono")} />
              </div>
              {form.formState.errors.phone && (
                <p className="text-xs text-red-600">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2 col-span-2">
              <Label className={FORM_LABEL_CLASS}>Địa chỉ Email (ID đăng nhập) *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input {...form.register("email")} className={cn(FORM_INPUT_CLASS, "h-11 pl-10")} />
              </div>
              {form.formState.errors.email && (
                <p className="text-xs text-red-600">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>
        </form>

        <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 px-6 border-slate-300 font-medium text-slate-600"
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={form.handleSubmit(handleLocalSubmit)}
            className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Lưu nhân viên
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
