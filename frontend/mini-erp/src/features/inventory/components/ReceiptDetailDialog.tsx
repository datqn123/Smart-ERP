import React, { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency, formatDate } from "../utils"
import type { StockReceipt } from "../types"
import { StatusBadge } from "./StatusBadge"
import { Calendar, User, Building2, Hash, FileText, CheckCircle2, XCircle, Timer, ClipboardCheck, Boxes, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import {
  approveStockReceipt,
  rejectStockReceipt,
  STOCK_RECEIPT_APPROVE_LOCATION_OPTIONS,
  STOCK_RECEIPT_REJECT_REASON_MIN_LEN,
} from "../api/stockReceiptsApi"
import { ApiRequestError } from "@/lib/api/http"
import { toast } from "sonner"

interface ReceiptDetailDialogProps {
  receipt: StockReceipt | null;
  isOpen: boolean;
  onClose: () => void;
  canApprove?: boolean;
  /** Task015 — đang fetch `GET /api/v1/stock-receipts/{id}` để hiển thị dòng hàng. */
  isLoadingDetail?: boolean;
  /** Sau khi duyệt thành công — vd. `invalidateQueries` danh sách + chi tiết. */
  onAfterApprove?: (receiptId: number) => void | Promise<void>;
}

export function ReceiptDetailDialog({ receipt, isOpen, onClose, canApprove = false, isLoadingDetail = false, onAfterApprove }: ReceiptDetailDialogProps) {
  const [inboundLocationId, setInboundLocationId] = useState(1)
  const [approveBusy, setApproveBusy] = useState(false)
  const [rejectInlineOpen, setRejectInlineOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [rejectBusy, setRejectBusy] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setRejectInlineOpen(false)
      return
    }
    if (receipt) {
      setInboundLocationId(1)
      setApproveBusy(false)
      setRejectBusy(false)
      setRejectInlineOpen(false)
      setRejectReason("")
    }
  }, [isOpen, receipt?.id])

  if (!receipt) return null;

  const handleApprove = async () => {
    setApproveBusy(true)
    try {
      await approveStockReceipt(receipt.id, { inboundLocationId })
      toast.success("Đã phê duyệt phiếu nhập kho")
      await onAfterApprove?.(receipt.id)
      onClose()
    } catch (e) {
      if (e instanceof ApiRequestError) {
        toast.error(e.body?.message ?? "Không phê duyệt được phiếu nhập")
      } else {
        toast.error("Không phê duyệt được phiếu nhập")
      }
    } finally {
      setApproveBusy(false)
    }
  }

  const handleConfirmReject = async () => {
    const reason = rejectReason.trim()
    if (!reason) {
      toast.error("Vui lòng nhập lý do từ chối")
      return
    }
    if (reason.length < STOCK_RECEIPT_REJECT_REASON_MIN_LEN) {
      toast.error(`Lý do từ chối phải ghi rõ (tối thiểu ${STOCK_RECEIPT_REJECT_REASON_MIN_LEN} ký tự)`)
      return
    }
    setRejectBusy(true)
    try {
      await rejectStockReceipt(receipt.id, { reason })
      toast.success("Đã từ chối phiếu nhập kho")
      await onAfterApprove?.(receipt.id)
      setRejectInlineOpen(false)
      onClose()
    } catch (e) {
      if (e instanceof ApiRequestError) {
        toast.error(e.body?.message ?? "Không từ chối được phiếu nhập")
      } else {
        toast.error("Không từ chối được phiếu nhập")
      }
    } finally {
      setRejectBusy(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-full sm:max-w-5xl lg:max-w-5xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-slate-200 shadow-2xl rounded-2xl">
        <DialogHeader className="p-8 pb-4 bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="text-left">
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge status={receipt.status} />
                <span className="text-xs font-mono text-slate-400">Inventory ID: #{receipt.id}</span>
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                Phiếu nhập hàng <span className="text-slate-400 font-medium">#{receipt.receiptCode}</span>
              </DialogTitle>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2 font-medium">
                <Building2 size={14} className="text-slate-300" /> Nhà cung cấp: <span className="font-bold text-slate-900">{receipt.supplierName}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-right border-r pr-4 border-slate-100">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Số lượng</p>
                    <p className="text-sm font-black text-slate-900">{receipt.lineCount ?? receipt.details.length} <span className="text-[10px] text-slate-400">SKU</span></p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Giá trị nhập</p>
                    <p className="text-2xl font-black text-slate-900">{formatCurrency(receipt.totalAmount)}</p>
                </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 pt-6">
          {receipt.status === "Rejected" ? (
            <div className="mb-10 rounded-xl border border-red-200 bg-red-50/70 p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
                  <XCircle className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black uppercase tracking-widest text-red-800">Phiếu đã bị từ chối</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">Lý do từ chối</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-red-950/90">
                    {receipt.rejectionReason?.trim() ? receipt.rejectionReason.trim() : "Không ghi nhận lý do cụ thể trên hệ thống."}
                  </p>
                  {(receipt.reviewedByName || receipt.reviewedAt) && (
                    <p className="mt-3 text-xs text-slate-600">
                      {receipt.reviewedByName ? <span>Người xử lý: <span className="font-medium text-slate-800">{receipt.reviewedByName}</span></span> : null}
                      {receipt.reviewedAt ? (
                        <span className={receipt.reviewedByName ? " ml-2" : ""}>
                          · {formatDate(receipt.reviewedAt)}
                        </span>
                      ) : null}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-12 pt-4">
              <div className="relative flex justify-between">
                <div className="absolute top-1/2 left-0 z-0 h-0.5 w-full -translate-y-1/2 bg-slate-100" />
                <div
                  className={cn(
                    "absolute top-1/2 left-0 z-0 h-0.5 -translate-y-1/2 bg-slate-900 transition-all duration-700",
                    receipt.status === "Draft" ? "w-0" : receipt.status === "Pending" ? "w-1/2" : "w-full",
                  )}
                />
                <Step icon={Timer} label="Bản thảo" active />
                <Step icon={Activity} label="Chờ duyệt" active={["Pending", "Approved"].includes(receipt.status)} />
                <Step icon={CheckCircle2} label="Hoàn tất" active={receipt.status === "Approved"} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
            <div className="space-y-6">
                <SectionHeader icon={ClipboardCheck} title="Thông tin nghiệp vụ" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Ngày lập phiếu</p>
                        <p className="text-sm font-bold text-slate-900">{formatDate(receipt.createdAt)}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Ngày nhập kho</p>
                        <p className="text-sm font-bold text-slate-900">{formatDate(receipt.receiptDate)}</p>
                    </div>
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
                    <InfoLine icon={Hash} label="Số hóa đơn" value={receipt.invoiceNumber || "—"} />
                    <InfoLine icon={User} label="Nhân viên tạo" value={receipt.staffName} />
                </div>

                {receipt.notes && (
                    <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
                        <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <FileText size={12} /> Ghi chú nội bộ
                        </p>
                        <p className="text-sm text-amber-900 italic leading-relaxed">"{receipt.notes}"</p>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <SectionHeader icon={Boxes} title="Danh sách hàng hóa" />
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                  {canApprove && receipt.status === "Pending" && (
                    <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-end sm:justify-end sm:gap-4">
                      <div className="flex w-full flex-col gap-1.5 sm:max-w-[260px] sm:text-right">
                        <label
                          className="text-[10px] font-bold uppercase tracking-widest text-slate-500 sm:text-right"
                          htmlFor="receipt-detail-inbound-location"
                        >
                          Vị trí nhập kho
                        </label>
                        <Select
                          value={String(inboundLocationId)}
                          onValueChange={(v) => setInboundLocationId(parseInt(v, 10))}
                          disabled={approveBusy || rejectBusy}
                        >
                          <SelectTrigger id="receipt-detail-inbound-location" className="h-10 border-slate-200 bg-white sm:w-full">
                            <SelectValue placeholder="Chọn vị trí…" />
                          </SelectTrigger>
                          <SelectContent>
                            {STOCK_RECEIPT_APPROVE_LOCATION_OPTIONS.map((o) => (
                              <SelectItem key={o.id} value={String(o.id)}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-0">
                                <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-wider h-10">Sản phẩm</TableHead>
                                <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-wider h-10 text-right">SL</TableHead>
                                <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-wider h-10 text-right">Thành tiền</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {receipt.details.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="py-8 text-center text-sm text-slate-500">
                                        {isLoadingDetail
                                            ? "Đang tải chi tiết dòng hàng…"
                                            : (receipt.lineCount ?? 0) > 0
                                                ? "Không tải được danh sách dòng — thử đóng và mở lại phiếu."
                                                : "Không có dòng chi tiết trên phiếu này."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                receipt.details.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-slate-50/30 transition-colors border-slate-50">
                                        <TableCell className="py-3">
                                            <p className="font-bold text-slate-900">{item.productName}</p>
                                            <p className="text-[10px] text-slate-400 font-mono italic">{item.skuCode}</p>
                                        </TableCell>
                                        <TableCell className="py-3 text-right">
                                            <span className="font-bold text-slate-900">{item.quantity}</span>
                                            <span className="text-[10px] text-slate-400 ml-1">{item.unitName}</span>
                                        </TableCell>
                                        <TableCell className="py-3 text-right font-black text-slate-900">
                                            {item.lineTotal.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                  </Table>
                </div>

                <div className="p-5 bg-slate-900 rounded-2xl text-white shadow-xl">
                    <div className="flex justify-between items-center mb-1 opacity-60 text-[10px] uppercase tracking-widest font-bold">
                        <span>Giá trị hàng hóa</span>
                        <span>{formatCurrency(receipt.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4 text-[10px] uppercase tracking-widest font-bold opacity-60">
                        <span>Thuế & Phí</span>
                        <span>0 ₫</span>
                    </div>
                    <Separator className="bg-white/10 mb-4" />
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Tổng thanh toán</span>
                        <span className="text-2xl font-black">{formatCurrency(receipt.totalAmount)}</span>
                    </div>
                </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 p-6">
          <div className="flex w-full flex-col gap-4">
            {receipt.approvedByName && (
              <div className="flex items-center gap-3 sm:justify-end sm:text-right">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg">
                  <CheckCircle2 size={20} />
                </div>
                <div className="min-w-0 text-left sm:text-right">
                  <p className="mb-1 text-[10px] font-bold uppercase leading-none tracking-widest text-slate-400">Xác nhận nhập kho</p>
                  <p className="text-sm font-bold leading-none text-slate-900">
                    {receipt.approvedByName}{" "}
                    <span className="ml-1 font-normal text-slate-400">vào {formatDate(receipt.approvedAt!)}</span>
                  </p>
                </div>
              </div>
            )}

            {canApprove && receipt.status === "Pending" && (
              <>
                <div className="flex w-full min-h-[44px] flex-row flex-wrap items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-11 shrink-0 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700",
                      rejectInlineOpen && "bg-red-50/80 ring-2 ring-red-300",
                    )}
                    onClick={() => {
                      setRejectReason("")
                      setRejectInlineOpen((v) => !v)
                    }}
                    disabled={approveBusy || rejectBusy}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> {rejectInlineOpen ? "Đóng nhập lý do" : "Từ chối phiếu nhập"}
                  </Button>
                  <Button
                    type="button"
                    className="h-11 min-w-[180px] shrink-0 bg-slate-900 px-6 text-white shadow-lg hover:bg-slate-800"
                    onClick={() => void handleApprove()}
                    disabled={approveBusy || rejectBusy}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Duyệt phiếu
                  </Button>
                </div>

                {rejectInlineOpen && (
                  <div className="w-full max-w-2xl space-y-3 rounded-xl border border-red-200 bg-red-50/60 p-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Từ chối phiếu nhập</p>
                      <p className="mt-0.5 text-xs text-slate-600">
                        Nhập lý do rõ ràng (tối thiểu {STOCK_RECEIPT_REJECT_REASON_MIN_LEN} ký tự). « Xác nhận từ chối » gửi lên server.
                      </p>
                    </div>
                    <Textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Ví dụ: Số lượng không khớp hóa đơn gốc — cần đính kèm bằng chứng…"
                      disabled={rejectBusy}
                      className="min-h-[120px] bg-white text-sm"
                      minLength={STOCK_RECEIPT_REJECT_REASON_MIN_LEN}
                      maxLength={2000}
                      aria-label="Lý do từ chối"
                    />
                    <div className="flex flex-row flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 min-h-[44px] min-w-[88px]"
                        onClick={() => {
                          setRejectInlineOpen(false)
                          setRejectReason("")
                        }}
                        disabled={rejectBusy}
                      >
                        Hủy
                      </Button>
                      <Button
                        type="button"
                        className="h-11 min-h-[44px] min-w-[160px] bg-red-600 font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-60"
                        onClick={() => void handleConfirmReject()}
                        disabled={rejectBusy}
                      >
                        Xác nhận từ chối
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SectionHeader({ icon: Icon, title, className }: { icon: any, title: string, className?: string }) {
    return (
        <h3 className={cn(
            "flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 mb-4",
            className,
        )}>
            <div className="rounded-lg bg-slate-100 p-1.5"><Icon size={14} className="text-slate-900" /></div> {title}
        </h3>
    )
}

function InfoLine({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0">
            <div className="flex items-center gap-2 text-slate-400">
                <Icon size={14} />
                <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
            </div>
            <span className="text-sm font-bold text-slate-900">{value}</span>
        </div>
    )
}

function Step({ icon: Icon, label, active }: { icon: any, label: string, active?: boolean }) {
    return (
        <div className="flex flex-col items-center gap-2 relative z-10 group">
            <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500",
                active 
                    ? "bg-slate-900 border-slate-900 text-white shadow-[0_10px_20px_rgba(15,23,42,0.2)] scale-110" 
                    : "bg-white border-slate-100 text-slate-300"
            )}>
                <Icon size={18} />
            </div>
            <span className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                active ? "text-slate-900" : "text-slate-300"
            )}>{label}</span>
        </div>
    )
}
