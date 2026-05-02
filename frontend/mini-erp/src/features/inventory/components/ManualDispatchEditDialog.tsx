import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { toast } from "sonner"
import { ApiRequestError } from "@/lib/api/http"
import { useAuthStore } from "@/features/auth/store/useAuthStore"
import { getStockDispatchDetail, patchStockDispatch, type StockDispatchPatchBody } from "../api/dispatchApi"
import { getInventoryListAllForProduct, type InventoryListItemResponse } from "../api/inventoryApi"
import { FORM_INPUT_CLASS, FORM_LABEL_CLASS } from "@/lib/data-table-layout"
import { StatusBadge } from "./StatusBadge"
import { formatCurrency, formatDate } from "../utils"
import { Package, User, Hash, Calendar, Building2, Tag, Layers, Scale } from "lucide-react"

const MANUAL_STATUSES = [
  { value: "WaitingDispatch", label: "Chờ xuất" },
  { value: "Delivering", label: "Đang giao" },
  { value: "Delivered", label: "Đã giao (trừ tồn)" },
] as const

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  dispatchId: number | null
}

type LineDraft = {
  lineId: number
  productId: number
  productName: string
  skuCode: string
  inventoryId: number
  quantity: number
  availableQuantity: number
  warehouseCode: string
  shelfCode: string
  unitPriceSnapshot: number | null
}

function unitSnapshotFromDetail(raw: number | string | null | undefined): number | null {
  if (raw == null) {
    return null
  }
  if (typeof raw === "number" && !Number.isNaN(raw)) {
    return raw
  }
  const n = Number(raw)
  return Number.isNaN(n) ? null : n
}

/** Nhãn ngắn trong dropdown — chi tiết đầy đủ hiển thị ở khối "Lô đang chọn" khi đã chọn. */
function compactLotOptionLabel(inv: InventoryListItemResponse): string {
  const batch = inv.batchNumber?.trim() ? inv.batchNumber.trim() : "—"
  return `Lô ${batch} · #${inv.id}`
}

/** Tooltip / title khi cần xem nhanh toàn bộ thông tin trong danh sách. */
function fullLotOptionTitle(inv: InventoryListItemResponse): string {
  const batch = inv.batchNumber?.trim() ? inv.batchNumber.trim() : "—"
  const exp = inv.expiryDate ? inv.expiryDate.split("T")[0] : "—"
  return `${inv.warehouseCode}/${inv.shelfCode} · Lô ${batch} · HSD ${exp} · Tồn ${inv.quantity}`
}

/** Giữ giá trị Select hợp lệ khi lô hiện tại chưa nằm trong trang API. */
function MiniField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">{label}</p>
      <div className="text-sm text-slate-900 font-medium mt-0.5 break-words">{children}</div>
    </div>
  )
}

function fallbackInventoryFromLine(row: LineDraft): InventoryListItemResponse {
  return {
    id: row.inventoryId,
    productId: row.productId,
    productName: row.productName,
    skuCode: row.skuCode,
    barcode: null,
    locationId: 0,
    warehouseCode: row.warehouseCode,
    shelfCode: row.shelfCode,
    batchNumber: null,
    expiryDate: null,
    quantity: row.availableQuantity,
    minQuantity: 0,
    unitId: 0,
    unitName: "",
    costPrice: 0,
    updatedAt: "",
    isLowStock: false,
    isExpiringSoon: false,
    totalValue: 0,
  }
}

