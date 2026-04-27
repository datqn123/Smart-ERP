import { useEffect, useMemo, useState, useRef } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { usePageTitle } from "@/context/PageTitleContext"
import { useAuthStore } from "@/features/auth/store/useAuthStore"
import type { Category, Product } from "../types"
import { ProductToolbar } from "../components/ProductToolbar"
import { ProductTable } from "../components/ProductTable"
import { ProductDetailDialog } from "../components/ProductDetailDialog"
import { ProductForm, ProductFormSubmitAborted, type ProductFormData } from "../components/ProductForm"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { mockCategories } from "../mockData"
import { toast } from "sonner"
import { ApiRequestError } from "@/lib/api/http"
import { Button } from "@/components/ui/button"
import {
  getCategoryList,
  mapNodeDtoToCategory,
  type GetCategoryListParams,
} from "../api/categoriesApi"
import {
  buildProductPatchBody,
  deleteProduct,
  getProductById,
  getProductList,
  mapProductListItemDtoToProduct,
  patchProduct,
  postProductsBulkDelete,
  productDetailToEditSnapshot,
  PRODUCT_LIST_SORT_WHITELIST,
  type GetProductListParams,
  type ProductEditSnapshot,
  type ProductImageDto,
  type ProductListSort,
} from "../api/productsApi"

const SEARCH_DEBOUNCE_MS = 400
const PAGE_SIZE = 20

function flattenCategories(categories: Category[]): Category[] {
  let result: Category[] = []
  categories.forEach((c) => {
    result.push(c)
    if (c.children?.length) {
      result = result.concat(flattenCategories(c.children))
    }
  })
  return result
}

function errToast(e: unknown) {
  if (e instanceof ApiRequestError) {
    toast.error(e.body?.message ?? e.message)
  } else {
    toast.error(e instanceof Error ? e.message : "Đã xảy ra lỗi")
  }
}

/**
 * Task037 / Task032-style: **409** và **400** không có `details` → toast.
 * **400** + `details` (field): `ProductForm` gọi `setError` — không toast trùng.
 */
function toastProductMutationEnvelope(e: unknown) {
  if (!(e instanceof ApiRequestError)) {
    errToast(e)
    return
  }
  const { status, body } = e
  const detailKeys = body.details ? Object.keys(body.details) : []
  if (status === 400 && detailKeys.length > 0) {
    return
  }
  if (status === 409) {
    const parts = [body.message ?? e.message]
    const d = body.details
    if (d && (d.failedId != null || d.reason != null)) {
      if (d.failedId != null) {
        parts.push(`failedId: ${d.failedId}`)
      }
      if (d.reason != null) {
        parts.push(`reason: ${d.reason}`)
      }
      for (const k of detailKeys) {
        if (k === "failedId" || k === "reason") {
          continue
        }
        const v = d[k]
        if (v) {
          parts.push(`${k}: ${v}`)
        }
      }
    } else if (detailKeys.length > 0) {
      parts.push(
        ...detailKeys.map((k) => {
          const v = body.details![k]
          return v ? `${k}: ${v}` : k
        }),
      )
    }
    toast.error(parts.filter(Boolean).join(" — "))
    return
  }
  if (status === 403) {
    toast.error(body.message ?? e.message)
    return
  }
  if (status === 400 && detailKeys.length === 0) {
    toast.error(body.message ?? e.message)
    return
  }
  errToast(e)
}

