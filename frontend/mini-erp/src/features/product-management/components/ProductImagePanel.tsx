import { useCallback, useEffect, useId, useRef, useState } from "react"
import { Image as ImageIcon, Link2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { ApiRequestError } from "@/lib/api/http"
import { FORM_HELPER_CLASS, FORM_INPUT_CLASS, FORM_LABEL_CLASS } from "@/lib/data-table-layout"
import { toast } from "sonner"
import {
  postProductImageJson,
  postProductImageMultipart,
  PRODUCT_IMAGE_ALLOWED_MIME,
  PRODUCT_IMAGE_MAX_BYTES,
  type ProductImageDto,
  type StagedProductImages,
} from "../api/productsApi"

function isLikelyCloudinaryOrUploadDisabled(e: ApiRequestError): boolean {
  const m = (e.body?.message ?? e.message).toLowerCase()
  return (
    m.includes("cloudinary") ||
    m.includes("chưa bật") ||
    m.includes("upload file") ||
    m.includes("chưa sẵn sàng")
  )
}

export type ProductImagePanelProps = {
  productId: number | undefined
  initialPreviewUrl?: string
  onImageAdded?: (data: ProductImageDto) => void
  /**
   * Chế độ SRS BR-10: chọn file / thêm URL chỉ lưu state; **không** gọi API tới khi bấm Lưu ở form.
   * Khi có, bắt buộc truyền cả `staged` + `onStagedChange`.
   */
  staged?: StagedProductImages
  onStagedChange?: (next: StagedProductImages) => void
  className?: string
}

export function ProductImagePanel({
  productId,
  initialPreviewUrl,
  onImageAdded,
  staged,
  onStagedChange,
  className,
}: ProductImagePanelProps) {
  const isStaged = Boolean(onStagedChange && staged)
  const fileInputRef = useRef<HTMLInputElement>(null)
  /** Blob URL tạm khi chọn file — phải revoke khi thay bằng URL server hoặc unmount. */
  const tempObjectUrlRef = useRef<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(initialPreviewUrl)
  const [urlText, setUrlText] = useState("")
  const [sortOrder, setSortOrder] = useState(0)
  const [isPrimary, setIsPrimary] = useState(true)
  const [busy, setBusy] = useState(false)
  const primaryId = useId()

  const revokeTempPreview = useCallback(() => {
    const u = tempObjectUrlRef.current
    if (u) {
      URL.revokeObjectURL(u)
      tempObjectUrlRef.current = null
    }
  }, [])

  const panelId = productId ?? "draft"

  useEffect(() => {
    revokeTempPreview()
    if (isStaged && staged && staged.files.length > 0) {
      const picked = staged.files[staged.files.length - 1]!
      const u = URL.createObjectURL(picked)
      tempObjectUrlRef.current = u
      setPreviewUrl(u)
      return () => {
        URL.revokeObjectURL(u)
        tempObjectUrlRef.current = null
      }
    }
    if (isStaged && staged && staged.urlAdds.length > 0) {
      const primary = staged.urlAdds.find((x) => x.isPrimary) ?? staged.urlAdds[0]
      setPreviewUrl(primary?.url)
      return
    }
    setPreviewUrl(initialPreviewUrl)
  }, [initialPreviewUrl, revokeTempPreview, isStaged, staged])

  useEffect(() => {
    return () => {
      revokeTempPreview()
    }
  }, [revokeTempPreview])

  const runJson = useCallback(
    async (url: string) => {
      if (isStaged && onStagedChange && staged) {
        const trimmed = url.trim()
        onStagedChange({
          ...staged,
          urlAdds: [
            ...staged.urlAdds,
            {
              url: trimmed,
              sortOrder,
              isPrimary: isPrimary || (staged.urlAdds.length === 0 && staged.files.length === 0),
            },
          ],
        })
        setUrlText("")
        toast.success("Đã thêm URL (lưu khi bấm Lưu sản phẩm).")
        return
      }
      if (productId == null) return
      const trimmed = url.trim()
      const previous = previewUrl
      revokeTempPreview()
      setPreviewUrl(trimmed)
      setBusy(true)
      try {
        const data = await postProductImageJson(productId, {
          url: trimmed,
          sortOrder,
          isPrimary,
        })
        setPreviewUrl(data.url)
        onImageAdded?.(data)
        toast.success("Đã thêm ảnh từ URL.")
        setUrlText("")
      } catch (e) {
        setPreviewUrl(previous)
        if (e instanceof ApiRequestError) {
          toast.error(e.body?.message ?? e.message)
        } else {
          toast.error(e instanceof Error ? e.message : "Không thêm được ảnh")
        }
      } finally {
        setBusy(false)
      }
    },
    [productId, sortOrder, isPrimary, onImageAdded, previewUrl, revokeTempPreview, isStaged, onStagedChange, staged],
  )

  const runFile = useCallback(
    async (file: File) => {
      if (isStaged && onStagedChange && staged) {
        const mime = file.type
        if (!PRODUCT_IMAGE_ALLOWED_MIME.has(mime)) {
          toast.error("Chỉ chấp nhận JPEG, PNG, WebP.")
          return
        }
        if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
          toast.error("File vượt quá 5 MB cho phép.")
          return
        }
        // Một ô preview — chọn file mới thay thế file đang chờ, không append (append khiến preview vẫn dùng files[0]).
        onStagedChange({
          ...staged,
          files: [file],
        })
        toast.success("Đã thêm file (lưu khi bấm Lưu sản phẩm).")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        return
      }
      if (productId == null) return
      const mime = file.type
      if (!PRODUCT_IMAGE_ALLOWED_MIME.has(mime)) {
        toast.error("Chỉ chấp nhận JPEG, PNG, WebP.")
        return
      }
      if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
        toast.error("File vượt quá 5 MB cho phép.")
        return
      }
      const urlBeforePick = previewUrl
      revokeTempPreview()
      const localUrl = URL.createObjectURL(file)
      tempObjectUrlRef.current = localUrl
      setPreviewUrl(localUrl)
      setBusy(true)
      try {
        const data = await postProductImageMultipart(productId, file, { sortOrder, isPrimary })
        revokeTempPreview()
        setPreviewUrl(data.url)
        onImageAdded?.(data)
        toast.success("Đã tải ảnh lên.")
      } catch (e) {
        revokeTempPreview()
        setPreviewUrl(urlBeforePick)
        if (e instanceof ApiRequestError) {
          toast.error(e.body?.message ?? e.message)
          if (e.status === 400 && isLikelyCloudinaryOrUploadDisabled(e)) {
            toast.info("Gợi ý: dùng ảnh đã có trên mạng (URL https://…) rồi dán vào ô bên dưới.", {
              duration: 8000,
            })
          }
        } else {
          toast.error(e instanceof Error ? e.message : "Không tải được ảnh")
        }
      } finally {
        setBusy(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    },
    [productId, sortOrder, isPrimary, onImageAdded, previewUrl, revokeTempPreview, isStaged, onStagedChange, staged],
  )

  const onPickFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0]
    if (f) {
      void runFile(f)
    }
  }

  const onAddUrl = () => {
    const u = urlText.trim()
    if (!u) {
      toast.error("Nhập URL ảnh (https://…).")
      return
    }
    void runJson(u)
  }

  if (productId == null && !isStaged) {
    return (
      <div className={cn("rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600", className)}>
        <p className="font-medium text-slate-800">Ảnh sản phẩm (Task039)</p>
        <p className="mt-1 text-xs leading-relaxed">
          Bật gắn ảnh từ form (Lưu mới tải lên) hoặc lưu sản phẩm rồi mở <strong>Chỉnh sửa</strong>.
        </p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label className={FORM_LABEL_CLASS}>Ảnh hiển thị / vừa thêm</Label>
        <div className="aspect-square max-h-56 w-full max-w-56 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 overflow-hidden">
          {previewUrl ? (
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <>
              <ImageIcon size={32} />
              <span className="text-xs font-medium mt-1">Chưa có ảnh</span>
            </>
          )}
        </div>
        <p className={FORM_HELPER_CLASS}>
          {isStaged
            ? "Ảnh hoặc URL sẽ được lưu khi bạn bấm Lưu sản phẩm."
            : "Upload: JPEG, PNG, WebP; tối đa 5 MB mỗi ảnh. Hoặc dán URL ảnh (https://…)."}
        </p>
        {isStaged && (
          <p className="text-xs text-slate-500">
            Chưa lưu: {staged?.files.length ?? 0} file, {staged?.urlAdds.length ?? 0} URL.
          </p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={onPickFile}
        disabled={busy}
        aria-hidden
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          Tải file
        </Button>
      </div>

      <div className="space-y-1">
        <Label className={FORM_LABEL_CLASS} htmlFor={`url-${panelId}`}>
          Hoặc dán URL ảnh
        </Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            id={`url-${panelId}`}
            type="url"
            placeholder="https://…"
            value={urlText}
            onChange={(e) => setUrlText(e.target.value)}
            className={FORM_INPUT_CLASS}
            disabled={busy}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAddUrl())}
          />
          <Button type="button" variant="secondary" className="gap-2 shrink-0" disabled={busy} onClick={onAddUrl}>
            <Link2 className="h-4 w-4" />
            Thêm URL
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className={FORM_LABEL_CLASS} htmlFor={`so-${panelId}`}>
            Thứ tự
          </Label>
          <Input
            id={`so-${panelId}`}
            type="number"
            min={0}
            value={sortOrder}
            onChange={(e) => setSortOrder(Math.max(0, Number(e.target.value) || 0))}
            className={FORM_INPUT_CLASS}
            disabled={busy}
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
            <input
              id={primaryId}
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              disabled={busy}
            />
            <span>Đặt làm ảnh đại diện</span>
          </label>
        </div>
      </div>
    </div>
  )
}
