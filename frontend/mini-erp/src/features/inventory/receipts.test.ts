import { describe, it, expect } from 'vitest';
import { mockStockReceipts } from './mockData';

describe('Mock Data - Stock Receipts (Task005)', () => {
  describe('Receipt Statuses', () => {
    it('nên có đủ 4 trạng thái', () => {
      const statuses = new Set(mockStockReceipts.map(r => r.status));
      expect(statuses.has('Draft')).toBe(true);
      expect(statuses.has('Pending')).toBe(true);
      expect(statuses.has('Approved')).toBe(true);
      expect(statuses.has('Rejected')).toBe(true);
    });

    it('nên có phiếu Draft', () => {
      const draft = mockStockReceipts.find(r => r.status === 'Draft');
      expect(draft).toBeDefined();
      expect(draft?.approvedBy).toBeUndefined();
    });

    it('nên có phiếu Pending', () => {
      const pending = mockStockReceipts.find(r => r.status === 'Pending');
      expect(pending).toBeDefined();
      expect(pending?.approvedBy).toBeUndefined();
    });

    it('nên có phiếu Approved', () => {
      const approved = mockStockReceipts.find(r => r.status === 'Approved');
      expect(approved).toBeDefined();
      expect(approved?.approvedBy).toBeDefined();
      expect(approved?.approvedAt).toBeDefined();
    });

    it('nên có phiếu Rejected', () => {
      const rejected = mockStockReceipts.find(r => r.status === 'Rejected');
      expect(rejected).toBeDefined();
      expect(rejected?.approvedBy).toBeDefined();
    });
  });

  describe('Workflow Logic (Task005)', () => {
    const canEdit = (status: string) => {
      return status === 'Draft' || status === 'Pending';
    };

    const canApprove = (status: string) => {
      return status === 'Pending';
    };

    it('nên cho phép sửa Draft và Pending', () => {
      expect(canEdit('Draft')).toBe(true);
      expect(canEdit('Pending')).toBe(true);
      expect(canEdit('Approved')).toBe(false);
      expect(canEdit('Rejected')).toBe(false);
    });

    it('nên chỉ cho phép duyệt Pending', () => {
      expect(canApprove('Pending')).toBe(true);
      expect(canApprove('Draft')).toBe(false);
      expect(canApprove('Approved')).toBe(false);
    });
  });

  describe('Line Total Calculation (Task005)', () => {
    it('nên tính đúng lineTotal (quantity * costPrice)', () => {
      mockStockReceipts.forEach(receipt => {
        receipt.details.forEach(detail => {
          const expected = detail.quantity * detail.costPrice;
          expect(detail.lineTotal).toBe(expected);
        });
      });
    });

    it('nên có totalAmount trong mock data', () => {
      mockStockReceipts.forEach(receipt => {
        expect(receipt.totalAmount).toBeDefined();
        expect(typeof receipt.totalAmount).toBe('number');
      });
    });
  });

  describe('Receipt Code Format (Task005)', () => {
    it('nên đúng định dạng PN-YYYY-NNNN', () => {
      mockStockReceipts.forEach(receipt => {
        expect(receipt.receiptCode).toMatch(/^PN-\d{4}-\d{4}$/);
      });
    });
  });
});