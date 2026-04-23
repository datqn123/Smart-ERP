import { describe, it, expect, beforeEach } from 'vitest';
import { mockProducts } from './mockData';
import type { Product } from './types';

// ==========================================
// Product Tests (Task010)
// ==========================================

describe('Product Filter Logic (Task010)', () => {
  interface ProductFilters {
    search?: string;
    categoryId?: number;
    status?: 'Active' | 'Inactive' | 'all';
  }

  const applyFilters = (products: Product[], filters: ProductFilters) => {
    let result = [...products];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.skuCode.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q))
      );
    }
    if (filters.categoryId) {
      result = result.filter(p => p.categoryId === filters.categoryId);
    }
    if (filters.status && filters.status !== 'all') {
      result = result.filter(p => p.status === filters.status);
    }
    return result;
  };

  it('nên lọc đúng theo tên', () => {
    const result = applyFilters(mockProducts, { search: 'sữa' });
    expect(result.every(p => p.name.toLowerCase().includes('sữa'))).toBe(true);
  });

  it('nên lọc đúng theo SKU', () => {
    const result = applyFilters(mockProducts, { search: 'SP001' });
    expect(result.length).toBeGreaterThan(0);
  });

  it('nên lọc đúng theo danh mục', () => {
    if (mockProducts[0]?.categoryId) {
      const result = applyFilters(mockProducts, { categoryId: mockProducts[0].categoryId });
      expect(result.every(p => p.categoryId === mockProducts[0].categoryId)).toBe(true);
    }
  });
});

describe('Product Validation (Task010)', () => {
  interface ProductForm {
    name: string;
    skuCode: string;
    barcode?: string;
    categoryId?: number;
    status: 'Active' | 'Inactive';
    weight?: number;
  }

  const validateProduct = (data: ProductForm): string[] => {
    const errors: string[] = [];
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Tên sản phẩm là bắt buộc');
    }
    if (!data.skuCode || data.skuCode.trim().length === 0) {
      errors.push('Mã SKU là bắt buộc');
    }
    if (data.barcode && !/^\d{13}$/.test(data.barcode)) {
      errors.push('Mã vạch phải là 13 số');
    }
    if (data.weight !== undefined && data.weight < 0) {
      errors.push('Trọng lượng không được âm');
    }
    return errors;
  };

  it('nên báo lỗi khi tên trống', () => {
    expect(validateProduct({ name: '', skuCode: 'SP001', status: 'Active' })).toContain('Tên sản phẩm là bắt buộc');
  });

  it('nên báo lỗi khi SKU trống', () => {
    expect(validateProduct({ name: 'Test', skuCode: '', status: 'Active' })).toContain('Mã SKU là bắt buộc');
  });

  it('nên báo lỗi khi barcode không đúng định dạng', () => {
    expect(validateProduct({ name: 'Test', skuCode: 'SP001', barcode: '123', status: 'Active' })).toContain('Mã vạch phải là 13 số');
  });

  it('nên hợp lệ khi dữ liệu đúng', () => {
    expect(validateProduct({ name: 'Sữa', skuCode: 'SP001', status: 'Active' }).length).toBe(0);
  });
});

describe('Product Code Generation (Task010)', () => {
  const generateProductCode = (index: number): string => {
    return `SP${String(index).padStart(4, '0')}`;
  };

  it('nên sinh mã đúng định dạng', () => {
    expect(generateProductCode(1)).toBe('SP0001');
    expect(generateProductCode(12)).toBe('SP0012');
  });
});

describe('Product Status (Task010)', () => {
  const canEditProduct = (status: string): boolean => {
    return status === 'Active' || status === 'Inactive';
  };

  const canDeleteProduct = (currentStock: number): boolean => {
    return currentStock === 0;
  };

  it('nên cho phép sửa sản phẩm Active', () => {
    expect(canEditProduct('Active')).toBe(true);
  });

  it('nên cho phép sửa sản phẩm Inactive', () => {
    expect(canEditProduct('Inactive')).toBe(true);
  });

  it('nên cho phép xóa khi tồn kho = 0', () => {
    expect(canDeleteProduct(0)).toBe(true);
  });

  it('nên chặn xóa khi tồn kho > 0', () => {
    expect(canDeleteProduct(10)).toBe(false);
  });
});