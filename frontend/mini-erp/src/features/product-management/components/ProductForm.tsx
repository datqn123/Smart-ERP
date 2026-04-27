import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Package, CheckCircle2, DollarSign, Briefcase, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { cn } from "@/lib/utils"
import { FORM_LABEL_CLASS, FORM_INPUT_CLASS, FORM_HELPER_CLASS } from "@/lib/data-table-layout"
import { ApiRequestError } from "@/lib/api/http"
import type { Product } from "../types"
import type { ProductDetailDto, ProductImageDto } from "../api/productsApi"
import { ProductImagePanel } from "./ProductImagePanel"

const productSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên sản phẩm"),
  skuCode: z.string().min(1, "Vui lòng nhập mã SKU"),
  barcode: z.string().optional(),
  categoryId: z.number().optional().or(z.literal(0)),
  salePrice: z.number().min(0, "Giá bán không được nhỏ hơn 0"),
  costPrice: z.number().min(0, "Giá vốn không được nhỏ hơn 0"),
  priceEffectiveDate: z.string().optional(),
  weight: z.number().optional().or(z.literal(0)),
  description: z.string().optional(),
  status: z.enum(["Active", "Inactive"]),
})

export type ProductFormData = z.infer<typeof productSchema>

/** Parent ném khi không nên đóng dialog (PATCH rỗng, thiếu snapshot, …). */
export class ProductFormSubmitAborted extends Error {
  constructor() {
    super("ProductFormSubmitAborted")
    this.name = "ProductFormSubmitAborted"
  }
}

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product
  /** Task036 — bắt buộc khi sửa để có giá vốn / đơn vị cơ sở cho PATCH Task037. */
  productDetail?: ProductDetailDto | null
  isProductDetailLoading?: boolean
  /** GET chi tiết lỗi — không cho submit sửa (thiếu snapshot an toàn). */
  hasProductDetailError?: boolean
  categories?: { id: number; name: string }[]
  onSubmit: (data: ProductFormData) => void | Promise<void>
  /** Task039 — khi đã có `product.id` (chỉnh sửa). */
  onImageAdded?: (data: ProductImageDto) => void
}

const defaultCreateValues: ProductFormData = {
  name: "",
  skuCode: `SP${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`,
  barcode: "",
  categoryId: 0,
  salePrice: 0,
  costPrice: 0,
  priceEffectiveDate: "",
  weight: 0,
  description: "",
  status: "Active",
}

