import { describe, it, expect } from 'vitest';
import { mockInventory, mockInventoryKPIs } from './mockData';

describe('Mock Data - Inventory (Task004)', () => {
  describe('Inventory Items', () => {
    it('nên có đủ 8 sản phẩm mock', () => {
      expect(mockInventory).toHaveLength(8);
    });

    it('nên có computed fields isLowStock và isExpiringSoon', () => {
      const item = mockInventory[0];
      expect(item).toHaveProperty('isLowStock');
      expect(item).toHaveProperty('isExpiringSoon');
    });

    it('nên tính đúng isLowStock (quantity <= minQuantity)', () => {
      const lowStockItem = mockInventory.find(i => i.isLowStock);
      expect(lowStockItem).toBeDefined();
      if (lowStockItem) {
        expect(lowStockItem.quantity <= lowStockItem.minQuantity).toBe(true);
      }
    });

    it('nên tính đúng totalValue (quantity * costPrice)', () => {
      mockInventory.forEach(item => {
        const expectedValue = item.quantity * item.costPrice;
        expect(item.totalValue).toBe(expectedValue);
      });
    });
  });

  describe('KPI Calculations', () => {
    it('nên tính đúng totalSKUs', () => {
      expect(mockInventoryKPIs.totalSKUs).toBe(mockInventory.length);
    });

    it('nên tính đúng totalValue tổng', () => {
      const expectedTotal = mockInventory.reduce((sum, item) => sum + item.totalValue, 0);
      expect(mockInventoryKPIs.totalValue).toBe(expectedTotal);
    });

    it('nên đếm đúng lowStockCount', () => {
      const lowStockCount = mockInventory.filter(i => i.isLowStock).length;
      expect(mockInventoryKPIs.lowStockCount).toBe(lowStockCount);
    });

    it('nên đếm đúng expiringSoonCount', () => {
      const expiringSoonCount = mockInventory.filter(i => i.isExpiringSoon).length;
      expect(mockInventoryKPIs.expiringSoonCount).toBe(expiringSoonCount);
    });
  });
});

describe('Filter Logic (Task004)', () => {
  const filterByStatus = (status: string) => {
    switch (status) {
      case 'in-stock':
        return mockInventory.filter(i => !i.isLowStock && i.quantity > 0);
      case 'low-stock':
        return mockInventory.filter(i => i.isLowStock && i.quantity > 0);
      case 'out-of-stock':
        return mockInventory.filter(i => i.quantity === 0);
      default:
        return mockInventory;
    }
  };

  it('nên lọc đúng "in-stock"', () => {
    const result = filterByStatus('in-stock');
    expect(result.every(i => !i.isLowStock && i.quantity > 0)).toBe(true);
  });

  it('nên lọc đúng "low-stock"', () => {
    const result = filterByStatus('low-stock');
    expect(result.every(i => i.isLowStock && i.quantity > 0)).toBe(true);
  });

  it('nên lọc đúng "out-of-stock"', () => {
    const result = filterByStatus('out-of-stock');
    expect(result.every(i => i.quantity === 0)).toBe(true);
  });
});

describe('Search Logic (Task004)', () => {
  const searchInventory = (query: string) => {
    const q = query.toLowerCase();
    return mockInventory.filter(i => 
      i.productName.toLowerCase().includes(q) || 
      i.skuCode.toLowerCase().includes(q)
    );
  };

  it('nên tìm kiếm theo tên sản phẩm', () => {
    const result = searchInventory('sữa');
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(i => i.productName.toLowerCase().includes('sữa'))).toBe(true);
  });

  it('nên tìm kiếm theo SKU', () => {
    const result = searchInventory('SP001');
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(i => i.skuCode.toLowerCase().includes('sp001'))).toBe(true);
  });

  it('nên trả về mảng rỗng khi không có kết quả', () => {
    const result = searchInventory('xyz123');
    expect(result).toHaveLength(0);
  });
});