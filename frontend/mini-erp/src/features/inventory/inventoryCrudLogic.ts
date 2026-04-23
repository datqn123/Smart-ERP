import type { StockReceipt, StockDispatch, ReceiptDetailItem, DispatchItem, InventoryItem } from './types';
import { mockStockReceipts as defaultReceipts, mockStockDispatchs as defaultDispatches, mockInventory as defaultInventory } from './mockData';

// Shared mutable state - singleton pattern
class InventoryCrudStore {
  receipts: StockReceipt[] = [...defaultReceipts];
  dispatches: StockDispatch[] = [...defaultDispatches];
  inventory: InventoryItem[] = defaultInventory.map(i => ({ ...i }));
  
  reset() {
    this.receipts.length = 0;
    this.receipts.push(...defaultReceipts);
    this.dispatches.length = 0;
    this.dispatches.push(...defaultDispatches);
    this.inventory.length = 0;
    this.inventory.push(...defaultInventory.map(i => ({ ...i })));
  }
}

export const store = new InventoryCrudStore();

// Re-export getters
export const mockStockReceipts = {
  get value() { return store.receipts; },
  set value(v: StockReceipt[]) { store.receipts = v; }
};

export const mockStockDispatchs = {
  get value() { return store.dispatches; },
  set value(v: StockDispatch[]) { store.dispatches = v; }
};

export const mockInventory = {
  get value() { return store.inventory; },
  set value(v: InventoryItem[]) { store.inventory = v; }
};

// CRUD Functions
export interface CreateReceiptInput {
  supplierId: number;
  supplierName: string;
  receiptDate: string;
  invoiceNumber?: string;
  notes?: string;
  details: Omit<ReceiptDetailItem, 'id' | 'receiptId'>[];
}

export function createReceipt(input: CreateReceiptInput): StockReceipt {
  if (!input.supplierId || !input.supplierName) {
    throw new Error('Vui lòng chọn nhà cung cấp');
  }
  if (!input.details || input.details.length === 0) {
    throw new Error('Phiếu nhập phải có ít nhất 1 sản phẩm');
  }
  
  const newId = Math.max(0, ...store.receipts.map(r => r.id)) + 1;
  const year = new Date().getFullYear();
  const receiptCode = `PN-${year}-${String(newId).padStart(4, '0')}`;
  
  const details: ReceiptDetailItem[] = input.details.map((d, idx) => ({
    ...d,
    id: newId * 100 + idx,
    receiptId: newId,
    lineTotal: d.quantity * d.costPrice
  }));
  
  const totalAmount = details.reduce((sum, d) => sum + d.lineTotal, 0);
  
  const newReceipt: StockReceipt = {
    id: newId,
    receiptCode,
    supplierId: input.supplierId,
    supplierName: input.supplierName,
    staffId: 1,
    staffName: 'Nguyễn Văn A',
    receiptDate: input.receiptDate,
    status: 'Draft',
    invoiceNumber: input.invoiceNumber,
    totalAmount,
    notes: input.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    details
  };
  
  store.receipts.push(newReceipt);
  return newReceipt;
}

export function updateReceipt(id: number, input: Partial<CreateReceiptInput>): StockReceipt {
  const receipt = store.receipts.find(r => r.id === id);
  if (!receipt) {
    throw new Error('Không tìm thấy phiếu nhập');
  }
  if (receipt.status !== 'Draft') {
    throw new Error('Chỉ sửa được phiếu nháp');
  }
  
  if (input.details) {
    receipt.details = input.details.map((d, idx) => ({
      ...d,
      id: id * 100 + idx,
      receiptId: id,
      lineTotal: d.quantity * d.costPrice
    }));
    receipt.totalAmount = receipt.details.reduce((sum, d) => sum + d.lineTotal, 0);
  }
  if (input.supplierId) receipt.supplierId = input.supplierId;
  if (input.supplierName) receipt.supplierName = input.supplierName;
  if (input.receiptDate) receipt.receiptDate = input.receiptDate;
  if (input.invoiceNumber) receipt.invoiceNumber = input.invoiceNumber;
  if (input.notes !== undefined) receipt.notes = input.notes;
  receipt.updatedAt = new Date().toISOString();
  
  return receipt;
}

export function deleteReceipt(id: number): boolean {
  const idx = store.receipts.findIndex(r => r.id === id);
  if (idx === -1) {
    throw new Error('Không tìm thấy phiếu nhập');
  }
  if (store.receipts[idx].status !== 'Draft') {
    throw new Error('Chỉ xóa được phiếu nháp');
  }
  store.receipts.splice(idx, 1);
  return true;
}