export function ProductsPage() {
  const { setTitle } = usePageTitle()
  const queryClient = useQueryClient()
  const isOwner = useAuthStore((s) => s.user?.role === "Owner")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editSnapshotRef = useRef<ProductEditSnapshot | null>(null)

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<ProductListSort>("updatedAt:desc")
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [isDeletingBulk, setIsDeletingBulk] = useState(false)

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>()

  const selectedProductRef = useRef<Product | null>(null)
  const editingProductRef = useRef<Product | undefined>(undefined)
  selectedProductRef.current = selectedProduct
  editingProductRef.current = editingProduct

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter, categoryFilter])

  useEffect(() => {
    setSelectedIds([])
  }, [page, debouncedSearch, statusFilter, categoryFilter])

  useEffect(() => {
    setTitle("Quản lý sản phẩm")
  }, [setTitle])

  const categoryListParams: GetCategoryListParams = useMemo(
    () => ({ format: "tree", status: "Active" }),
    [],
  )

  const { data: categoryListData } = useQuery({
    queryKey: ["product-management", "categories", "tree-for-products-toolbar"] as const,
    queryFn: () => getCategoryList(categoryListParams),
    staleTime: 5 * 60 * 1000,
  })

  const categoryOptions = useMemo(() => {
    const roots = (categoryListData?.items ?? []).map(mapNodeDtoToCategory)
    return flattenCategories(roots).map((c) => ({ id: c.id, name: c.name }))
  }, [categoryListData])

  const categoryIdParam = useMemo(() => {
    if (categoryFilter === "all") return undefined
    const n = Number(categoryFilter)
    return Number.isFinite(n) && n > 0 ? n : undefined
  }, [categoryFilter])

  const listParams: GetProductListParams = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      categoryId: categoryIdParam,
      status: statusFilter as GetProductListParams["status"],
      page,
      limit: PAGE_SIZE,
      sort,
    }),
    [debouncedSearch, categoryIdParam, statusFilter, page, sort],
  )

  const listQueryKey = useMemo(
    () => ["product-management", "products", "list", listParams] as const,
    [listParams],
  )

  const {
    data: listPage,
    isPending,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: listQueryKey,
    queryFn: () => getProductList(listParams),
  })

  const {
    data: productDetail,
    isLoading: isProductDetailLoading,
    isError: isProductDetailError,
    error: productDetailError,
  } = useQuery({
    queryKey: ["product-management", "products", "detail", editingProduct?.id ?? 0] as const,
    queryFn: () => getProductById(editingProduct!.id),
    enabled: isFormOpen && !!editingProduct,
  })

  useEffect(() => {
    if (!isFormOpen || !editingProduct) {
      editSnapshotRef.current = null
      return
    }
    if (productDetail && productDetail.id === editingProduct.id) {
      editSnapshotRef.current = productDetailToEditSnapshot(productDetail)
    }
  }, [isFormOpen, editingProduct, productDetail])

  useEffect(() => {
    if (!isProductDetailError) return
    errToast(productDetailError)
  }, [isProductDetailError, productDetailError])

  const patchMutation = useMutation({
    mutationFn: (args: { id: number; body: Record<string, unknown> }) => patchProduct(args.id, args.body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product-management", "products", "list"] })
      queryClient.invalidateQueries({ queryKey: ["product-management", "products", "detail", variables.id] })
      toast.success("Đã cập nhật sản phẩm")
    },
    onError: toastProductMutationEnvelope,
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => postProductsBulkDelete(ids),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["product-management", "products", "list"] })
      setSelectedIds([])
      toast.success(
        data.deletedCount > 0 ? `Đã xóa ${data.deletedCount} sản phẩm` : "Đã xóa sản phẩm",
      )
    },
    onError: toastProductMutationEnvelope,
  })

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: (_data, deletedId) => {
      void queryClient.invalidateQueries({ queryKey: ["product-management", "products", "list"] })
      void queryClient.invalidateQueries({ queryKey: ["product-management", "products", "detail", deletedId] })
      setSelectedIds((prev) => prev.filter((i) => i !== deletedId))
      setSelectedProduct((p) => (p?.id === deletedId ? null : p))
      if (selectedProductRef.current?.id === deletedId) {
        setIsDetailOpen(false)
      }
      setEditingProduct((p) => (p?.id === deletedId ? undefined : p))
      if (editingProductRef.current?.id === deletedId) {
        setIsFormOpen(false)
      }
      toast.success("Đã xóa sản phẩm")
    },
    onError: toastProductMutationEnvelope,
  })

  const products: Product[] = useMemo(
    () => (listPage?.items ?? []).map(mapProductListItemDtoToProduct),
    [listPage],
  )

  const total = listPage?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  useEffect(() => {
    if (!isError) return
    errToast(error)
  }, [isError, error])

  const handleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? products.map((p) => p.id) : [])
  }

  const handleToolbarAction = (action: string) => {
    switch (action) {
      case "edit":
        toast.info(`Chỉnh sửa ${selectedIds.length} sản phẩm`)
        break
      case "delete":
        if (!isOwner) {
          toast.error("Chỉ tài khoản Owner mới được xóa hàng loạt sản phẩm.")
          return
        }
        setIsDeletingBulk(true)
        break
      case "create":
        setEditingProduct(undefined)
        setIsFormOpen(true)
        break
      case "export":
        toast.info("Đang xuất dữ liệu Excel...")
        break
      case "import":
        fileInputRef.current?.click()
        break
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) toast.success(`Đã chọn: ${file.name}. Đang xử lý import...`)
  }

  const handleView = (item: Product) => {
    setSelectedProduct(item)
    setIsDetailOpen(true)
  }

  const handleEdit = (item: Product) => {
    setEditingProduct(item)
    setIsFormOpen(true)
  }

  const handleDelete = (item: Product) => {
    if (!isOwner) {
      toast.error("Chỉ tài khoản Owner mới được xóa sản phẩm.")
      return
    }
    setDeleteTarget(item)
  }

  const confirmDelete = () => {
    const target = deleteTarget
    if (!target) return
    void deleteProductMutation.mutateAsync(target.id)
  }

  const confirmBulkDelete = () => {
    if (!isOwner) {
      return
    }
    const ids = [...selectedIds]
    if (ids.length === 0) {
      return
    }
    bulkDeleteMutation.mutate(ids)
  }

  const formCategoryOptions = useMemo(
    () => (categoryOptions.length > 0 ? categoryOptions : mockCategories.map((c) => ({ id: c.id, name: c.name }))),
    [categoryOptions],
  )

  const handleProductImageAdded = (d: ProductImageDto) => {
    void queryClient.invalidateQueries({ queryKey: ["product-management", "products", "list"] })
    void queryClient.invalidateQueries({ queryKey: ["product-management", "products", "detail"] })
    setSelectedProduct((p) =>
      p?.id === d.productId ? { ...p, imageUrl: d.isPrimary ? d.url : p.imageUrl } : p,
    )
    setEditingProduct((prev) =>
      prev && prev.id === d.productId ? { ...prev, imageUrl: d.isPrimary ? d.url : prev.imageUrl } : prev,
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col h-full min-h-0 gap-4 md:gap-5 overflow-hidden">
      <div className="shrink-0">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">Quản lý sản phẩm</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý danh sách sản phẩm, SKU, giá cả</p>
      </div>

      <ProductToolbar
        searchStr={search}
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categoryOptions={categoryOptions}
        selectedIds={selectedIds}
        onAction={handleToolbarAction}
        fileInputRef={fileInputRef}
        onFileChange={handleFileChange}
        canBulkDelete={isOwner}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0 text-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 whitespace-nowrap">Sắp xếp</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as ProductListSort)}
            className="h-9 px-2 border border-slate-200 bg-white rounded-md text-slate-900 min-w-[180px]"
          >
            {PRODUCT_LIST_SORT_WHITELIST.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Button type="button" variant="outline" size="sm" disabled={page <= 1 || isPending} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Trước
          </Button>
          <span className="text-slate-600 tabular-nums">
            Trang {page}/{totalPages} · {total} SP
            {isFetching && !isPending ? " · …" : ""}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isPending}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </Button>
        </div>
      </div>

      {(isPending || isFetching) && (
        <p className="text-sm text-slate-500 shrink-0" role="status">
          {isPending ? "Đang tải danh sách…" : "Đang cập nhật…"}
        </p>
      )}
      {isError && (
        <p className="text-sm text-red-600 shrink-0" role="alert">
          Không tải được danh sách sản phẩm.
        </p>
      )}

      <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-md">
        <div className="flex-1 overflow-y-auto relative scroll-smooth [scrollbar-gutter:stable] min-h-0">
          <ProductTable
            data={products}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canDelete={isOwner}
          />
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        description={`Bạn có chắc chắn muốn xóa sản phẩm "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
      />

      <ConfirmDialog
        open={isDeletingBulk}
        onOpenChange={setIsDeletingBulk}
        onConfirm={confirmBulkDelete}
        title="Xác nhận xóa nhiều"
        description={`Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn?`}
      />

      <ProductDetailDialog
        product={selectedProduct}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onImageAdded={handleProductImageAdded}
        onRequestEdit={(p) => {
          setIsDetailOpen(false)
          handleEdit(p)
        }}
      />

      <ProductForm
        key={editingProduct ? `edit-${editingProduct.id}` : "create"}
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) {
            setEditingProduct(undefined)
          }
        }}
        product={editingProduct}
        productDetail={editingProduct ? (productDetail ?? null) : null}
        isProductDetailLoading={Boolean(editingProduct && isProductDetailLoading)}
        hasProductDetailError={Boolean(editingProduct && isProductDetailError)}
        categories={formCategoryOptions}
        onImageAdded={handleProductImageAdded}
        onSubmit={async (data: ProductFormData) => {
          if (editingProduct) {
            const snap = editSnapshotRef.current
            if (!snap) {
              if (isProductDetailLoading) {
                toast.error("Vui lòng đợi tải xong chi tiết sản phẩm")
                throw new ProductFormSubmitAborted()
              }
              toast.error("Không có dữ liệu chi tiết để lưu. Thử đóng và mở lại form.")
              throw new ProductFormSubmitAborted()
            }
            const body = buildProductPatchBody(snap, {
              name: data.name,
              skuCode: data.skuCode,
              barcode: data.barcode,
              categoryId: data.categoryId ?? 0,
              description: data.description,
              weight: data.weight,
              status: data.status,
              salePrice: data.salePrice,
              costPrice: data.costPrice,
              priceEffectiveDate: data.priceEffectiveDate,
            })
            if (Object.keys(body).length === 0) {
              toast.info("Không có thay đổi để lưu")
              throw new ProductFormSubmitAborted()
            }
            await patchMutation.mutateAsync({ id: editingProduct.id, body })
            return
          }
          toast.info("Tạo sản phẩm: nối API Task035 (POST /api/v1/products).")
        }}
      />
    </div>
  )
}
