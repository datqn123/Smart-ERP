import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AuditSession, AuditStatus } from "../types"
import type { AuditSessionPatchBody } from "../api/auditSessionsApi"
import { FORM_LABEL_CLASS, FORM_INPUT_CLASS } from "@/lib/data-table-layout"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/features/auth/store/useAuthStore"
import { toast } from "sonner"

type EditMode = "staff" | "meta" | "owner-recheck" | "blocked"

function getEditMode(status: AuditStatus, isOwner: boolean): EditMode {
  if (status === "Cancelled") return "blocked"
  if (status === "Completed") return isOwner ? "owner-recheck" : "blocked"
  if (status === "Pending" || status === "In Progress") return "staff"
  if (status === "Pending Owner Approval" || status === "Re-check") return "meta"
  return "blocked"
}

const staffFormSchema = z.object({
  title: z.string().min(1, "Bắt buộc").max(255),
  notes: z.string().max(2000),
  statusStaff: z.enum(["Pending", "In Progress"]),
})

const metaFormSchema = z.object({
  title: z.string().min(1, "Bắt buộc").max(255),
  notes: z.string().max(2000),
})

const ownerRecheckSchema = z.object({
  ownerNotes: z.string().min(1, "Nhập ghi chú Owner").max(2000),
})

export type StaffPatchFormValues = z.infer<typeof staffFormSchema>
export type MetaPatchFormValues = z.infer<typeof metaFormSchema>
export type OwnerRecheckFormValues = z.infer<typeof ownerRecheckSchema>

export interface AuditSessionPatchDialogProps {
  open: boolean
  onClose: () => void
  session: AuditSession | null
  listHint: AuditSession | null
  isLoading: boolean
  isError: boolean
  errorMessage?: string
  isSubmitting: boolean
  onSubmit: (body: AuditSessionPatchBody) => Promise<void>
}

