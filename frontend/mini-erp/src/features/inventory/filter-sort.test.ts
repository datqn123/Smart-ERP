import { describe, it, expect, beforeEach } from 'vitest';
import { mockInventory, mockInventoryKPIs } from './mockData';
import type { InventoryItem, InventoryFilters } from './types';

// ==========================================
// Filter & Search Tests (Task004)
// ==========================================

describe('Inventory Filter Logic (Task004)', () => {
  let filters: InventoryFilters;

  beforeEach(() => {
    filters = { search: '', status: 'all' };
  });

  const applyFilters = (items: InventoryItem[], filters: InventoryFilters) => {
    let result = [...items];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(item =>
        item.productName.toLowerCase().includes(q) ||
        item.skuCode.toLowerCase().includes(q)
      );
    }

    if (filters.status && filters.status !== 'all') {
      result = result.filter(item => {
        switch (filters.status) {
          case 'in-stock':
            return !item.isLowStock && item.quantity > 0;
          case 'low-stock':
            return item.isLowStock && item.quantity > 0;
          case 'out-of-stock':
            return item.quantity === 0;
          default:
            return true;
        }
      });
    }

    return result;
  };

  it('nên lọc tất cả khi status = all', () => {
    const result = applyFilters(mockInventory, { ...filters, status: 'all' });
    expect(result.length).toBe(mockInventory.length);
  });

  it('nên lọc đúng in-stock', () => {
    const result = applyFilters(mockInventory, { ...filters, status: 'in-stock' });
    expect(result.every(i => !i.isLowStock && i.quantity > 0)).toBe(true);
  });

  it('nên lọc đúng low-stock', () => {
    const result = applyFilters(mockInventory, { ...filters, status: 'low-stock' });
    expect(result.every(i => i.isLowStock && i.quantity > 0)).toBe(true);
  });

  it('nên lọc đúng out-of-stock', () => {
    const result = applyFilters(mockInventory, { ...filters, status: 'out-of-stock' });
    expect(result.every(i => i.quantity === 0)).toBe(true);
  });

  it('nên tìm kiếm đúng theo tên', () => {
    const result = applyFilters(mockInventory, { ...filters, search: 'sữa' });
    expect(result.every(i => i.productName.toLowerCase().includes('sữa'))).toBe(true);
  });

  it('nên tìm kiếm đúng theo SKU', () => {
    const result = applyFilters(mockInventory, { ...filters, search: 'SP001' });
    expect(result.every(i => i.skuCode.toLowerCase().includes('sp001'))).toBe(true);
  });
});

describe('Sorting Tests (Task004)', () => {
  const sortInventory = (items: InventoryItem[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc') => {
    const sorted = [...items].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'productName':
          comparison = a.productName.localeCompare(b.productName);
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'expiryDate':
          comparison = new Date(a.expiryDate || '9999').getTime() - new Date(b.expiryDate || '9999').getTime();
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        default:
          comparison = a.id - b.id;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    return sorted;
  };

  it('nên sắp xếp đúng theo tên (asc)', () => {
    const result = sortInventory(mockInventory, 'productName', 'asc');
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].productName <= result[i + 1].productName).toBe(true);
    }
  });

  it('nên sắp xếp đúng theo tên (desc)', () => {
    const result = sortInventory(mockInventory, 'productName', 'desc');
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].productName >= result[i + 1].productName).toBe(true);
    }
  });

  it('nên sắp xếp đúng theo số lượng (asc)', () => {
    const result = sortInventory(mockInventory, 'quantity', 'asc');
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].quantity <= result[i + 1].quantity).toBe(true);
    }
  });

  it('nên sắp xếp đúng theo ngày cập nhật (desc)', () => {
    const result = sortInventory(mockInventory, 'updatedAt', 'desc');
    for (let i = 0; i < result.length - 1; i++) {
      expect(new Date(result[i].updatedAt) >= new Date(result[i + 1].updatedAt)).toBe(true);
    }
  });
});

describe('Pagination Tests (Task004)', () => {
  const paginate = (items: InventoryItem[], page: number, limit: number) => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      data: items.slice(start, end),
      totalPages: Math.ceil(items.length / limit),
      currentPage: page,
      totalItems: items.length,
    };
  };

  it('nên phân trang đúng trang 1', () => {
    const result = paginate(mockInventory, 1, 5);
    expect(result.data.length).toBe(5);
    expect(result.currentPage).toBe(1);
  });

  it('nên phân trang đúng trang 2', () => {
    const result = paginate(mockInventory, 2, 5);
    expect(result.data.length).toBe(3);
    expect(result.currentPage).toBe(2);
  });

  it('nên tính đúng totalPages', () => {
    const result = paginate(mockInventory, 1, 5);
    expect(result.totalPages).toBe(2);
  });

  it('nên trả về đúng limit items', () => {
    const limit = 10;
    const result = paginate(mockInventory, 1, limit);
    expect(result.data.length).toBeLessThanOrEqual(limit);
  });
});

describe('KPI Calculation Tests (Task004)', () => {
  const calculateKPIs = (items: InventoryItem[]) => {
    return {
      totalSKUs: items.length,
      totalValue: items.reduce((sum, item) => sum + item.totalValue, 0),
      lowStockCount: items.filter(i => i.isLowStock).length,
      expiringSoonCount: items.filter(i => i.isExpiringSoon).length,
    };
  };

  it('nên tính đúng totalSKUs', () => {
    const kpis = calculateKPIs(mockInventory);
    expect(kpis.totalSKUs).toBe(mockInventory.length);
  });

  it('nên tính đúng totalValue', () => {
    const kpis = calculateKPIs(mockInventory);
    expect(kpis.totalValue).toBe(mockInventoryKPIs.totalValue);
  });

  it('nên tính đúng lowStockCount', () => {
    const kpis = calculateKPIs(mockInventory);
    expect(kpis.lowStockCount).toBe(mockInventoryKPIs.lowStockCount);
  });

  it('nên tính đúng expiringSoonCount', () => {
    const kpis = calculateKPIs(mockInventory);
    expect(kpis.expiringSoonCount).toBe(mockInventoryKPIs.expiringSoonCount);
  });
});