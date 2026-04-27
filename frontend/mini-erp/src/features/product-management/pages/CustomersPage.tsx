import { useEffect, useMemo, useState, useRef } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { usePageTitle } from "@/context/PageTitleContext"
import { useAuthStore } from "@/features/auth/store/useAuthStore"
import type { Customer } from "../types"
import { CustomerToolbar } from "../components/CustomerToolbar"
import { CustomerTable } from "../components/CustomerTable"
import { CustomerDetailDialog } from "../components/CustomerDetailDialog"
import {
  CustomerForm,
  CustomerFormSubmitAborted,
  type CustomerFormData,
} from "../components/CustomerForm"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ApiRequestError } from "@/lib/api/http"
import {
  buildCustomerCreateBody,
  buildCustomerPatchBody,
  CUSTOMER_LIST_QUERY_KEY,
  CUSTOMER_LIST_SORT_WHITELIST,
  customerEditSnapshotFromDetail,
  customerEditSnapshotFromListRow,
  deleteCustomer,
  getCustomerById,
  getCustomerList,
  mapCustomerDetailDtoToCustomer,
  mapCustomerListItemDtoToCustomer,
  patchCustomer,
  postCustomer,
  postCustomersBulkDelete,
  type CustomerListSort,
  type GetCustomerListParams,
} from "../api/customersApi"

const SEARCH_DEBOUNCE_MS = 400
const PAGE_SIZE = 20

function errToast(e: unknown) {
  if (e instanceof ApiRequestError) {
    toast.error(e.body?.message ?? e.message)
  } else {
    toast.error(e instanceof Error ? e.message : "Đã xảy ra lỗi")
  }
}

function toastCustomerDeleteError(e: ApiRequestError) {
  const d = e.body?.details
  const reason = d?.reason
  const base = e.body?.message ?? e.message
  const failedId = d?.failedId
  const idHint = failedId != null && String(failedId).length > 0 ? ` — failedId: ${String(failedId)}` : ""
  if (reason === "HAS_SALES_ORDERS") {
    toast.error("Không thể xóa: khách hàng đã có đơn bán hàng." + idHint + (base ? ` — ${base}` : ""))
    return
  }
  if (reason === "HAS_PARTNER_DEBTS") {
    toast.error("Không thể xóa: khách hàng còn công nợ đối tác." + idHint + (base ? ` — ${base}` : ""))
    return
  }
  if (reason === "NOT_FOUND") {
    toast.error("Không thể xóa toàn bộ: có id không tồn tại." + idHint + (base ? ` — ${base}` : ""))
    return
  }
  toast.error(base + idHint)
}