export function AuditSessionPatchDialog({
  open,
  onClose,
  session,
  listHint,
  isLoading,
  isError,
  errorMessage,
  isSubmitting,
  onSubmit,
}: AuditSessionPatchDialogProps) {
  const user = useAuthStore((s) => s.user)
  const isOwner = user?.role === "Owner"

  const mode: EditMode = useMemo(() => {
    if (!session) return "blocked"
    return getEditMode(session.status, isOwner)
  }, [session, isOwner])

  const staffForm = useForm<StaffPatchFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: { title: "", notes: "", statusStaff: "Pending" },
  })

  const metaForm = useForm<MetaPatchFormValues>({
    resolver: zodResolver(metaFormSchema),
    defaultValues: { title: "", notes: "" },
  })

  const ownerForm = useForm<OwnerRecheckFormValues>({
    resolver: zodResolver(ownerRecheckSchema),
    defaultValues: { ownerNotes: "" },
  })

  useEffect(() => {
    if (!open || !session) return
    staffForm.reset({
      title: session.title,
      notes: session.notes ?? "",
      statusStaff: session.status === "In Progress" ? "In Progress" : "Pending",
    })
    metaForm.reset({
      title: session.title,
      notes: session.notes ?? "",
    })
    ownerForm.reset({ ownerNotes: "" })
  }, [open, session?.id, session?.title, session?.notes, session?.status])

  const header = session ?? listHint

  const submitStaff = staffForm.handleSubmit(async (v) => {
    if (!session) return
    const initTitle = session.title
    const initNotes = session.notes ?? ""
    const initStatus = session.status === "In Progress" ? "In Progress" : "Pending"
    const body: AuditSessionPatchBody = {}
    if (v.title.trim() !== initTitle) body.title = v.title.trim()
    if (v.notes.trim() !== initNotes) body.notes = v.notes.trim() === "" ? "" : v.notes.trim()
    if (v.statusStaff !== initStatus) body.status = v.statusStaff
    if (Object.keys(body).length === 0) {
      toast.info("Chưa có thay đổi để lưu")
      return
    }
    await onSubmit(body)
  })

  const submitMeta = metaForm.handleSubmit(async (v) => {
    if (!session) return
    const initTitle = session.title
    const initNotes = session.notes ?? ""
    const body: AuditSessionPatchBody = {}
    if (v.title.trim() !== initTitle) body.title = v.title.trim()
    if (v.notes.trim() !== initNotes) body.notes = v.notes.trim() === "" ? "" : v.notes.trim()
    if (Object.keys(body).length === 0) {
      toast.info("Chưa có thay đổi để lưu")
      return
    }
    await onSubmit(body)
  })

  const submitOwnerRecheck = ownerForm.handleSubmit(async (v) => {
    await onSubmit({
      status: "Re-check",
      ownerNotes: v.ownerNotes.trim(),
    })
  })

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto gap-4">
        <DialogHeader>
          <DialogTitle className="text-left">Cập nhật đợt kiểm kê</DialogTitle>
          <DialogDescription className="text-left text-slate-600">
            {header ? (
              <>
                <span className="font-mono text-slate-700">{header.auditCode}</span>
                {session && (
                  <span className="block text-xs mt-1 text-slate-500">Trạng thái: {session.status}</span>
                )}
              </>
            ) : (
              "—"
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-8 w-8 border-2 border-slate-300 border-t-slate-900 rounded-full" />
          </div>
        )}

        {isError && (
          <p className="text-sm text-red-600 border border-red-100 bg-red-50 rounded-md p-3">
            {errorMessage ?? "Không tải được dữ liệu để chỉnh sửa."}
          </p>
        )}

        {!isLoading && !isError && session && mode === "blocked" && (
          <>
            <p className="text-sm text-slate-600">
              Đợt ở trạng thái này không chỉnh sửa meta/trạng thái qua PATCH (đã hủy, hoặc đã hoàn thành — chỉ Owner có thể mở Re-check từ luồng riêng).
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" className="h-11" onClick={onClose}>
                Đóng
              </Button>
            </DialogFooter>
          </>
        )}

        {!isLoading && !isError && session && mode === "staff" && (
          <form onSubmit={submitStaff} className="space-y-4">
            <div className="space-y-2">
              <Label className={FORM_LABEL_CLASS}>Tiêu đề</Label>
              <Input className={cn(FORM_INPUT_CLASS, "h-11")} {...staffForm.register("title")} />
              {staffForm.formState.errors.title && (
                <p className="text-sm text-red-600">{staffForm.formState.errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className={FORM_LABEL_CLASS}>Ghi chú</Label>
              <Textarea className={FORM_INPUT_CLASS} rows={3} {...staffForm.register("notes")} />
              {staffForm.formState.errors.notes && (
                <p className="text-sm text-red-600">{staffForm.formState.errors.notes.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className={FORM_LABEL_CLASS}>Trạng thái (Staff)</Label>
              <Select
                value={staffForm.watch("statusStaff")}
                onValueChange={(v) => staffForm.setValue("statusStaff", v as "Pending" | "In Progress")}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Chờ kiểm (Pending)</SelectItem>
                  <SelectItem value="In Progress">Đang kiểm (In Progress)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" className="h-11" onClick={onClose} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button type="submit" className="h-11 bg-slate-900 hover:bg-slate-800 text-white" disabled={isSubmitting}>
                {isSubmitting ? "Đang lưu…" : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {!isLoading && !isError && session && mode === "meta" && (
          <form onSubmit={submitMeta} className="space-y-4">
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-md p-2">
              Trạng thái hiện tại không đổi qua PATCH — chỉ cập nhật tiêu đề / ghi chú.
            </p>
            <div className="space-y-2">
              <Label className={FORM_LABEL_CLASS}>Tiêu đề</Label>
              <Input className={cn(FORM_INPUT_CLASS, "h-11")} {...metaForm.register("title")} />
              {metaForm.formState.errors.title && (
                <p className="text-sm text-red-600">{metaForm.formState.errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className={FORM_LABEL_CLASS}>Ghi chú</Label>
              <Textarea className={FORM_INPUT_CLASS} rows={3} {...metaForm.register("notes")} />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" className="h-11" onClick={onClose} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button type="submit" className="h-11 bg-slate-900 hover:bg-slate-800 text-white" disabled={isSubmitting}>
                {isSubmitting ? "Đang lưu…" : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {!isLoading && !isError && session && mode === "owner-recheck" && (
          <form onSubmit={submitOwnerRecheck} className="space-y-4">
            <p className="text-xs text-slate-600">
              Owner: mở lại kiểm (<strong className="font-medium">Re-check</strong>) khi đợt đã Hoàn thành. Cần ghi chú; nếu đã áp chênh lệch, BE từ chối (409).
            </p>
            <div className="space-y-2">
              <Label className={FORM_LABEL_CLASS}>Ghi chú Owner</Label>
              <Textarea className={FORM_INPUT_CLASS} rows={3} {...ownerForm.register("ownerNotes")} />
              {ownerForm.formState.errors.ownerNotes && (
                <p className="text-sm text-red-600">{ownerForm.formState.errors.ownerNotes.message}</p>
              )}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" className="h-11" onClick={onClose} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button type="submit" className="h-11 bg-slate-900 hover:bg-slate-800 text-white" disabled={isSubmitting}>
                {isSubmitting ? "Đang xử lý…" : "Chuyển sang Re-check"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