export function ProductForm({
  open,
  onOpenChange,
  product,
  productDetail = null,
  isProductDetailLoading = false,
  hasProductDetailError = false,
  categories = [],
  onSubmit,
  onImageAdded,
}: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEdit = Boolean(product)

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultCreateValues,
  })

  React.useEffect(() => {
    if (!open) return
    if (!product) {
      form.reset({
        ...defaultCreateValues,
        skuCode: `SP${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0")}`,
      })
      return
    }
    if (!productDetail) {
      form.reset({
        name: product.name,
        skuCode: product.skuCode,
        barcode: product.barcode || "",
        categoryId: product.categoryId && product.categoryId > 0 ? product.categoryId : 0,
        salePrice: product.currentPrice ?? 0,
        costPrice: 0,
        priceEffectiveDate: "",
        weight: product.weight || 0,
        description: product.description || "",
        status: product.status,
      })
      return
    }
    const base = productDetail.units?.find((u) => u.isBaseUnit)
    const sale =
      base != null
        ? Number(base.currentSalePrice ?? 0)
        : Number(product.currentPrice ?? 0)
    const cost = base != null ? Number(base.currentCostPrice ?? 0) : 0
    form.reset({
      name: productDetail.name,
      skuCode: productDetail.skuCode,
      barcode: productDetail.barcode ?? "",
      categoryId:
        productDetail.categoryId != null && productDetail.categoryId > 0
          ? productDetail.categoryId
          : 0,
      salePrice: Number.isFinite(sale) ? sale : 0,
      costPrice: Number.isFinite(cost) ? cost : 0,
      priceEffectiveDate: "",
      weight: productDetail.weight != null ? Number(productDetail.weight) || 0 : 0,
      description: productDetail.description ?? "",
      status: productDetail.status === "Inactive" ? "Inactive" : "Active",
    })
  }, [open, product, productDetail, form])

  const handleLocalSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)
    try {
      await Promise.resolve(onSubmit(data))
      onOpenChange(false)
    } catch (e) {
      if (e instanceof ProductFormSubmitAborted) {
        return
      }
      if (e instanceof ApiRequestError && e.status === 400 && e.body.details) {
        const formKeys: (keyof ProductFormData)[] = [
          "skuCode",
          "name",
          "barcode",
          "categoryId",
          "description",
          "weight",
          "status",
          "salePrice",
          "costPrice",
          "priceEffectiveDate",
        ]
        for (const key of formKeys) {
          const msg = e.body.details[key as string]
          if (msg) {
            form.setError(key, { message: msg })
          }
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const detailBlocking = isEdit && (isProductDetailLoading || hasProductDetailError)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-slate-200 shadow-2xl rounded-2xl">
        <DialogHeader className="p-8 pb-6 bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center gap-3 text-slate-400 mb-1">
            <Package size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Hồ sơ hàng hóa</span>
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900">
            {product ? "Cập nhật sản phẩm" : "Thêm mới hàng hóa"}
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Thiết lập thông tin mã SKU, giá bán và đặc tính sản phẩm.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleLocalSubmit)} className="p-8 space-y-8 bg-white max-h-[65vh] overflow-y-auto">
          {isEdit && isProductDetailLoading && (
            <p className="text-sm text-slate-600" role="status">
              Đang tải chi tiết sản phẩm (giá vốn / đơn vị cơ sở)…
            </p>
          )}
          {isEdit && hasProductDetailError && (
            <p className="text-sm text-red-600" role="alert">
              Không tải được chi tiết sản phẩm. Đóng hộp thoại và thử lại.
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4 space-y-4">
              <Label className={FORM_LABEL_CLASS}>Hình ảnh sản phẩm</Label>
              <ProductImagePanel
                productId={product?.id}
                initialPreviewUrl={productDetail?.imageUrl ?? product?.imageUrl}
                onImageAdded={onImageAdded}
              />
            </div>

            <div className="md:col-span-8 grid grid-cols-2 gap-x-6 gap-y-5">
              <div className="space-y-1">
                <Label className={FORM_LABEL_CLASS}>Mã SKU *</Label>
                <Input {...form.register("skuCode")} className={cn(FORM_INPUT_CLASS, "font-mono")} />
                {form.formState.errors.skuCode && (
                  <p className="text-sm text-red-600">{form.formState.errors.skuCode.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label className={FORM_LABEL_CLASS}>Trạng thái</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(val) => form.setValue("status", val as "Active" | "Inactive")}
                >
                  <SelectTrigger className={FORM_INPUT_CLASS}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Đang kinh doanh</SelectItem>
                    <SelectItem value="Inactive">Ngừng kinh doanh</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label className={FORM_LABEL_CLASS}>Tên sản phẩm *</Label>
                <Input {...form.register("name")} className={FORM_INPUT_CLASS} />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label className={FORM_LABEL_CLASS}>Danh mục</Label>
                <Select
                  value={form.watch("categoryId")?.toString() ?? "0"}
                  onValueChange={(val) => form.setValue("categoryId", parseInt(val, 10))}
                  disabled={detailBlocking}
                >
                  <SelectTrigger className={FORM_INPUT_CLASS}>
                    <SelectValue placeholder="Chọn danh mục..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Không phân loại</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.categoryId && (
                  <p className="text-sm text-red-600">{String(form.formState.errors.categoryId.message)}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label className={FORM_LABEL_CLASS}>Mã vạch (Barcode)</Label>
                <Input {...form.register("barcode")} className={cn(FORM_INPUT_CLASS, "font-mono")} />
              </div>

              <div className="space-y-1">
                <Label className={FORM_LABEL_CLASS}>Giá vốn (VNĐ) *</Label>
                <div className="relative">
                  <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="number"
                    {...form.register("costPrice", { valueAsNumber: true })}
                    className={cn(FORM_INPUT_CLASS, "pl-10 font-semibold")}
                    disabled={detailBlocking}
                  />
                </div>
                {form.formState.errors.costPrice && (
                  <p className="text-sm text-red-600">{form.formState.errors.costPrice.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label className={FORM_LABEL_CLASS}>Giá bán lẻ (VNĐ) *</Label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="number"
                    {...form.register("salePrice", { valueAsNumber: true })}
                    className={cn(FORM_INPUT_CLASS, "pl-10 font-semibold")}
                    disabled={detailBlocking}
                  />
                </div>
                {form.formState.errors.salePrice && (
                  <p className="text-sm text-red-600">{form.formState.errors.salePrice.message}</p>
                )}
              </div>

              {isEdit && (
                <div className="space-y-1 col-span-2">
                  <Label className={FORM_LABEL_CLASS}>Ngày hiệu lực giá mới (tuỳ chọn)</Label>
                  <div className="relative max-w-xs">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="date"
                      {...form.register("priceEffectiveDate")}
                      className={cn(FORM_INPUT_CLASS, "pl-10")}
                      disabled={detailBlocking}
                    />
                  </div>
                  <p className={FORM_HELPER_CLASS}>Để trống = áp dụng theo ngày hiện tại trên server.</p>
                </div>
              )}

              <div className="space-y-1">
                <Label className={FORM_LABEL_CLASS}>Khối lượng (Unit)</Label>
                <Input
                  type="number"
                  {...form.register("weight", { valueAsNumber: true })}
                  className={FORM_INPUT_CLASS}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label className={FORM_LABEL_CLASS}>Mô tả sản phẩm</Label>
                <Textarea {...form.register("description")} className={cn(FORM_INPUT_CLASS, "h-28 py-3")} />
              </div>
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
            disabled={isSubmitting || detailBlocking}
            onClick={form.handleSubmit(handleLocalSubmit)}
            className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Lưu sản phẩm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