export function CustomersPage() {
  const { setTitle } = usePageTitle()
  const queryClient = useQueryClient()
  const isOwner = useAuthStore((s) => s.user?.role === "Owner")
  const isStaff = useAuthStore((s) => s.user?.role === "Staff")
  const canEditLoyaltyPoints = !isStaff
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedCustomerRef = useRef<Customer | null>(null)
  const editingCustomerRef = useRef<Customer | undefined>(undefined)

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<CustomerListSort>("updatedAt:desc")
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)
  const [isDeletingBulk, setIsDeletingBulk] = useState(false)

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>()

  selectedCustomerRef.current = selectedCustomer
  editingCustomerRef.current = editingCustomer

  const selectedCustomerId = selectedCustomer?.id
  const {
    data: customerDetailDto,
    isPending: isCustomerDetailPending,
    isError: isCustomerDetailError,
    error: customerDetailError,
  } = useQuery({
    queryKey: ["product-management", "customers", "detail", selectedCustomerId ?? 0] as const,
    queryFn: () => getCustomerById(selectedCustomerId!),
    enabled: isDetailOpen && selectedCustomerId != null && selectedCustomerId > 0,
  })

  const displayCustomer: Customer | null = useMemo(() => {
    if (customerDetailDto) {
      return mapCustomerDetailDtoToCustomer(customerDetailDto)
    }
    return selectedCustomer
  }, [customerDetailDto, selectedCustomer])

  useEffect(() => {
    if (!isCustomerDetailError || !isDetailOpen) return
    errToast(customerDetailError)
  }, [isCustomerDetailError, customerDetailError, isDetailOpen])

  useEffect(() => {
    setTitle("Khách hàng")
  }, [setTitle])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter])

  const listParams: GetCustomerListParams = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      status: statusFilter as GetCustomerListParams["status"],
      page,
      limit: PAGE_SIZE,
      sort,
    }),
    [debouncedSearch, statusFilter, page, sort],
  )

  const listQueryKey = useMemo(
    () => [...CUSTOMER_LIST_QUERY_KEY, listParams] as const,
    [listParams],
  )

  const {
    data: listPage,
    isPending: isListPending,
    isError: isListError,
    error: listError,
    isFetching: isListFetching,
  } = useQuery({
    queryKey: listQueryKey,
    queryFn: () => getCustomerList(listParams),
  })

  const customers: Customer[] = useMemo(
    () => (listPage?.items ?? []).map(mapCustomerListItemDtoToCustomer),
    [listPage],
  )

  const editingFormId = isFormOpen && editingCustomer ? editingCustomer.id : null
  const {
    data: editFormDetailDto,
    isPending: isEditFormDetailLoading,
  } = useQuery({
    queryKey: ["product-management", "customers", "detail", editingFormId ?? 0] as const,
    queryFn: () => getCustomerById(editingFormId!),
    enabled: isFormOpen && editingFormId != null && editingFormId > 0,
  })

  const customerForForm: Customer | undefined = useMemo(() => {
    if (!isFormOpen) {
      return undefined
    }
    if (editingCustomer && editFormDetailDto && editFormDetailDto.id === editingCustomer.id) {
      return mapCustomerDetailDtoToCustomer(editFormDetailDto)
    }
    return editingCustomer
  }, [isFormOpen, editingCustomer, editFormDetailDto])

  const total = listPage?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  useEffect(() => {
    if (!isListError) return
    errToast(listError)
  }, [isListError, listError])

  useEffect(() => {
    setSelectedIds([])
  }, [page, debouncedSearch, statusFilter, sort])

  const bulkDeleteCustomersMutation = useMutation({
    mutationFn: (ids: number[]) => postCustomersBulkDelete(ids),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: [...CUSTOMER_LIST_QUERY_KEY] })
      for (const id of data.deletedIds) {
        void queryClient.invalidateQueries({ queryKey: ["product-management", "customers", "detail", id] })
      }
      setSelectedIds([])
      setIsDeletingBulk(false)
      setSelectedCustomer((p) => (p && data.deletedIds.includes(p.id) ? null : p))
      if (selectedCustomerRef.current && data.deletedIds.includes(selectedCustomerRef.current.id)) {
        setIsDetailOpen(false)
      }
      setEditingCustomer((p) => (p && data.deletedIds.includes(p.id) ? undefined : p))
      if (editingCustomerRef.current && data.deletedIds.includes(editingCustomerRef.current.id)) {
        setIsFormOpen(false)
      }
      toast.success(
        data.deletedCount > 0 ? `Đã xóa ${data.deletedCount} khách hàng` : "Đã xóa khách hàng",
      )
    },
    onError: (e) => {
      setIsDeletingBulk(false)
      if (e instanceof ApiRequestError) {
        if (e.status === 409) {
          toastCustomerDeleteError(e)
          return
        }
        if (e.status === 403) {
          toast.error(e.body?.message ?? e.message)
          return
        }
        if (e.status === 400) {
          errToast(e)
          return
        }
      }
      errToast(e)
    },
  })

  const deleteCustomerMutation = useMutation({
    mutationFn: (id: number) => deleteCustomer(id),
    onSuccess: (_data, deletedId) => {
      void queryClient.invalidateQueries({ queryKey: [...CUSTOMER_LIST_QUERY_KEY] })
      void queryClient.invalidateQueries({ queryKey: ["product-management", "customers", "detail", deletedId] })
      setSelectedIds((prev) => prev.filter((i) => i !== deletedId))
      setDeleteTarget(null)
      setSelectedCustomer((p) => (p?.id === deletedId ? null : p))
      if (selectedCustomerRef.current?.id === deletedId) {
        setIsDetailOpen(false)
      }
      setEditingCustomer((p) => (p?.id === deletedId ? undefined : p))
      if (editingCustomerRef.current?.id === deletedId) {
        setIsFormOpen(false)
      }
      toast.success("Đã xóa khách hàng")
    },
    onError: (e) => {
      if (e instanceof ApiRequestError) {
        if (e.status === 409) {
          toastCustomerDeleteError(e)
          return
        }
        if (e.status === 403) {
          toast.error(e.body?.message ?? e.message)
          return
        }
      }
      errToast(e)
    },
  })

  const createCustomerMutation = useMutation({
    mutationFn: (data: CustomerFormData) => postCustomer(buildCustomerCreateBody(data)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...CUSTOMER_LIST_QUERY_KEY] })
      toast.success("Đã tạo khách hàng")
    },
  })

  const patchCustomerMutation = useMutation({
    mutationFn: (args: { id: number; body: Record<string, unknown> }) => patchCustomer(args.id, args.body),
    onSuccess: (_d, v) => {
      void queryClient.invalidateQueries({ queryKey: [...CUSTOMER_LIST_QUERY_KEY] })
      void queryClient.invalidateQueries({ queryKey: ["product-management", "customers", "detail", v.id] })
      toast.success("Đã cập nhật khách hàng")
    },
  })

  const handleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? customers.map((c) => c.id) : [])
  }

  const handleToolbarAction = (action: string) => {
    switch (action) {
      case "edit":
        toast.info(`Chỉnh sửa ${selectedIds.length} khách hàng`)
        break
      case "delete":
        if (!isOwner) {
          toast.error("Chỉ tài khoản Owner mới được xóa hàng loạt khách hàng.")
          return
        }
        setIsDeletingBulk(true)
        break
      case "create":
        setEditingCustomer(undefined)
        setIsFormOpen(true)
        break
      case "export":
        toast.info("Đang xuất dữ liệu Excel…")
        break
      case "import":
        fileInputRef.current?.click()
        break
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      toast.success(`Đã chọn: ${file.name}. Đang xử lý import…`)
    }
  }

  const handleView = (item: Customer) => {
    setSelectedCustomer(item)
    setIsDetailOpen(true)
  }

  const handleEdit = (item: Customer) => {
    setEditingCustomer(item)
    setIsFormOpen(true)
  }

  const handleDelete = (item: Customer) => {
    if (!isOwner) {
      toast.error("Chỉ tài khoản Owner mới được xóa khách hàng.")
      return
    }
    setDeleteTarget(item)
  }

  const confirmDelete = () => {
    const target = deleteTarget
    if (!target) {
      return
    }
    void deleteCustomerMutation.mutateAsync(target.id)
  }

  const confirmBulkDelete = () => {
    if (!isOwner) {
      toast.error("Chỉ tài khoản Owner mới được xóa hàng loạt khách hàng.")
      setIsDeletingBulk(false)
      return
    }
    const ids = [...new Set(selectedIds)]
    if (ids.length === 0) {
      setIsDeletingBulk(false)
      return
    }
    if (ids.length > 50) {
      toast.error("Tối đa 50 khách hàng một lần xóa hàng loạt (sau khi loại trùng).")
      setIsDeletingBulk(false)
      return
    }
    void bulkDeleteCustomersMutation.mutateAsync(ids)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col h-full min-h-0 gap-4 md:gap-5 overflow-hidden">
      <div className="shrink-0">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">Khách hàng</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý thông tin khách hàng, điểm tích lũy (Task048: danh sách API)</p>
      </div>

      <CustomerToolbar
        searchStr={search}
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
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
            onChange={(e) => {
              setSort(e.target.value as CustomerListSort)
            }}
            className="h-9 px-2 border border-slate-200 bg-white rounded-md text-slate-900 min-w-[200px]"
          >
            {CUSTOMER_LIST_SORT_WHITELIST.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1 || isListPending}
            onClick={() => {
              setPage((p) => Math.max(1, p - 1))
            }}
          >
            Trước
          </Button>
          <span className="text-slate-600 tabular-nums">
            Trang {page}/{totalPages} · {total} KH
            {isListFetching && !isListPending ? " · …" : ""}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isListPending}
            onClick={() => {
              setPage((p) => p + 1)
            }}
          >
            Sau
          </Button>
        </div>
      </div>

      {(isListPending || isListFetching) && (
        <p className="text-sm text-slate-500 shrink-0" role="status">
          {isListPending ? "Đang tải danh sách…" : "Đang cập nhật…"}
        </p>
      )}
      {isListError && (
        <p className="text-sm text-red-600 shrink-0" role="alert">
          Không tải được danh sách khách hàng.
        </p>
      )}

      <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-md">
        <div className="flex-1 overflow-y-auto relative scroll-smooth [scrollbar-gutter:stable] min-h-0">
          <CustomerTable
            data={customers}
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
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
          }
        }}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        description={
          deleteTarget
            ? `Bạn có chắc chắn muốn xóa khách hàng "${deleteTarget.name}"? Hành động này không thể hoàn tác.`
            : undefined
        }
      />

      <ConfirmDialog
        open={isDeletingBulk}
        onOpenChange={setIsDeletingBulk}
        onConfirm={confirmBulkDelete}
        title="Xác nhận xóa nhiều"
        description={`Bạn có chắc chắn muốn xóa ${selectedIds.length} khách hàng đã chọn?`}
      />

      <CustomerDetailDialog
        customer={displayCustomer}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false)
        }}
        isDetailLoading={isCustomerDetailPending}
        isDetailError={isCustomerDetailError}
      />

      <CustomerForm
        key={
          !isFormOpen
            ? "closed"
            : editingCustomer
              ? `edit-${editingCustomer.id}-${editFormDetailDto?.updatedAt ?? "row"}`
              : "create"
        }
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) {
            setEditingCustomer(undefined)
          }
        }}
        customer={customerForForm}
        canEditLoyaltyPoints={canEditLoyaltyPoints}
        onSubmit={async (data: CustomerFormData) => {
          if (editingCustomer) {
            if (isEditFormDetailLoading) {
              toast.error("Vui lòng đợi tải xong chi tiết khách hàng.")
              throw new CustomerFormSubmitAborted()
            }
            const snap =
              editFormDetailDto && editFormDetailDto.id === editingCustomer.id
                ? customerEditSnapshotFromDetail(editFormDetailDto)
                : customerEditSnapshotFromListRow(editingCustomer)
            const patchInput = {
              customerCode: data.customerCode,
              name: data.name,
              phone: data.phone,
              email: data.email,
              address: data.address,
              status: data.status,
              ...(canEditLoyaltyPoints ? { loyaltyPoints: data.loyaltyPoints } : {}),
            }
            const body = buildCustomerPatchBody(snap, patchInput, {
              includeLoyaltyPoints: canEditLoyaltyPoints,
            })
            if (Object.keys(body).length === 0) {
              toast.info("Không có thay đổi để lưu")
              throw new CustomerFormSubmitAborted()
            }
            await patchCustomerMutation.mutateAsync({ id: editingCustomer.id, body })
            return
          }
          await createCustomerMutation.mutateAsync(data)
        }}
      />
    </div>
  )
}