export function submitReceiptForApproval(id: number): StockReceipt {
  const receipt = store.receipts.find(r => r.id === id);
  if (!receipt) {
    throw new Error('Không tìm thấy phiếu nhập');
  }
  if (receipt.status !== 'Draft') {
    throw new Error('Chỉ gửi duyệt được phiếu nháp');
  }
  receipt.status = 'Pending';
  receipt.updatedAt = new Date().toISOString();
  return receipt;
}

export function approveReceipt(id: number, approvedBy: number, approvedByName: string): StockReceipt {
  const receipt = store.receipts.find(r => r.id === id);
  if (!receipt) {
    throw new Error('Không tìm thấy phiếu nhập');
  }
  if (receipt.status !== 'Pending') {
    throw new Error('Chỉ phê duyệt được phiếu chờ duyệt');
  }
  
  receipt.status = 'Approved';
  receipt.approvedBy = approvedBy;
  receipt.approvedByName = approvedByName;
  receipt.approvedAt = new Date().toISOString();
  receipt.updatedAt = new Date().toISOString();
  
  for (const detail of receipt.details) {
    const invItem = store.inventory.find(i => i.productId === detail.productId);
    if (invItem) {
      invItem.quantity += detail.quantity;
      invItem.totalValue = invItem.quantity * invItem.costPrice;
    }
  }
  
  return receipt;
}

export function rejectReceipt(id: number, reason: string): StockReceipt {
  const receipt = store.receipts.find(r => r.id === id);
  if (!receipt) {
    throw new Error('Không tìm thấy phiếu nhập');
  }
  if (receipt.status !== 'Pending') {
    throw new Error('Chỉ từ chối được phiếu chờ duyệt');
  }
  receipt.status = 'Rejected';
  receipt.notes = (receipt.notes || '') + `\n[Lý do từ chối: ${reason}]`;
  receipt.updatedAt = new Date().toISOString();
  return receipt;
}

export interface CreateDispatchInput {
  orderId: number;
  orderCode: string;
  customerName: string;
  dispatchDate: string;
  notes?: string;
  items: Omit<DispatchItem, 'id' | 'dispatchId' | 'alreadyDispatchedQty' | 'remainingQty'>[];
}

export function createDispatch(input: CreateDispatchInput): StockDispatch {
  const newId = Math.max(0, ...store.dispatches.map(d => d.id)) + 1;
  const year = new Date().getFullYear();
  const dispatchCode = `PX-${year}-${String(newId).padStart(4, '0')}`;
  
  const items: DispatchItem[] = input.items.map((item, idx) => ({
    ...item,
    id: newId * 100 + idx,
    dispatchId: newId,
    alreadyDispatchedQty: 0,
    remainingQty: item.orderedQty,
    isFullyDispatched: item.dispatchQty === item.orderedQty
  }));
  
  const newDispatch: StockDispatch = {
    id: newId,
    dispatchCode,
    orderId: input.orderId,
    orderCode: input.orderCode,
    customerName: input.customerName,
    userId: 1,
    userName: 'Nguyễn Văn A',
    dispatchDate: input.dispatchDate,
    status: 'Pending',
    notes: input.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items
  };
  
  store.dispatches.push(newDispatch);
  return newDispatch;
}

export function confirmDispatch(id: number): StockDispatch {
  const dispatch = store.dispatches.find(d => d.id === id);
  if (!dispatch) {
    throw new Error('Không tìm thấy phiếu xuất');
  }
  if (dispatch.status !== 'Pending') {
    throw new Error('Chỉ xác nhận được phiếu chờ xuất');
  }
  
  const hasPartial = dispatch.items.some(i => !i.isFullyDispatched);
  dispatch.status = hasPartial ? 'Partial' : 'Full';
  dispatch.updatedAt = new Date().toISOString();
  
  for (const item of dispatch.items) {
    const invItem = store.inventory.find(i => i.productId === item.productId);
    if (invItem) {
      invItem.quantity -= item.dispatchQty;
      invItem.totalValue = invItem.quantity * invItem.costPrice;
    }
  }
  
  return dispatch;
}

export function cancelDispatch(id: number, reason: string): StockDispatch {
  const dispatch = store.dispatches.find(d => d.id === id);
  if (!dispatch) {
    throw new Error('Không tìm thấy phiếu xuất');
  }
  if (dispatch.status === 'Full') {
    throw new Error('Không thể hủy phiếu đã xuất');
  }
  dispatch.status = 'Cancelled';
  dispatch.notes = (dispatch.notes || '') + `\n[Lý do hủy: ${reason}]`;
  dispatch.updatedAt = new Date().toISOString();
  return dispatch;
}