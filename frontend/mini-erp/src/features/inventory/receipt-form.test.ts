import { describe, it, expect, beforeEach } from 'vitest';
import { mockStockReceipts, StockReceipt, ReceiptDetailItem } from './types';

// ==========================================
// Form Validation Tests (Task005)
// ==========================================

describe('Receipt Form Validation (Task005)', () => {
  interface ReceiptFormData {
    supplierId: number;
    receiptDate: string;
    invoiceNumber?: string;
    notes?: string;
    details: ReceiptDetailItem[];
  }

  const validateReceiptForm = (data: ReceiptFormData): string[] => {
    const errors: string[] = [];

    // Required fields
    if (!data.supplierId || data.supplierId <= 0) {
      errors.push('Nhà cung cấp là bắt buộc');
    }

    if (!data.receiptDate) {
      errors.push('Ngày nhập là bắt buộc');
    } else {
      const receiptDate = new Date(data.receiptDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (receiptDate > today) {
        errors.push('Ngày nhập không được là ngày trong tương lai');
      }
    }

    // Details validation
    if (!data.details || data.details.length === 0) {
      errors.push('Phải có ít nhất 1 dòng hàng hóa');
    }

    data.details.forEach((detail, index) => {
      if (detail.quantity <= 0) {
        errors.push(`Dòng ${index + 1}: Số lượng phải lớn hơn 0`);
      }
      if (detail.costPrice < 0) {
        errors.push(`Dòng ${index + 1}: Đơn giá không được âm`);
      }
    });

    return errors;
  };

  it('nên báo lỗi khi không chọn nhà cung cấp', () => {
    const data: ReceiptFormData = {
      supplierId: 0,
      receiptDate: '2026-04-13',
      details: [{ id: 1, receiptId: 1, productId: 1, productName: 'Test', skuCode: 'T001', unitId: 1, unitName: 'Cái', quantity: 10, costPrice: 10000, lineTotal: 100000 }],
    };
    const errors = validateReceiptForm(data);
    expect(errors).toContain('Nhà cung cấp là bắt buộc');
  });

  it('nên báo lỗi khi ngày nhập là ngày tương lai', () => {
    const data: ReceiptFormData = {
      supplierId: 1,
      receiptDate: '2030-01-01',
      details: [{ id: 1, receiptId: 1, productId: 1, productName: 'Test', skuCode: 'T001', unitId: 1, unitName: 'Cái', quantity: 10, costPrice: 10000, lineTotal: 100000 }],
    };
    const errors = validateReceiptForm(data);
    expect(errors).toContain('Ngày nhập không được là ngày trong tương lai');
  });

  it('nên báo lỗi khi không có dòng hàng hóa', () => {
    const data: ReceiptFormData = {
      supplierId: 1,
      receiptDate: '2026-04-13',
      details: [],
    };
    const errors = validateReceiptForm(data);
    expect(errors).toContain('Phải có ít nhất 1 dòng hàng hóa');
  });

  it('nên báo lỗi khi số lượng <= 0', () => {
    const data: ReceiptFormData = {
      supplierId: 1,
      receiptDate: '2026-04-13',
      details: [{ id: 1, receiptId: 1, productId: 1, productName: 'Test', skuCode: 'T001', unitId: 1, unitName: 'Cái', quantity: 0, costPrice: 10000, lineTotal: 0 }],
    };
    const errors = validateReceiptForm(data);
    expect(errors.some(e => e.includes('Số lượng phải lớn hơn 0'))).toBe(true);
  });

  it('nên hợp lệ khi dữ liệu đầy đủ', () => {
    const data: ReceiptFormData = {
      supplierId: 1,
      receiptDate: '2026-04-13',
      details: [{ id: 1, receiptId: 1, productId: 1, productName: 'Test', skuCode: 'T001', unitId: 1, unitName: 'Cái', quantity: 10, costPrice: 10000, lineTotal: 100000 }],
    };
    const errors = validateReceiptForm(data);
    expect(errors.length).toBe(0);
  });
});

describe('Workflow Tests (Task005)', () => {
  type ReceiptStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected';

  const getNextActions = (currentStatus: ReceiptStatus): string[] => {
    switch (currentStatus) {
      case 'Draft':
        return ['save_draft', 'submit'];
      case 'Pending':
        return ['approve', 'reject'];
      case 'Approved':
      case 'Rejected':
        return ['view'];
      default:
        return [];
    }
  };

  const canEdit = (currentStatus: ReceiptStatus): boolean => {
    return currentStatus === 'Draft' || currentStatus === 'Pending';
  };

  const canApprove = (currentStatus: ReceiptStatus): boolean => {
    return currentStatus === 'Pending';
  };

  it('nên có action đúng cho Draft', () => {
    const actions = getNextActions('Draft');
    expect(actions).toContain('save_draft');
    expect(actions).toContain('submit');
  });

  it('nên có action đúng cho Pending', () => {
    const actions = getNextActions('Pending');
    expect(actions).toContain('approve');
    expect(actions).toContain('reject');
  });

  it('nên không cho phép edit Approved', () => {
    expect(canEdit('Approved')).toBe(false);
  });

  it('nên không cho phép edit Rejected', () => {
    expect(canEdit('Rejected')).toBe(false);
  });

  it('nên chỉ cho phép duyệt Pending', () => {
    expect(canApprove('Pending')).toBe(true);
    expect(canApprove('Draft')).toBe(false);
    expect(canApprove('Approved')).toBe(false);
  });
});

describe('Code Generation Tests (Task005)', () => {
  const generateReceiptCode = (index: number): string => {
    const year = new Date().getFullYear();
    return `PN-${year}-${String(index).padStart(4, '0')}`;
  };

  it('nên sinh mã đúng định dạng cho index 1', () => {
    expect(generateReceiptCode(1)).toBe('PN-2026-0001');
  });

  it('nên sinh mã đúng định dạng cho index 12', () => {
    expect(generateReceiptCode(12)).toBe('PN-2026-0012');
  });

  it('nên sinh mã đúng định dạng cho index 123', () => {
    expect(generateReceiptCode(123)).toBe('PN-2026-0123');
  });
});

describe('Line Total Auto-Calculation (Task005)', () => {
  const calculateLineTotal = (quantity: number, costPrice: number): number => {
    return quantity * costPrice;
  };

  const calculateTotalAmount = (details: { quantity: number; costPrice: number }[]): number => {
    return details.reduce((sum, detail) => sum + calculateLineTotal(detail.quantity, detail.costPrice), 0);
  };

  it('nên tính đúng lineTotal', () => {
    expect(calculateLineTotal(10, 25000)).toBe(250000);
  });

  it('nên tính đúng totalAmount', () => {
    const details = [
      { quantity: 10, costPrice: 25000 },
      { quantity: 5, costPrice: 30000 },
    ];
    expect(calculateTotalAmount(details)).toBe(400000);
  });
});