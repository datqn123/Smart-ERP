import { describe, it, expect, beforeEach } from 'vitest';
import { 
  createReceipt, 
  updateReceipt, 
  deleteReceipt, 
  submitReceiptForApproval,
  approveReceipt, 
  rejectReceipt,
  createDispatch,
  confirmDispatch,
  cancelDispatch,
  store
} from './inventoryCrudLogic';

describe('inventoryCrudLogic - Inbound Receipts', () => {
  beforeEach(() => {
    store.reset();
  });

  describe('createReceipt', () => {
    it('should create a new receipt with status Draft', () => {
      const receipt = createReceipt({
        supplierId: 10,
        supplierName: 'Test Supplier',
        receiptDate: '2026-04-15',
        invoiceNumber: 'INV-001',
        notes: 'Test',
        details: [{ productId: 1, productName: 'Sữa', skuCode: 'SP001', unitId: 1, unitName: 'Hộp', quantity: 10, costPrice: 25000 }]
      });
      
      expect(receipt).toBeDefined();
      expect(receipt.status).toBe('Draft');
      expect(receipt.receiptCode).toMatch(/^PN-\d{4}-\d{4}$/);
      expect(receipt.totalAmount).toBe(250000);
    });

    it('should throw error when supplier not selected', () => {
      expect(() => createReceipt({
        supplierId: 0,
        supplierName: '',
        receiptDate: '2026-04-15',
        details: []
      })).toThrow('Vui lòng chọn nhà cung cấp');
    });

    it('should throw error when no details', () => {
      expect(() => createReceipt({
        supplierId: 1,
        supplierName: 'Test',
        receiptDate: '2026-04-15',
        details: []
      })).toThrow('Phiếu nhập phải có ít nhất 1 sản phẩm');
    });
  });

  describe('updateReceipt', () => {
    it('should update a Draft receipt', () => {
      const updated = updateReceipt(3, { notes: 'Updated note' });
      expect(updated.notes).toBe('Updated note');
      expect(updated.status).toBe('Draft');
    });

    it('should throw error when updating non-Draft receipt', () => {
      expect(() => updateReceipt(2, { notes: 'Updated' })).toThrow('Chỉ sửa được phiếu nháp');
    });

    it('should throw error when receipt not found', () => {
      expect(() => updateReceipt(999, { notes: 'Test' })).toThrow('Không tìm thấy phiếu nhập');
    });
  });

  describe('deleteReceipt', () => {
    it('should delete a Draft receipt', () => {
      const result = deleteReceipt(3);
      expect(result).toBe(true);
    });

    it('should throw error when deleting non-Draft receipt', () => {
      expect(() => deleteReceipt(2)).toThrow('Chỉ xóa được phiếu nháp');
    });
  });

  describe('submitReceiptForApproval', () => {
    it('should submit Draft receipt for approval', () => {
      const submitted = submitReceiptForApproval(3);
      expect(submitted.status).toBe('Pending');
    });

    it('should throw error when submitting non-Draft', () => {
      expect(() => submitReceiptForApproval(2)).toThrow('Chỉ gửi duyệt được phiếu nháp');
    });
  });

  describe('approveReceipt', () => {
    it('should approve Pending receipt and update inventory', () => {
      // Ensure we have a Pending receipt for testing
      const receipt = store.receipts.find(r => r.id === 2);
      if (receipt) receipt.status = 'Pending';
      
      const originalQty = store.inventory[1].quantity; // productId: 2
      const approved = approveReceipt(2, 1, 'Owner');
      expect(approved.status).toBe('Approved');
      expect(approved.approvedBy).toBe(1);
      expect(store.inventory[1].quantity).toBe(originalQty + 100);
    });

    it('should throw error when approving non-Pending receipt', () => {
      const receipt = store.receipts.find(r => r.id === 1);
      if (receipt) receipt.status = 'Approved';
      expect(() => approveReceipt(1, 1, 'Owner')).toThrow('Chỉ phê duyệt được phiếu chờ duyệt');
    });
  });

  describe('rejectReceipt', () => {
    it('should reject Pending receipt with reason', () => {
      const receipt = store.receipts.find(r => r.id === 2);
      if (receipt) receipt.status = 'Pending';
      const rejected = rejectReceipt(2, 'Sai đơn giá');
      expect(rejected.status).toBe('Rejected');
      expect(rejected.notes).toContain('Sai đơn giá');
    });

    it('should throw error when rejecting non-Pending receipt', () => {
      expect(() => rejectReceipt(1, 'Reason')).toThrow('Chỉ từ chối được phiếu chờ duyệt');
    });
  });
});

describe('inventoryCrudLogic - Dispatch', () => {
  beforeEach(() => {
    store.reset();
  });

  describe('createDispatch', () => {
    it('should create a new dispatch with status Pending', () => {
      const dispatch = createDispatch({
        orderId: 1,
        orderCode: 'SO-001',
        customerName: 'Khách A',
        dispatchDate: '2026-04-15',
        items: [{ orderDetailId: 1, productId: 1, productName: 'Sữa', skuCode: 'SP001', unitId: 1, unitName: 'Hộp', orderedQty: 10, dispatchQty: 10, warehouseLocation: 'WH01', shelfCode: 'A1', availableStock: 100, isFullyDispatched: true }]
      });
      expect(dispatch).toBeDefined();
      expect(dispatch.status).toBe('Pending');
      expect(dispatch.dispatchCode).toMatch(/^PX-\d{4}-\d{4}$/);
    });
  });

  describe('confirmDispatch', () => {
    it('should confirm dispatch and update inventory', () => {
      // Ensure id: 1 is Pending for test
      const dispatch = store.dispatches.find(d => d.id === 1);
      if (dispatch) dispatch.status = 'Pending';
      
      const originalQty = store.inventory[0].quantity; // productId: 1
      const confirmed = confirmDispatch(1);
      expect(confirmed.status).toBe('Full');
      expect(store.inventory[0].quantity).toBe(originalQty - 20); // mockData[0] for dispatch 1 is 20 units
    });

    it('should throw error when confirming non-Pending dispatch', () => {
      const dispatch = store.dispatches.find(d => d.id === 2);
      if (dispatch) dispatch.status = 'Full';
      expect(() => confirmDispatch(2)).toThrow('Chỉ xác nhận được phiếu chờ xuất');
    });
  });

  describe('cancelDispatch', () => {
    it('should cancel Pending dispatch', () => {
      const dispatch = store.dispatches.find(d => d.id === 1);
      if (dispatch) dispatch.status = 'Pending';
      const cancelled = cancelDispatch(1, 'Khách hủy đơn');
      expect(cancelled.status).toBe('Cancelled');
      expect(cancelled.notes).toContain('Khách hủy đơn');
    });

    it('should throw error when cancelling Full dispatch', () => {
      const dispatch = store.dispatches.find(d => d.id === 2);
      if (dispatch) dispatch.status = 'Full';
      expect(() => cancelDispatch(2, 'Reason')).toThrow('Không thể hủy phiếu đã xuất');
    });
  });
});