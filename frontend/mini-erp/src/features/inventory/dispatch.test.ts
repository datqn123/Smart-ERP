import { describe, it, expect } from 'vitest';
import { mockStockDispatchs } from './mockData';

describe('Mock Data - Stock Dispatch (Task006)', () => {
  describe('Dispatch Statuses', () => {
    it('nên có đủ các trạng thái', () => {
      const statuses = new Set(mockStockDispatchs.map(d => d.status));
      expect(statuses.has('Pending')).toBe(true);
      expect(statuses.has('Full')).toBe(true);
      expect(statuses.has('Partial')).toBe(true);
    });

    it('nên có dispatch Full', () => {
      const full = mockStockDispatchs.find(d => d.status === 'Full');
      expect(full).toBeDefined();
    });

    it('nên có dispatch Partial', () => {
      const partial = mockStockDispatchs.find(d => d.status === 'Partial');
      expect(partial).toBeDefined();
    });

    it('nên có dispatch Pending', () => {
      const pending = mockStockDispatchs.find(d => d.status === 'Pending');
      expect(pending).toBeDefined();
    });
  });

  describe('Picking Logic (Task006)', () => {
    it('nên tính đúng remainingQty', () => {
      mockStockDispatchs.forEach(dispatch => {
        dispatch.items.forEach(item => {
          const expected = item.orderedQty - item.alreadyDispatchedQty;
          expect(item.remainingQty).toBe(expected);
        });
      });
    });

    it('nên xác định đúng isFullyDispatched', () => {
      mockStockDispatchs.forEach(dispatch => {
        dispatch.items.forEach(item => {
          const expected = item.dispatchQty === item.remainingQty;
          expect(item.isFullyDispatched).toBe(expected);
        });
      });
    });
  });

  describe('Stock Availability Check (Task006)', () => {
    const canDispatch = (dispatchQty: number, availableStock: number) => {
      return dispatchQty <= availableStock;
    };

    it('nên cho phép xuất khi đủ hàng', () => {
      expect(canDispatch(10, 20)).toBe(true);
      expect(canDispatch(20, 20)).toBe(true);
    });

    it('nên chặn xuất khi không đủ hàng', () => {
      expect(canDispatch(30, 20)).toBe(false);
    });

    it('nên tạo partial dispatch khi không đủ', () => {
      const partialDispatch = mockStockDispatchs.find(d => d.status === 'Partial');
      expect(partialDispatch).toBeDefined();
      
      if (partialDispatch) {
        const hasPartial = partialDispatch.items.some(item => !item.isFullyDispatched);
        expect(hasPartial).toBe(true);
      }
    });
  });

  describe('Dispatch Code Format (Task006)', () => {
    it('nên đúng định dạng PX-YYYY-NNNN', () => {
      mockStockDispatchs.forEach(dispatch => {
        expect(dispatch.dispatchCode).toMatch(/^PX-\d{4}-\d{4}$/);
      });
    });
  });

  describe('Picking List Location (Task006)', () => {
    it('nên có warehouseLocation cho mỗi item', () => {
      mockStockDispatchs.forEach(dispatch => {
        dispatch.items.forEach(item => {
          expect(item.warehouseLocation).toBeDefined();
          expect(item.shelfCode).toBeDefined();
        });
      });
    });
  });
});