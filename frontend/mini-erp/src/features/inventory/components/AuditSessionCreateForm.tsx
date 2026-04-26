import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AuditSessionCreateBody } from "../api/auditSessionsApi"
import { FORM_LABEL_CLASS, FORM_INPUT_CLASS } from "@/lib/data-table-layout"
import { cn } from "@/lib/utils"

function tryParsePositiveIntList(raw: string | undefined): { ok: true; ids: number[] } | { ok: false; message: string } {
  if (raw == null || !String(raw).trim()) {
    return { ok: false, message: "Không được để trống" }
  }
  const parts = String(raw)
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (parts.length === 0) {
    return { ok: false, message: "Không được để trống" }
  }
  const ids: number[] = []
  for (const p of parts) {
    if (!/^\d+$/.test(p)) {
      return { ok: false, message: `Giá trị không hợp lệ: "${p}" (chỉ số nguyên dương, cách nhau bằng dấu phẩy hoặc xuống dòng)` }
    }
    const n = parseInt(p, 10)
    if (n <= 0) {
      return { ok: false, message: `Phải > 0: ${p}` }
    }
    ids.push(n)
  }
  return { ok: true, ids: [...new Set(ids)] }
}

const createFormSchema = z
  .object({
    title: z.string().min(1, "Nhập tiêu đề").max(255, "Tối đa 255 ký tự"),
    auditDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Định dạng YYYY-MM-DD"),
    notes: z.string().max(2000, "Ghi chú tối đa 2000 ký tự").optional(),
    scopeMode: z.enum(["by_location_ids", "by_category_id", "by_inventory_ids"]),
    locationIdsText: z.string().optional(),
    categoryIdText: z.string().optional(),
    inventoryIdsText: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.scopeMode === "by_location_ids") {
      const r = tryParsePositiveIntList(val.locationIdsText)
      if (!r.ok) {
        ctx.addIssue({ code: "custom", path: ["locationIdsText"], message: r.message })
      }
    } else if (val.scopeMode === "by_category_id") {
      const t = (val.categoryIdText ?? "").trim()
      if (!/^\d+$/.test(t)) {
        ctx.addIssue({ code: "custom", path: ["categoryIdText"], message: "Nhập categoryId (số nguyên dương)" })
        return
      }
      const n = parseInt(t, 10)
      if (n <= 0) {
        ctx.addIssue({ code: "custom", path: ["categoryIdText"], message: "categoryId phải > 0" })
      }
    } else {
      const r = tryParsePositiveIntList(val.inventoryIdsText)
      if (!r.ok) {
        ctx.addIssue({ code: "custom", path: ["inventoryIdsText"], message: r.message })
      }
    }
  })

export type AuditSessionCreateFormValues = z.infer<typeof createFormSchema>

function defaultFormValues(): AuditSessionCreateFormValues {
  return {
    title: "",
    auditDate: new Date().toISOString().slice(0, 10),
    notes: "",
    scopeMode: "by_location_ids",
    locationIdsText: "",
    categoryIdText: "",
    inventoryIdsText: "",
  }
}

function buildCreateBody(values: AuditSessionCreateFormValues): AuditSessionCreateBody {
  const notesTrim = values.notes?.trim()
  const notes = notesTrim ? notesTrim : null
  const title = values.title.trim()

  if (values.scopeMode === "by_location_ids") {
    const r = tryParsePositiveIntList(values.locationIdsText)
    if (!r.ok) throw new Error("validation")
    return { title, auditDate: values.auditDate, notes, scope: { mode: "by_location_ids", locationIds: r.ids } }
  }
  if (values.scopeMode === "by_category_id") {
    const categoryId = parseInt((values.categoryIdText ?? "").trim(), 10)
    return { title, auditDate: values.auditDate, notes, scope: { mode: "by_category_id", categoryId } }
  }
  const r = tryParsePositiveIntList(values.inventoryIdsText)
  if (!r.ok) throw new Error("validation")
  return { title, auditDate: values.auditDate, notes, scope: { mode: "by_inventory_ids", inventoryIds: r.ids } }
}

export interface AuditSessionCreateFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isSubmitting: boolean
  onSubmit: (body: AuditSessionCreateBody) => Promise<void>
}

