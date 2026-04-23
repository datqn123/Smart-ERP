import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  type?: "receipt" | "dispatch" | "audit" | "inventory";
}

const receiptConfig: Record<string, { label: string; bg: string; text: string }> = {
  Draft: { label: "Nháp", bg: "bg-slate-100", text: "text-slate-600" },
  Pending: { label: "Chờ duyệt", bg: "bg-amber-50", text: "text-amber-700" },
  Approved: { label: "Đã duyệt", bg: "bg-green-50", text: "text-green-700" },
  Rejected: { label: "Từ chối", bg: "bg-red-50", text: "text-red-700" },
};

const dispatchConfig: Record<string, { label: string; bg: string; text: string }> = {
  Pending: { label: "Chờ xuất", bg: "bg-amber-50", text: "text-amber-700" },
  Full: { label: "Đủ hàng", bg: "bg-green-50", text: "text-green-700" },
  Partial: { label: "Một phần", bg: "bg-blue-50", text: "text-blue-700" },
  Cancelled: { label: "Đã hủy", bg: "bg-slate-100", text: "text-slate-600" },
};

const auditConfig: Record<string, { label: string; bg: string; text: string }> = {
  Pending: { label: "Chờ kiểm", bg: "bg-amber-50", text: "text-amber-700" },
  "In Progress": { label: "Đang kiểm", bg: "bg-blue-50", text: "text-blue-700" },
  Completed: { label: "Hoàn thành", bg: "bg-green-50", text: "text-green-700" },
  Cancelled: { label: "Đã hủy", bg: "bg-slate-100", text: "text-slate-600" },
};

const inventoryConfig: Record<string, { label: string; bg: string; text: string }> = {
  "in-stock": { label: "Còn hàng", bg: "bg-green-50", text: "text-green-700" },
  "low-stock": { label: "Sắp hết", bg: "bg-red-50", text: "text-red-700" },
  "out-of-stock": { label: "Hết hàng", bg: "bg-red-100", text: "text-red-800" },
  "expiring-soon": { label: "Cận date", bg: "bg-amber-50", text: "text-amber-700" },
};

export function StatusBadge({ status, type = "receipt" }: StatusBadgeProps) {
  const configMap = {
    receipt: receiptConfig,
    dispatch: dispatchConfig,
    audit: auditConfig,
    inventory: inventoryConfig,
  };

  const config = configMap[type][status] || { label: status, bg: "bg-slate-100", text: "text-slate-600" };

  return (
    <Badge className={`${config.bg} ${config.text} font-medium text-xs px-2.5 py-1`}>
      {config.label}
    </Badge>
  );
}
