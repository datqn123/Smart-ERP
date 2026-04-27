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
  className?: string
}

export function ProductImagePanel({
  productId,
  initialPreviewUrl,
  onImageAdded,
  className,
}: ProductImagePanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(initialPreviewUrl)
  const [urlText, setUrlText] = useState("")
  const [sortOrder, setSortOrder] = useState(0)
  const [isPrimary, setIsPrimary] = useState(true)
  const [busy, setBusy] = useState(false)
  const primaryId = useId()

  useEffect(() => {
    setPreviewUrl(initialPreviewUrl)
  }, [initialPreviewUrl])

  const runJson = useCallback(
    async (url: string) => {
      if (productId == null) return
      setBusy(true)
      try {
        const data = await postProductImageJson(productId, {
          url: url.trim(),
          sortOrder,
          isPrimary,
        })
        setPreviewUrl(data.url)
        onImageAdded?.(data)
        toast.success("Đã thêm ảnh từ URL.")
        setUrlText("")
      } catch (e) {
        if (e instanceof ApiRequestError) {
          toast.error(e.body?.message ?? e.message)
        } else {
          toast.error(e instanceof Error ? e.message : "Không thêm được ảnh")
        }
      } finally {
        setBusy(false)
      }
    },
    [productId, sortOrder, isPrimary, onImageAdded],
  )

  const runFile = useCallback(
    async (file: File) => {
      if (productId == null) return
      const mime = file.type
      if (!PRODUCT_IMAGE_ALLOWED_MIME.has(mime)) {
        toast.error("Chỉ chấp nhận JPEG, PNG, WebP (theo §4.3).")
        return
      }
      if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
        toast.error("File vượt quá 6MB (giới hạn multipart trên server).")
        return
      }
      setBusy(true)
      try {
        const data = await postProductImageMultipart(productId, file, { sortOrder, isPrimary })
        setPreviewUrl(data.url)
        onImageAdded?.(data)
        toast.success("Đã tải ảnh lên.")
      } catch (e) {
        if (e instanceof ApiRequestError) {
          toast.error(e.body?.message ?? e.message)
          if (e.status === 400 && isLikelyCloudinaryOrUploadDisabled(e)) {
            toast.info("Gợi ý: tải ảnh lên CDN/Cloudinary ngoài rồi dán URL ở ô bên dưới (POST JSON).", {
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
    [productId, sortOrder, isPrimary, onImageAdded],
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

  if (productId == null) {
    return (
      <div className={cn("rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600", className)}>
        <p className="font-medium text-slate-800">Ảnh sản phẩm (Task039)</p>
        <p className="mt-1 text-xs leading-relaxed">
          Lưu sản phẩm trước, rồi mở <strong>Chỉnh sửa</strong> để gắn ảnh: upload file (Cloudinary) hoặc dán URL (JSON).
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
          Upload: JPEG, PNG, WebP; tối đa 6MB (Spring multipart). URL: bất kỳ ảnh hợp lệ (JSON).
        </p>
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
        <Label className={FORM_LABEL_CLASS} htmlFor={`url-${productId}`}>
          Hoặc dán URL ảnh
        </Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            id={`url-${productId}`}
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
          <Label className={FORM_LABEL_CLASS} htmlFor={`so-${productId}`}>
            Thứ tự
          </Label>
          <Input
            id={`so-${productId}`}
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
