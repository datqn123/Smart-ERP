import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Save, X, User, Phone, Mail, MapPin, CheckCircle2, UserPlus } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { FORM_LABEL_CLASS, FORM_INPUT_CLASS } from "@/lib/data-table-layout"
import type { Customer } from "../types"

const customerSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên khách hàng"),
  customerCode: z.string().min(1, "Vui lòng nhập mã khách hàng"),
  phone: z.string().min(1, "Vui lòng nhập số điện thoại"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  address: z.string().optional(),
  status: z.enum(["Active", "Inactive"]),
})

type CustomerFormData = z.infer<typeof customerSchema>

interface CustomerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer
  onSubmit: (data: CustomerFormData) => void
}

export function CustomerForm({ open, onOpenChange, customer, onSubmit }: CustomerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer ? {
      name: customer.name,
      customerCode: customer.customerCode,
      phone: customer.phone,
      email: customer.email || "",
      address: customer.address || "",
      status: customer.status,
    } : {
      name: "",
      customerCode: `KH${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`,
      phone: "",
      email: "",
      address: "",
      status: "Active",
    }
  })

  const handleLocalSubmit = async (data: CustomerFormData) => {
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
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-slate-200 shadow-2xl rounded-2xl">
        <DialogHeader className="p-8 pb-6 bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center gap-3 text-slate-400 mb-1">
            <UserPlus size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Hồ sơ khách hàng</span>
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900">
            {customer ? "Cập nhật thông tin khách hàng" : "Thêm mới khách hàng"}
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Quản lý thông tin liên hệ và hạng thành viên của khách hàng.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleLocalSubmit)} className="p-8 space-y-6 bg-white">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
             <div className="space-y-2">
                <Label className={FORM_LABEL_CLASS}>Mã khách hàng *</Label>
                <Input 
                  {...form.register("customerCode")} 
                  className={cn(FORM_INPUT_CLASS, "font-mono")}
                  placeholder="KH00001"
                />
                {form.formState.errors.customerCode && <p className="text-xs text-red-500">{form.formState.errors.customerCode.message}</p>}
             </div>

             <div className="space-y-2">
                <Label className={FORM_LABEL_CLASS}>Trạng thái</Label>
                <Select 
                  defaultValue={form.getValues("status")}
                  onValueChange={(val) => form.setValue("status", val as any)}
                >
                  <SelectTrigger className={FORM_INPUT_CLASS}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Đang hoạt động</SelectItem>
                    <SelectItem value="Inactive">Tạm ngưng</SelectItem>
                  </SelectContent>
                </Select>
             </div>

             <div className="space-y-2 col-span-2">
                <Label className={FORM_LABEL_CLASS}>Tên khách hàng *</Label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input 
                        {...form.register("name")} 
                        className={cn(FORM_INPUT_CLASS, "pl-10 font-semibold text-slate-900")} 
                        placeholder="Nguyễn Văn A"
                    />
                </div>
                {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
             </div>

             <div className="space-y-2">
                <Label className={FORM_LABEL_CLASS}>Số điện thoại *</Label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input 
                        {...form.register("phone")} 
                        className={cn(FORM_INPUT_CLASS, "pl-10")}
                        placeholder="09xxx..."
                    />
                </div>
                {form.formState.errors.phone && <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>}
             </div>

             <div className="space-y-2">
                <Label className={FORM_LABEL_CLASS}>Email</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input 
                        {...form.register("email")} 
                        className={cn(FORM_INPUT_CLASS, "pl-10")}
                        placeholder="example@mail.com"
                    />
                </div>
                {form.formState.errors.email && <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>}
             </div>

             <div className="space-y-2 col-span-2">
                <Label className={FORM_LABEL_CLASS}>Địa chỉ</Label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
                    <Input 
                        {...form.register("address")} 
                        className={cn(FORM_INPUT_CLASS, "h-20 pl-10 flex items-start pt-2")}
                        placeholder="Số nhà, đường, phường/xã..."
                    />
                </div>
             </div>
          </div>
        </form>

        <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-11 px-6 border-slate-300 font-medium text-slate-600">
            Hủy bỏ
          </Button>
          <Button type="submit" disabled={isSubmitting} onClick={form.handleSubmit(handleLocalSubmit)} className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Lưu khách hàng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
