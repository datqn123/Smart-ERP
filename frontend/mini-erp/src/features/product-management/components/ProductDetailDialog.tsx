import React, { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "../../inventory/utils"
import type { Product } from "../types"
import type { ProductImageDto } from "../api/productsApi"
import { getProductById, parseProductDecimal } from "../api/productsApi"
import { ProductImagePanel } from "./ProductImagePanel"
import { Tag, Layers, Barcode, Calendar, Activity, Image as ImageIcon, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ApiRequestError } from "@/lib/api/http"
import { toast } from "sonner"

interface ProductDetailDialogProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  /** Task039 — đồng bộ ảnh đại diện + invalidate list ở trang cha. */
  onImageAdded?: (data: ProductImageDto) => void
  /** Mở form sửa (Task037) từ dialog. */
  onRequestEdit?: (product: Product) => void
}

export function ProductDetailDialog({ product, isOpen, onClose, onImageAdded, onRequestEdit }: ProductDetailDialogProps) {
  const productId = product?.id

  const {
    data: detail,
    isPending: isDetailPending,
    isError: isDetailError,
    error: detailError,
  } = useQuery({
    queryKey: ["product-management", "products", "detail", "dialog", productId ?? 0] as const,
    queryFn: () => getProductById(productId!),
    enabled: isOpen && productId != null && productId > 0,
  })

  useEffect(() => {
    if (!isDetailError || !detailError) return
    if (detailError instanceof ApiRequestError) {
      toast.error(detailError.body?.message ?? detailError.message)
    } else {
      toast.error(detailError instanceof Error ? detailError.message : "Không tải được chi tiết")
    }
  }, [isDetailError, detailError])

  if (!product) return null

  const name = detail?.name ?? product.name
  const skuCode = detail?.skuCode ?? product.skuCode
  const status = (detail?.status ?? product.status) as Product["status"]
  const categoryName = detail?.categoryName ?? product.categoryName
  const imageUrl = detail?.imageUrl ?? product.imageUrl ?? undefined
  const barcode = detail?.barcode ?? product.barcode
  const weightG = detail?.weight != null ? parseProductDecimal(detail.weight) : product.weight ?? 0
  const description = detail?.description ?? product.description
  const createdAt = detail?.createdAt ?? product.createdAt

  const baseUnit = detail?.units?.find((u) => u.isBaseUnit)
  const headerSale =
    baseUnit != null && baseUnit.currentSalePrice != null
      ? parseProductDecimal(baseUnit.currentSalePrice)
      : (product.currentPrice ?? 0)
  const stock = product.currentStock ?? 0
  const lowStock = stock < 10

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-full sm:max-w-4xl lg:max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-slate-200 shadow-2xl rounded-2xl">
        <DialogHeader className="p-8 pb-4 bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex gap-6">
              <div className="h-24 w-24 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-200 overflow-hidden shadow-sm shrink-0">
                {imageUrl ? (
                  <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon size={40} />
                )}
              </div>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      status === "Active" ? "bg-green-50 text-green-700 border-green-100" : "bg-slate-100 text-slate-500 border-slate-200",
                    )}
                  >
                    {status === "Active" ? "Active" : "Inactive"}
                  </span>
                  <span className="text-xs font-mono text-slate-400">SKU: {skuCode}</span>
                </div>
                <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">
                  {name}
                </DialogTitle>
                <DialogDescription className="text-sm font-medium text-slate-500 mt-1 text-left">
                  Danh mục: <span className="text-slate-900">{categoryName || "Chưa phân loại"}</span>
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
              <div className="text-right border-r pr-4 border-slate-100">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Tồn kho hiện tại</p>
                <p className="text-2xl font-black text-slate-900">
                  {stock} <span className="text-sm font-normal text-slate-400">sp</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Theo bảng list (Task034)</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Giá bán ĐV cơ sở</p>
                <p className="text-2xl font-black text-slate-900">
                  {headerSale.toLocaleString("vi-VN")} <span className="text-sm font-normal text-slate-400">đ</span>
                </p>
              </div>
            </div>
          </div>
          {isDetailPending && (
            <p className="text-sm text-slate-500 mt-2" role="status">
              Đang tải chi tiết (đơn vị, ảnh)…
            </p>
          )}
        </DialogHeader>

        <div className="p-8 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <MetricItem icon={Barcode} label="Mã vạch (Barcode)" value={barcode || "—"} />
            <MetricItem icon={Layers} label="Khối lượng (g)" value={`${weightG}`} />
            <MetricItem icon={Calendar} label="Ngày tạo sản phẩm" value={formatDate(createdAt)} />
          </div>

          {detail?.units && detail.units.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-3 flex items-center gap-2">
                <Package size={16} className="text-slate-400" />
                Đơn vị &amp; giá hiện hành
              </h3>
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="font-semibold">Đơn vị</TableHead>
                      <TableHead className="text-right font-semibold">Quy đổi</TableHead>
                      <TableHead className="text-center font-semibold">Cơ sở</TableHead>
                      <TableHead className="text-right font-semibold">Giá vốn</TableHead>
                      <TableHead className="text-right font-semibold">Giá bán</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.units.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.unitName}</TableCell>
                        <TableCell className="text-right tabular-nums">{parseProductDecimal(u.conversionRate)}</TableCell>
                        <TableCell className="text-center">
                          {u.isBaseUnit ? (
                            <Badge variant="secondary" className="text-xs">
                              Cơ sở
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {u.currentCostPrice == null ? "—" : formatCurrency(parseProductDecimal(u.currentCostPrice))}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-semibold">
                          {u.currentSalePrice == null ? "—" : formatCurrency(parseProductDecimal(u.currentSalePrice))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-3 flex items-center gap-2">
              <ImageIcon size={16} className="text-slate-400" />
              Ảnh gallery (Task036)
            </h3>
            {detail?.images && detail.images.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {detail.images
                  .slice()
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((img) => (
                    <div
                      key={img.id}
                      className="relative h-24 w-24 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 shrink-0"
                    >
                      <img src={img.url} alt="" className="h-full w-full object-cover" />
                      {img.isPrimary && (
                        <span className="absolute bottom-1 left-1 text-[10px] font-bold uppercase bg-amber-500 text-white px-1.5 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-4 py-3">
                {isDetailPending ? "—" : "Chưa có ảnh trong gallery."}
              </p>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-3 flex items-center gap-2">
                <ImageIcon size={16} className="text-slate-400" /> Thêm / cập nhật ảnh
              </h3>
              <ProductImagePanel
                productId={product.id}
                initialPreviewUrl={imageUrl}
                onImageAdded={onImageAdded}
                className="max-w-md"
              />
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-4 flex items-center gap-2">
                <Tag size={16} className="text-slate-400" /> Mô tả chi tiết sản phẩm
              </h3>
              <div className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 min-h-[100px]">
                {description?.trim() ? description : "Chưa có mô tả cho sản phẩm này."}
              </div>
            </div>

            {lowStock && (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <Activity size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-900 mb-1">Cảnh báo tồn kho</p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Sản phẩm này đang dưới định mức an toàn (mặc định 10 sp). Vui lòng kiểm tra và lên kế hoạch nhập hàng.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="px-6 border-slate-300">
            Đóng
          </Button>
          {onRequestEdit && (
            <Button
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 shadow-lg shadow-slate-200"
              onClick={() => {
                onRequestEdit(product)
              }}
            >
              Chỉnh sửa sản phẩm
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function MetricItem({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-slate-300 transition-colors">
      <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-50">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1.5">{label}</p>
        <p className="text-sm font-black text-slate-900 leading-none">{value}</p>
      </div>
    </div>
  )
}