export function AuditSessionCreateForm({ open, onOpenChange, isSubmitting, onSubmit }: AuditSessionCreateFormProps) {
  const form = useForm<AuditSessionCreateFormValues>({
    resolver: zodResolver(createFormSchema),
    defaultValues: defaultFormValues(),
  })

  const { register, handleSubmit, reset, setValue, watch, formState } = form
  const scopeMode = watch("scopeMode")

  useEffect(() => {
    if (open) {
      reset(defaultFormValues())
    }
  }, [open, reset])

  const onValid = async (values: AuditSessionCreateFormValues) => {
    const body = buildCreateBody(values)
    await onSubmit(body)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo đợt kiểm kê</DialogTitle>
          <DialogDescription id="audit-create-form-desc">
            Chọn phạm vi snapshot từ tồn kho (theo vị trí, danh mục, hoặc danh sách ID tồn). Khớp{" "}
            <code className="text-xs">POST /api/v1/inventory/audit-sessions</code>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onValid)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="audit-create-title" className={FORM_LABEL_CLASS}>
              Tiêu đề <span className="text-red-600">*</span>
            </Label>
            <Input id="audit-create-title" className={cn(FORM_INPUT_CLASS, "h-11")} {...register("title")} />
            {formState.errors.title && (
              <p className="text-sm text-red-600">{formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="audit-create-date" className={FORM_LABEL_CLASS}>
              Ngày kiểm <span className="text-red-600">*</span>
            </Label>
            <Input id="audit-create-date" type="date" className={cn(FORM_INPUT_CLASS, "h-11")} {...register("auditDate")} />
            {formState.errors.auditDate && (
              <p className="text-sm text-red-600">{formState.errors.auditDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="audit-create-notes" className={FORM_LABEL_CLASS}>
              Ghi chú
            </Label>
            <Textarea id="audit-create-notes" className={FORM_INPUT_CLASS} rows={2} {...register("notes")} />
            {formState.errors.notes && (
              <p className="text-sm text-red-600">{formState.errors.notes.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className={FORM_LABEL_CLASS}>Phạm vi (scope) <span className="text-red-600">*</span></Label>
            <Select
              value={scopeMode}
              onValueChange={(v) => setValue("scopeMode", v as AuditSessionCreateFormValues["scopeMode"])}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Chọn cách chọn tồn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="by_location_ids">Theo ID vị trí kho (locationIds)</SelectItem>
                <SelectItem value="by_category_id">Theo danh mục (categoryId)</SelectItem>
                <SelectItem value="by_inventory_ids">Theo ID dòng tồn (inventoryIds)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {scopeMode === "by_location_ids" && (
            <div className="space-y-2">
              <Label htmlFor="audit-create-locations" className={FORM_LABEL_CLASS}>
                ID vị trí (cách nhau dấu phẩy hoặc xuống dòng) <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="audit-create-locations"
                className={FORM_INPUT_CLASS}
                rows={3}
                placeholder="Ví dụ: 1, 2"
                {...register("locationIdsText")}
              />
              {formState.errors.locationIdsText && (
                <p className="text-sm text-red-600">{formState.errors.locationIdsText.message}</p>
              )}
            </div>
          )}

          {scopeMode === "by_category_id" && (
            <div className="space-y-2">
              <Label htmlFor="audit-create-category" className={FORM_LABEL_CLASS}>
                categoryId <span className="text-red-600">*</span>
              </Label>
              <Input
                id="audit-create-category"
                className={cn(FORM_INPUT_CLASS, "h-11")}
                inputMode="numeric"
                placeholder="Ví dụ: 3"
                {...register("categoryIdText")}
              />
              {formState.errors.categoryIdText && (
                <p className="text-sm text-red-600">{formState.errors.categoryIdText.message}</p>
              )}
            </div>
          )}

          {scopeMode === "by_inventory_ids" && (
            <div className="space-y-2">
              <Label htmlFor="audit-create-inv" className={FORM_LABEL_CLASS}>
                ID tồn kho inventory (cách nhau dấu phẩy hoặc xuống dòng) <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="audit-create-inv"
                className={FORM_INPUT_CLASS}
                rows={3}
                placeholder="Ví dụ: 10, 11, 12"
                {...register("inventoryIdsText")}
              />
              {formState.errors.inventoryIdsText && (
                <p className="text-sm text-red-600">{formState.errors.inventoryIdsText.message}</p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" className="h-11" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" className="h-11 bg-slate-900 hover:bg-slate-800 text-white" disabled={isSubmitting}>
              {isSubmitting ? "Đang tạo…" : "Tạo đợt kiểm kê"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
