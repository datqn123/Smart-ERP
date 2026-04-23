import { MapPin, Printer, CheckCircle2, XCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "../utils";
import type { StockDispatch, DispatchItem } from "../types";

interface DispatchDetailPanelProps {
  dispatch: StockDispatch | null;
  isOpen: boolean;
  onClose: () => void;
  canApprove?: boolean;
}

function PickingList({ items }: { items: DispatchItem[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm flex items-center gap-2 text-slate-900">
        <MapPin className="h-4 w-4 text-slate-500" /> Danh sách lấy hàng (Picking List)
      </h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-sm text-slate-900">{item.productName}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{item.skuCode}</p>
              </div>
              <Badge variant={item.isFullyDispatched ? "default" : "outline"} className={item.isFullyDispatched ? "bg-green-100 text-green-700 border-none" : ""}>
                {item.isFullyDispatched ? "✓ Đủ hàng" : "● Một phần"}
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-3">
              <div className="bg-white p-2 border border-slate-100 rounded shadow-sm">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Vị trí kho</p>
                <p className="font-bold text-lg text-slate-900 leading-none">
                  {item.warehouseLocation}-{item.shelfCode}
                </p>
              </div>
              <div className="bg-green-50/50 p-2 border border-green-100 rounded shadow-sm">
                <p className="text-[10px] uppercase tracking-wider text-green-600 font-bold mb-1">Cần xuất</p>
                <p className="font-bold text-lg text-green-700 leading-none">
                   {item.dispatchQty}
                   <span className="text-xs font-medium ml-1">{item.unitName}</span>
                </p>
              </div>
              <div className="bg-blue-50/50 p-2 border border-blue-100 rounded shadow-sm">
                <p className="text-[10px] uppercase tracking-wider text-blue-600 font-bold mb-1">Tồn k.dụng</p>
                <p className="font-bold text-lg text-blue-700 leading-none">
                   {item.availableStock}
                   <span className="text-xs font-medium ml-1">{item.unitName}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DispatchDetailPanel({ dispatch, isOpen, onClose, canApprove = false }: DispatchDetailPanelProps) {
  if (!dispatch) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto p-6">
        <SheetHeader className="pb-6 border-b border-slate-100 mb-6">
          <div className="flex items-center justify-between mb-3">
            <StatusBadge status={dispatch.status} type="dispatch" />
            <div className="flex gap-2">
              <span className="text-xs text-slate-400">ID: {dispatch.id}</span>
            </div>
          </div>
          <SheetTitle className="text-xl font-bold text-slate-900">
            Phiếu xuất: {dispatch.dispatchCode}
          </SheetTitle>
          <SheetDescription className="text-slate-500">
            Khách hàng: <span className="font-medium text-slate-900">{dispatch.customerName}</span> • 
            Đơn hàng: <span className="font-medium text-slate-900">{dispatch.orderCode}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8">
          {/* Thông tin phiếu */}
          <section className="grid grid-cols-2 gap-y-6 gap-x-4">
            <DetailItem label="Ngày xuất hàng" value={formatDate(dispatch.dispatchDate)} />
            <DetailItem label="Người thực hiện" value={dispatch.userName} />
            <DetailItem label="Số lượng SKU" value={`${dispatch.items.length} mặt hàng`} />
            <DetailItem label="Ghi chú" value={dispatch.notes || "—"} className="col-span-2" />
          </section>

          {/* Picking List */}
          <PickingList items={dispatch.items} />

          {/* Actions */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-3">
            <Button variant="outline" className="flex-1 h-11 border-slate-200 hover:bg-slate-50 text-slate-700">
              <Printer className="h-4 w-4 mr-2" /> In phiếu xuất
            </Button>
            
            {canApprove && dispatch.status === "Pending" && (
              <>
                <Button className="flex-1 h-11 bg-green-600 hover:bg-green-700 text-white border-none shadow-sm shadow-green-200">
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Hoàn tất xuất kho
                </Button>
                <Button variant="outline" className="h-11 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                  <XCircle className="h-4 w-4 mr-2" /> Hủy phiếu
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DetailItem({ label, value, className }: { label: string, value: string, className?: string }) {
  return (
    <div className={className}>
      <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
