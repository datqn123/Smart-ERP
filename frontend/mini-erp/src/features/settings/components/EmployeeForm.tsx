import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { User, Mail, Shield, CheckCircle2, UserPlus, Lock, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { Employee } from "../types"
import { cn } from "@/lib/utils"
import {
  FORM_LABEL_CLASS,
  FORM_INPUT_CLASS,
} from "@/lib/data-table-layout"

const employeeSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ tên"),
  employeeCode: z.string().min(1, "Vui lòng nhập mã nhân viên"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(1, "Vui lòng nhập số điện thoại"),
  role: z.enum(["Admin", "Manager", "Warehouse", "Staff"]),
  status: z.enum(["Active", "Inactive"]),
})

type EmployeeFormData = z.infer<typeof employeeSchema>

interface EmployeeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: Employee
  onSubmit: (data: EmployeeFormData) => void
}

export function EmployeeForm({ open, onOpenChange, employee, onSubmit }: EmployeeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee ? {
      fullName: employee.fullName,
      employeeCode: employee.employeeCode,
      email: employee.email,
      phone: employee.phone,
      role: employee.role as any,
      status: employee.status,
    } : {
      fullName: "",
      employeeCode: `NV${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      email: "",
      phone: "",
      role: "Staff",
      status: "Active",
    }
  })

  const handleLocalSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
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
             <div className="space-y-2">
                <Label className={FORM_LABEL_CLASS}>Mã nhân viên *</Label>
                <Input 
                  {...form.register("employeeCode")} 
                  className={cn(FORM_INPUT_CLASS, "h-11 font-mono")}
                />
             </div>

             <div className="space-y-2">
                <Label className={FORM_LABEL_CLASS}>Trạng thái</Label>
                <Select 
                  defaultValue={form.getValues("status")}
                  onValueChange={(val) => form.setValue("status", val as any)}
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
                    <Input 
                        {...form.register("fullName")} 
                        className={cn(FORM_INPUT_CLASS, "h-11 pl-10 font-bold")} 
                    />
                </div>
             </div>

             <div className="space-y-2">
                <Label className={FORM_LABEL_CLASS}>Vai trò / Quyền hạn *</Label>
                <Select 
                  defaultValue={form.getValues("role")}
                  onValueChange={(val) => form.setValue("role", val as any)}
                >
                  <SelectTrigger className={cn(FORM_INPUT_CLASS, "h-11 font-bold")}>
                    <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin (Toàn quyền)</SelectItem>
                    <SelectItem value="Manager">Manager (Quản lý)</SelectItem>
                    <SelectItem value="Warehouse">Warehouse (Kho)</SelectItem>
                    <SelectItem value="Staff">Staff (Nhân viên)</SelectItem>
                  </SelectContent>
                </Select>
             </div>

             <div className="space-y-2">
                <Label className={FORM_LABEL_CLASS}>Số điện thoại *</Label>
                <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input 
                        {...form.register("phone")} 
                        className={cn(FORM_INPUT_CLASS, "h-11 pl-10 font-mono")}
                    />
                </div>
             </div>

             <div className="space-y-2 col-span-2">
                <Label className={FORM_LABEL_CLASS}>Địa chỉ Email (ID đăng nhập) *</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input 
                        {...form.register("email")} 
                        className={cn(FORM_INPUT_CLASS, "h-11 pl-10")}
                    />
                </div>
             </div>
             
             {!employee && (
                 <div className="col-span-2 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                    <Lock className="text-amber-500 shrink-0 mt-0.5" size={16} />
                    <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                        Khi thêm nhân viên mới, mật khẩu mặc định được thiết lập là <strong>123456</strong>. Nhân viên nên thực hiện đổi mật khẩu ngay trong lần đầu đăng nhập.
                    </p>
                 </div>
             )}
          </div>
        </form>

        <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-11 px-6 border-slate-300 font-medium text-slate-600">
            Hủy bỏ
          </Button>
          <Button type="submit" disabled={isSubmitting} onClick={form.handleSubmit(handleLocalSubmit)} className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Lưu nhân viên
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
