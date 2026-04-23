// ==========================================
// Inventory Feature Types
// ==========================================

// --- Inventory Stock (Task004) ---

export interface InventoryItem {
  id: number;
  productId: number;
  productName: string;
  skuCode: string;
  locationId: number;
  warehouseCode: string;
  shelfCode: string;
  batchNumber?: string;
  expiryDate?: string; // ISO date string
  quantity: number;
  minQuantity: number;
  unitName: string;
  costPrice: number;
  updatedAt: string;
  // Computed
  isLowStock: boolean;
  isExpiringSoon: boolean;
  totalValue: number; // quantity * costPrice
  status?: 'Draft' | 'Active';
}

export interface InventoryFilters {
  search: string;
  status: "all" | "in-stock" | "low-stock" | "out-of-stock";
  locationId?: number;
  categoryId?: number;
}

export interface InventoryKPIs {
  totalSKUs: number;
  totalValue: number;
  lowStockCount: number;
  expiringSoonCount: number;
}

// --- Stock Receipts (Task005) ---

export type ReceiptStatus = "Draft" | "Pending" | "Approved" | "Rejected";

export interface ReceiptDetailItem {
  id: number;
  receiptId: number;
  productId: number;
  productName: string;
  skuCode: string;
  unitId: number;
  unitName: string;
  quantity: number;
  costPrice: number;
  batchNumber?: string;
  expiryDate?: string;
  lineTotal: number;
}

export interface StockReceipt {
  id: number;
  receiptCode: string; // PN-2026-0001
  supplierId: number;
  supplierName: string;
  staffId: number;
  staffName: string;
  receiptDate: string;
  status: ReceiptStatus;
  invoiceNumber?: string;
  totalAmount: number;
  notes?: string;
  approvedBy?: number;
  approvedByName?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  details: ReceiptDetailItem[];
}

// --- Stock Dispatch (Task006) ---

export type DispatchStatus = "Pending" | "Full" | "Partial" | "Cancelled";

export interface DispatchItem {
  id: number;
  dispatchId: number;
  orderDetailId: number;
  productId: number;
  productName: string;
  skuCode: string;
  unitId: number;
  unitName: string;
  orderedQty: number;
  alreadyDispatchedQty: number;
  remainingQty: number;
  dispatchQty: number;
  warehouseLocation: string;
  shelfCode: string;
  batchNumber?: string;
  availableStock: number;
  isFullyDispatched: boolean;
}

export interface StockDispatch {
  id: number;
  dispatchCode: string; // PX-2026-0001
  orderId: number;
  orderCode: string;
  customerName: string;
  userId: number;
  userName: string;
  dispatchDate: string;
  status: DispatchStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: DispatchItem[];
}

// --- Inventory Audit (Task007) ---

export type AuditStatus = "Pending" | "In Progress" | "Completed" | "Cancelled";

export interface AuditItem {
  id: number;
  auditSessionId: number;
  productId: number;
  productName: string;
  skuCode: string;
  unitName: string;
  locationId: number;
  warehouseCode: string;
  shelfCode: string;
  batchNumber?: string;
  systemQuantity: number;
  actualQuantity?: number;
  variance: number;
  variancePercent: number;
  isCounted: boolean;
  notes?: string;
}

export interface AuditSession {
  id: number;
  auditCode: string; // KK-2026-0001
  title: string;
  auditDate: string;
  status: AuditStatus;
  locationFilter?: string;
  categoryFilter?: string;
  notes?: string;
  createdBy: number;
  createdByName: string;
  completedAt?: string;
  completedByName?: string;
  createdAt: string;
  updatedAt: string;
  items: AuditItem[];
}

export interface AdjustmentRecord {
  id: number;
  auditItemId: number;
  productId: number;
  adjustmentQty: number;
  reason: string;
  approvedBy?: number;
  approvedAt?: string;
  createdAt: string;
}

export interface AuditSummary {
  totalItems: number;
  countedItems: number;
  uncountedItems: number;
  varianceItems: number;
  totalVarianceValue: number;
}