export function ManualDispatchEditDialog({ open, onOpenChange, dispatchId }: Props) {
  const qc = useQueryClient()
  const role = useAuthStore((s) => s.user?.role)
  const currentUserId = useAuthStore((s) => s.user?.id)
  const isAdmin = role === "Admin"
  const enabled = open && dispatchId != null && dispatchId > 0

  const detailQ = useQuery({
    queryKey: ["stock-dispatch-detail", dispatchId],
    queryFn: () => getStockDispatchDetail(dispatchId!),
    enabled,
  })

  const [dispatchDate, setDispatchDate] = useState("")
  const [notes, setNotes] = useState("")
  const [referenceLabel, setReferenceLabel] = useState("")
  const [status, setStatus] = useState<string>("WaitingDispatch")
  const [lines, setLines] = useState<LineDraft[]>([])

  useEffect(() => {
    if (!detailQ.data) {
      return
    }
    const d = detailQ.data
    setDispatchDate(d.dispatchDate)
    setNotes(d.notes ?? "")
    setReferenceLabel(d.referenceLabel ?? "")
    setStatus(d.status)
    setLines(
      d.lines.map((l) => ({
        lineId: l.lineId,
        productId: l.productId ?? 0,
        productName: l.productName,
        skuCode: l.skuCode,
        inventoryId: l.inventoryId,
        quantity: l.quantity,
        availableQuantity: l.availableQuantity,
        warehouseCode: l.warehouseCode,
        shelfCode: l.shelfCode,
        unitPriceSnapshot: unitSnapshotFromDetail(l.unitPriceSnapshot),
      })),
    )
  }, [detailQ.data])

  const d = detailQ.data
  const pendingApproval =
    !!d?.stockLinesFulfillment && (d.status === "Pending" || d.status === "Partial")
  const postApprovalFlow =
    !!d?.stockLinesFulfillment && (d.status === "WaitingDispatch" || d.status === "Delivering")
  const showLinesEditor = pendingApproval || postApprovalFlow

  const uniqueProductIds = useMemo(() => {
    const s = new Set<number>()
    for (const l of lines) {
      if (l.productId > 0) {
        s.add(l.productId)
      }
    }
    return [...s]
  }, [lines])

  const lotQueries = useQueries({
    queries: uniqueProductIds.map((productId) => ({
      queryKey: ["inventory-lots-by-product", productId],
      queryFn: () => getInventoryListAllForProduct(productId, { stockLevel: "all" }),
      enabled: enabled && showLinesEditor && productId > 0,
      staleTime: 60_000,
    })),
  })

  const lotsByProductId = useMemo(() => {
    const m = new Map<number, InventoryListItemResponse[]>()
    uniqueProductIds.forEach((pid, i) => {
      const rows = lotQueries[i]?.data
      if (rows !== undefined) {
        m.set(pid, rows)
      }
    })
    return m
  }, [uniqueProductIds, lotQueries])

  const lotsLoading = showLinesEditor && lotQueries.some((q) => q.isPending)

  const hasLineShortage = useMemo(
    () => lines.some((l) => l.quantity > l.availableQuantity),
    [lines],
  )

  const patchM = useMutation({
    mutationFn: () => {
      const det = detailQ.data
      if (!det || dispatchId == null) {
        throw new Error("missing detail")
      }
      const base = {
        dispatchDate,
        notes: notes.trim() || null,
        referenceLabel: referenceLabel.trim() || null,
      }
      const lineBodies = lines.map((l) => ({
        inventoryId: l.inventoryId,
        quantity: l.quantity,
        ...(l.unitPriceSnapshot != null ? { unitPriceSnapshot: l.unitPriceSnapshot } : {}),
      }))
      const pendingApprovalInner =
        det.stockLinesFulfillment === true && (det.status === "Pending" || det.status === "Partial")
      const postApprovalFlowInner =
        det.stockLinesFulfillment === true &&
        (det.status === "WaitingDispatch" || det.status === "Delivering")
      const creator = currentUserId != null && det.userId === currentUserId
      const allowStatusInPatch = postApprovalFlowInner && (isAdmin || creator)

      if (pendingApprovalInner) {
        return patchStockDispatch(dispatchId, { ...base, lines: lineBodies })
      }
      if (postApprovalFlowInner) {
        const body: StockDispatchPatchBody = { ...base, lines: lineBodies }
        if (allowStatusInPatch) {
          body.status = status
        }
        return patchStockDispatch(dispatchId, body)
      }
      return patchStockDispatch(dispatchId, base)
    },
    onSuccess: async () => {
      toast.success("Đã lưu phiếu xuất")
      await qc.invalidateQueries({ queryKey: ["stock-dispatches", "v1", "list"] })
      await qc.invalidateQueries({ queryKey: ["inventory", "v1", "list"] })
      await qc.invalidateQueries({ queryKey: ["inventory", "v1", "summary"] })
      await qc.invalidateQueries({ queryKey: ["stock-dispatch-detail"] })
      onOpenChange(false)
    },
    onError: (e) => {
      if (e instanceof ApiRequestError) {
        toast.error(e.body?.message ?? "Không lưu được phiếu")
      }
      else {
        toast.error("Không lưu được phiếu")
      }
    },
  })

  const busy = detailQ.isPending || patchM.isPending
  const editable = detailQ.data?.canEdit === true
  const detForUi = detailQ.data
  const isCreator = detForUi != null && currentUserId != null && detForUi.userId === currentUserId
  const showStatusSelect = postApprovalFlow && (isAdmin || isCreator)

  const applyInventoryToLine = (idx: number, inv: InventoryListItemResponse, allowOverStock: boolean) => {
    setLines((prev) =>
      prev.map((p, i) => {
        if (i !== idx) {
          return p
        }
        const rawQty = p.quantity
        const capped = allowOverStock ? rawQty : Math.min(Math.max(1, rawQty), inv.quantity)
        return {
          ...p,
          inventoryId: inv.id,
          availableQuantity: inv.quantity,
          warehouseCode: inv.warehouseCode,
          shelfCode: inv.shelfCode,
          quantity: capped,
        }
      }),
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex flex-col gap-0 p-0 max-h-[min(94dvh,calc(100vh-1rem))] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:max-w-[min(1680px,calc(100vw-2rem))] overflow-hidden rounded-2xl border-slate-200 shadow-2xl sm:w-full"
      >
        <div className="shrink-0 border-b border-slate-100 bg-slate-50/90 px-6 py-5 pr-14">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">Sửa phiếu xuất kho</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-slate-600">
              {pendingApproval
                ? "Chờ duyệt: chỉnh header và dòng — có thể đổi lô (inventory) lấy ra. Khi mọi dòng đủ tồn, lưu sẽ gỡ cảnh báo thiếu và chuyển Partial → Chờ duyệt (Pending). Trạng thái phiếu không đổi ở đây — Admin dùng duyệt phiếu."
                : postApprovalFlow
                  ? "Chờ xuất / Đang giao: chỉnh dòng và lô lấy ra (SL xuất ≤ tồn lô). Đổi trạng thái chỉ khi bạn là người tạo hoặc Admin — khi Đã giao hệ thống mới trừ tồn."
                  : "Giữ header (ngày/ghi chú/tham chiếu) hoặc phiếu đã khóa — không chỉnh dòng/trạng thái trên form này."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6 py-5 space-y-5">

        {detailQ.isPending && enabled && (
          <p className="text-sm text-slate-500 py-12 text-center">Đang tải chi tiết…</p>
        )}

        {detForUi && editable && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Package className="size-4 text-slate-500 shrink-0" aria-hidden />
                <span className="font-mono text-base">{detForUi.dispatchCode}</span>
              </div>
              <StatusBadge
                status={detForUi.status}
                type="dispatch"
                shortageWarning={lines.length > 0 ? hasLineShortage : !!detForUi.shortageWarning}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-3 text-sm">
              <div className="flex items-start gap-2 text-slate-600">
                <Hash className="size-4 mt-0.5 text-slate-400 shrink-0" aria-hidden />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">Đơn hàng</p>
                  <p className="text-slate-900 font-medium">{detForUi.orderCode?.trim() ? detForUi.orderCode : "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <Building2 className="size-4 mt-0.5 text-slate-400 shrink-0" aria-hidden />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">Khách hàng</p>
                  <p className="text-slate-900 font-medium">{detForUi.customerName?.trim() ? detForUi.customerName : "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <User className="size-4 mt-0.5 text-slate-400 shrink-0" aria-hidden />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">Người tạo</p>
                  <p className="text-slate-900 font-medium">{detForUi.userName ?? "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <Calendar className="size-4 mt-0.5 text-slate-400 shrink-0" aria-hidden />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">Ngày xuất (form)</p>
                  <p className="text-slate-900 font-mono">{dispatchDate || "—"}</p>
                </div>
              </div>
              <div className="sm:col-span-2 xl:col-span-2 text-slate-600">
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">Loại phiếu</p>
                <p className="text-slate-800">
                  {detForUi.manualDispatch ? "Xuất tay" : "Gắn đơn / hệ thống"}
                  {detForUi.stockLinesFulfillment ? " · Có dòng stockdispatch_lines (đổi lô & SL được khi được phép)" : ""}
                </p>
              </div>
            </div>
          </div>
        )}

        {detailQ.data && editable && pendingApproval && (hasLineShortage || detailQ.data.shortageWarning) && (
          <p className="text-sm rounded-md border border-amber-200 bg-amber-50 text-amber-900 px-3 py-2">
            Cảnh báo thiếu tồn trên một hoặc nhiều dòng. Chọn lô khác đủ hàng hoặc giảm số lượng — sau khi Lưu, nếu mọi dòng đủ tồn, hệ thống gỡ cảnh báo và đưa trạng thái Partial về Chờ duyệt (Pending).
          </p>
        )}

        {detailQ.data && editable && postApprovalFlow && hasLineShortage && (
          <p className="text-sm rounded-md border border-amber-200 bg-amber-50 text-amber-900 px-3 py-2">
            Có dòng vượt quá tồn lô đang chọn — giảm SL xuất hoặc đổi sang lô có đủ hàng trước khi giao.
          </p>
        )}

        {detailQ.error && enabled && (
          <p className="text-sm text-red-600">Không đọc được chi tiết phiếu.</p>
        )}

        {detailQ.data != null && !editable && (
          <p className="text-sm text-slate-600">
            Phiếu đã khoá (đã giao / đã hoàn tất xuất) hoặc bạn không có quyền sửa — chờ duyệt: người tạo hoặc Admin;
            sau đó: người tạo hoặc Owner/Admin (đổi trạng thái: người tạo hoặc Admin).
          </p>
        )}

        {editable && detailQ.data && (
          <div className="space-y-4">
            <div className={`grid grid-cols-1 gap-4 ${showStatusSelect ? "sm:grid-cols-2" : ""}`}>
              <div className="space-y-2">
                <Label className={FORM_LABEL_CLASS}>Ngày xuất</Label>
                <Input
                  type="date"
                  className={FORM_INPUT_CLASS}
                  value={dispatchDate}
                  onChange={(e) => setDispatchDate(e.target.value)}
                />
              </div>
              {showStatusSelect && (
                <div className="space-y-2">
                  <Label className={FORM_LABEL_CLASS}>Trạng thái</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className={FORM_INPUT_CLASS}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MANUAL_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label className={FORM_LABEL_CLASS}>Nhãn tham chiếu</Label>
              <Input
                className={FORM_INPUT_CLASS}
                value={referenceLabel}
                onChange={(e) => setReferenceLabel(e.target.value)}
                placeholder="Khách / lý do xuất"
              />
            </div>
            <div className="space-y-2">
              <Label className={FORM_LABEL_CLASS}>Ghi chú</Label>
              <Textarea className={FORM_INPUT_CLASS} value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>

            {showLinesEditor && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <Label className={`${FORM_LABEL_CLASS} text-base`}>Chi tiết sản phẩm và lô xuất</Label>
                    <p className="text-sm text-slate-500 mt-1">
                      {pendingApproval
                        ? "Đổi lô qua dropdown; trước duyệt có thể nhập SL lớn hơn tồn lô."
                        : "Đổi lô lấy ra; SL xuất không vượt tồn lô đã chọn."}
                    </p>
                  </div>
                  {lotsLoading && (
                    <span className="text-xs font-medium text-slate-500">Đang tải danh sách lô…</span>
                  )}
                </div>

                <div className="space-y-4">
                  {lines.map((row, idx) => {
                    const optionsBase = lotsByProductId.get(row.productId) ?? []
                    const inList = optionsBase.some((o) => o.id === row.inventoryId)
                    const options =
                      row.inventoryId > 0 && !inList
                        ? [fallbackInventoryFromLine(row), ...optionsBase]
                        : optionsBase
                    const resolved = options.find((o) => o.id === row.inventoryId) ?? null
                    const lineShort = row.quantity > row.availableQuantity
                    const allowOverStock = pendingApproval
                    const batchDisp =
                      resolved?.batchNumber?.trim() ? resolved.batchNumber.trim() : "—"
                    const hsdDisp =
                      resolved?.expiryDate != null && String(resolved.expiryDate).trim() !== ""
                        ? formatDate(resolved.expiryDate)
                        : "—"
                    const unitDisp = resolved?.unitName?.trim() ? resolved.unitName : "—"
                    const barcodeDisp = resolved?.barcode?.trim() ? resolved.barcode : "—"
                    const priceDisp =
                      row.unitPriceSnapshot != null && row.unitPriceSnapshot >= 0
                        ? formatCurrency(row.unitPriceSnapshot)
                        : "—"

                    return (
                      <div
                        key={row.lineId}
                        className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden ring-1 ring-slate-900/5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4">
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Layers className="size-5 text-slate-400 shrink-0 max-sm:hidden" aria-hidden />
                              <h3 className="text-lg font-bold text-slate-900 leading-snug">{row.productName}</h3>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                              <span className="inline-flex items-center gap-1.5 font-mono text-xs sm:text-sm">
                                <Tag className="size-3.5 text-slate-400 shrink-0" aria-hidden />
                                SKU <span className="font-semibold text-slate-800">{row.skuCode || "—"}</span>
                              </span>
                              <span className="text-slate-400">|</span>
                              <span>
                                Mã SP <span className="font-mono font-semibold text-slate-800">#{row.productId || "—"}</span>
                              </span>
                              <span className="text-slate-400 max-sm:hidden">|</span>
                              <span className="max-sm:w-full">
                                Dòng phiếu{" "}
                                <span className="font-mono font-semibold text-slate-800">#{row.lineId}</span>
                              </span>
                            </div>
                          </div>
                          <div className="shrink-0 flex flex-col items-end gap-2">
                            {lineShort ? (
                              <span className="inline-flex text-xs font-semibold text-orange-900 bg-orange-100 border border-orange-200 px-3 py-1.5 rounded-lg">
                                Thiếu tồn so với lô
                              </span>
                            ) : (
                              <span className="inline-flex text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg">
                                Đủ tồn lô
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-5 grid grid-cols-1 xl:grid-cols-12 gap-5">
                          <div className="xl:col-span-5 space-y-4">
                            <p className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                              <Package className="size-3.5" aria-hidden />
                              Lô đang chọn (chi tiết)
                            </p>
                            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 grid grid-cols-2 gap-4">
                              <MiniField label="ID dòng tồn (inventory)">
                                <span className="font-mono tabular-nums">#{row.inventoryId}</span>
                              </MiniField>
                              <MiniField label="Tồn khả dụng tại lô">
                                <span className="tabular-nums font-semibold">{row.availableQuantity}</span>
                              </MiniField>
                              <MiniField label="Số lô (batch)">{batchDisp}</MiniField>
                              <MiniField label="Hạn sử dụng">{hsdDisp}</MiniField>
                              <MiniField label="Đơn vị">
                                <span className="inline-flex items-center gap-1">
                                  <Scale className="size-3.5 text-slate-400 shrink-0" aria-hidden />
                                  {unitDisp}
                                </span>
                              </MiniField>
                              <MiniField label="Mã vạch">{barcodeDisp}</MiniField>
                              <MiniField label="Vị trí kho">
                                <span className="font-medium">
                                  {row.warehouseCode} / {row.shelfCode}
                                </span>
                              </MiniField>
                              <MiniField label="Giá snapshot (xuất)">{priceDisp}</MiniField>
                            </div>
                          </div>

                          <div className="xl:col-span-7 space-y-4 min-w-0">
                            <div className="space-y-2">
                              <Label className={FORM_LABEL_CLASS}>Chọn lô lấy ra (tồn kho)</Label>
                              {row.productId <= 0 ? (
                                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                                  Thiếu productId từ API — không tải được danh sách lô.
                                </p>
                              ) : options.length === 0 && !lotsLoading ? (
                                <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                                  Không có lô trong danh sách (kiểm tra quyền hoặc bộ lọc tồn).
                                </p>
                              ) : (
                                <Select
                                  value={String(row.inventoryId)}
                                  onValueChange={(v) => {
                                    const invId = Number.parseInt(v, 10)
                                    const inv = options.find((o) => o.id === invId)
                                    if (inv) {
                                      applyInventoryToLine(idx, inv, allowOverStock)
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-11 w-full text-left px-3 [&>span]:truncate [&>span]:block [&>span]:text-left">
                                    <SelectValue placeholder="Chọn lô (danh sách từ tồn theo SP)" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-[min(380px,55vh)] min-w-[var(--radix-select-trigger-width)] max-w-[min(420px,calc(100vw-2rem))] overflow-y-auto">
                                    {options.map((inv) => (
                                      <SelectItem
                                        key={inv.id}
                                        value={String(inv.id)}
                                        className="truncate py-2"
                                        title={fullLotOptionTitle(inv)}
                                      >
                                        {compactLotOptionLabel(inv)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>

                            <div className="flex flex-wrap items-end gap-4">
                              <div className="space-y-2 min-w-[140px]">
                                <Label className={FORM_LABEL_CLASS}>Số lượng xuất</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  className={`${FORM_INPUT_CLASS} h-11 text-right font-semibold tabular-nums max-w-[160px]`}
                                  value={row.quantity}
                                  onChange={(e) => {
                                    const v = parseInt(e.target.value, 10)
                                    const next = Number.isNaN(v) ? 1 : v
                                    const raw = Math.max(1, next)
                                    const capped = allowOverStock ? raw : Math.min(raw, row.availableQuantity)
                                    setLines((prev) =>
                                      prev.map((p, i) => (i === idx ? { ...p, quantity: capped } : p)),
                                    )
                                  }}
                                />
                              </div>
                              <p className="text-sm text-slate-500 pb-1 flex-1 min-w-[200px]">
                                Danh sách lô lấy từ API tồn theo sản phẩm; chọn một dòng để xem đầy đủ kệ, HSD, ĐVT và tồn bên trái.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        </div>

        <DialogFooter className="gap-2 sm:gap-0 shrink-0 border-t border-slate-200 bg-slate-50/50 px-6 py-4">
          <Button type="button" variant="outline" className="h-11 min-w-[100px]" onClick={() => onOpenChange(false)} disabled={busy}>
            Đóng
          </Button>
          {editable && (
            <Button type="button" className="h-11 min-w-[120px] bg-slate-900 text-white hover:bg-slate-800" disabled={busy} onClick={() => patchM.mutate()}>
              {busy ? "Đang lưu…" : "Lưu"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
