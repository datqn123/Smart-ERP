import { describe, it, expect, beforeEach } from 'vitest';
import { mockStockDispatchs } from './mockData';
import type { StockDispatch, DispatchItem } from './types';

// ==========================================
// Picking List Tests (Task006)
// ==========================================

describe('Picking List Logic (Task006)', () => {
  const calculatePickingProgress = (items: DispatchItem[]) => {
    const picked = items.filter(i => i.dispatchQty > 0).length;
    const total = items.length;
    return {
      picked,
      total,
      percentage: total > 0 ? (picked / total) * 100 : 0,
    };
  };

  it('nên tính đúng picking progress', () => {
    mockStockDispatchs.forEach(dispatch => {
      const progress = calculatePickingProgress(dispatch.items);
      expect(progress.percentage).toBeGreaterThanOrEqual(0);
      expect(progress.percentage).toBeLessThanOrEqual(100);
    });
  });

  it('nên xác định đúng Fully Dispatched', () => {
    mockStockDispatchs.forEach(dispatch => {
      dispatch.items.forEach(item => {
        const expected = item.dispatchQty === item.remainingQty;
        expect(item.isFullyDispatched).toBe(expected);
      });
    });
  });
});

describe('Stock Availability Check (Task006)', () => {
  const checkAvailability = (dispatchQty: number, availableStock: number): { canDispatch: boolean; shortage: number } => {
    if (dispatchQty <= availableStock) {
      return { canDispatch: true, shortage: 0 };
    }
    return { canDispatch: false, shortage: dispatchQty - availableStock };
  };

  it('nên cho phép xuất khi đủ hàng', () => {
    expect(checkAvailability(10, 20).canDispatch).toBe(true);
    expect(checkAvailability(20, 20).canDispatch).toBe(true);
    expect(checkAvailability(20, 100).canDispatch).toBe(true);
  });

  it('nên chặn xuất khi không đủ hàng', () => {
    const result = checkAvailability(30, 20);
    expect(result.canDispatch).toBe(false);
    expect(result.shortage).toBe(10);
  });

  it('nên tính đúng số thiếu', () => {
    expect(checkAvailability(50, 45).shortage).toBe(5);
    expect(checkAvailability(100, 30).shortage).toBe(70);
  });
});

describe('Partial Dispatch Logic (Task006)', () => {
  const createPartialDispatch = (orderedQty: number, availableStock: number): { dispatchQty: number; backorderQty: number; status: string } => {
    const dispatchQty = Math.min(orderedQty, availableStock);
    const backorderQty = orderedQty - dispatchQty;
    const status = backorderQty > 0 ? 'Partial' : 'Full';

    return { dispatchQty, backorderQty, status };
  };

  it('nên tạo Full dispatch khi đủ hàng', () => {
    const result = createPartialDispatch(20, 30);
    expect(result.status).toBe('Full');
    expect(result.dispatchQty).toBe(20);
    expect(result.backorderQty).toBe(0);
  });

  it('nên tạo Partial dispatch khi không đủ hàng', () => {
    const result = createPartialDispatch(30, 20);
    expect(result.status).toBe('Partial');
    expect(result.dispatchQty).toBe(20);
    expect(result.backorderQty).toBe(10);
  });

  it('nên tính đúng backorderQty', () => {
    expect(createPartialDispatch(100, 45).backorderQty).toBe(55);
    expect(createPartialDispatch(50, 50).backorderQty).toBe(0);
  });
});

describe('Dispatch Validation (Task006)', () => {
  interface DispatchFormData {
    orderId: number;
    items: { productId: number; dispatchQty: number; availableStock: number }[];
    notes?: string;
  }

  const validateDispatchForm = (data: DispatchFormData): string[] => {
    const errors: string[] = [];

    if (!data.orderId || data.orderId <= 0) {
      errors.push('Đơn hàng là bắt buộc');
    }

    if (!data.items || data.items.length === 0) {
      errors.push('Phải có ít nhất 1 mặt hàng');
    }

    data.items.forEach((item, index) => {
      if (item.dispatchQty < 0) {
        errors.push(`Dòng ${index + 1}: Số lượng xuất không được âm`);
      }
      if (item.dispatchQty > item.availableStock) {
        errors.push(`Dòng ${index + 1}: Không đủ tồn kho (cần ${item.availableStock})`);
      }
    });

    return errors;
  };

  it('nên báo lỗi khi không chọn đơn hàng', () => {
    const data: DispatchFormData = { orderId: 0, items: [] };
    expect(validateDispatchForm(data)).toContain('Đơn hàng là bắt buộc');
  });

  it('nên báo lỗi khi xuất vượt tồn kho', () => {
    const data: DispatchFormData = {
      orderId: 1,
      items: [{ productId: 1, dispatchQty: 100, availableStock: 50 }],
    };
    const errors = validateDispatchForm(data);
    expect(errors.some(e => e.includes('Không đủ tồn kho'))).toBe(true);
  });

  it('nên hợp lệ khi dữ liệu đúng', () => {
    const data: DispatchFormData = {
      orderId: 1,
      items: [{ productId: 1, dispatchQty: 10, availableStock: 50 }],
    };
    expect(validateDispatchForm(data).length).toBe(0);
  });
});

describe('Dispatch Code Generation (Task006)', () => {
  const generateDispatchCode = (index: number): string => {
    const year = new Date().getFullYear();
    return `PX-${year}-${String(index).padStart(4, '0')}`;
  };

  it('nên sinh mã đúng định dạng', () => {
    expect(generateDispatchCode(1)).toBe('PX-2026-0001');
    expect(generateDispatchCode(12)).toBe('PX-2026-0012');
  });
});