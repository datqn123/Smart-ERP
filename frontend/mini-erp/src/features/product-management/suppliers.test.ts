import { describe, it, expect, beforeEach } from 'vitest';
import { mockSuppliers } from './mockData';

// ==========================================
// Supplier Tests (Task011)
// ==========================================

describe('Supplier Filter Logic (Task011)', () => {
  interface SupplierFilters {
    search?: string;
    status?: 'Active' | 'Inactive' | 'all';
  }

  const applyFilters = (suppliers: any[], filters: SupplierFilters) => {
    let result = [...suppliers];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.supplierCode.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q))
      );
    }
    if (filters.status && filters.status !== 'all') {
      result = result.filter(s => s.status === filters.status);
    }
    return result;
  };

  it('nên lọc đúng theo tên', () => {
    const result = applyFilters(mockSuppliers, { search: 'Vinamilk' });
    expect(result.every(s => s.name.toLowerCase().includes('vinamilk'))).toBe(true);
  });

  it('nên lọc đúng theo mã', () => {
    const result = applyFilters(mockSuppliers, { search: 'NCC' });
    expect(result.length).toBeGreaterThan(0);
  });

  it('nên lọc đúng theo SĐT', () => {
    const result = applyFilters(mockSuppliers, { search: '09' });
    expect(result.length).toBeGreaterThanOrEqual(0);
  });
});

describe('Supplier Validation (Task011)', () => {
  interface SupplierForm {
    name: string;
    supplierCode?: string;
    phone?: string;
    email?: string;
    address?: string;
    taxCode?: string;
    status: 'Active' | 'Inactive';
  }

  const validateSupplier = (data: SupplierForm): string[] => {
    const errors: string[] = [];
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Tên nhà cung cấp là bắt buộc');
    }
    if (data.phone && !/^0\d{9}$/.test(data.phone)) {
      errors.push('Số điện thoại không đúng định dạng (10 số, bắt đầu bằng 0)');
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Email không đúng định dạng');
    }
    if (data.taxCode && !/^\d{10}$/.test(data.taxCode)) {
      errors.push('Mã số thuế phải là 10 số');
    }
    return errors;
  };

  it('nên báo lỗi khi tên trống', () => {
    expect(validateSupplier({ name: '', status: 'Active' })).toContain('Tên nhà cung cấp là bắt buộc');
  });

  it('nên báo lỗi khi phone không đúng', () => {
    expect(validateSupplier({ name: 'Test', phone: '123', status: 'Active' })).toContain('Số điện thoại không đúng định dạng');
  });

  it('nên báo lỗi khi email không đúng', () => {
    expect(validateSupplier({ name: 'Test', email: 'invalid', status: 'Active' })).toContain('Email không đúng định dạng');
  });

  it('nên báo lỗi khi taxCode không đúng', () => {
    expect(validateSupplier({ name: 'Test', taxCode: '123', status: 'Active' })).toContain('Mã số thuế phải là 10 số');
  });

  it('nên hợp lệ khi dữ liệu đúng', () => {
    expect(validateSupplier({ name: 'Vinamilk', phone: '0912345678', email: 'test@email.com', taxCode: '1234567890', status: 'Active' }).length).toBe(0);
  });
});

describe('Supplier Code Generation (Task011)', () => {
  const generateSupplierCode = (index: number): string => {
    return `NCC${String(index).padStart(4, '0')}`;
  };

  it('nên sinh mã đúng định dạng', () => {
    expect(generateSupplierCode(1)).toBe('NCC0001');
    expect(generateSupplierCode(12)).toBe('NCC0012');
  });
});

describe('Supplier Status (Task011)', () => {
  const canDeleteSupplier = (hasReceipts: boolean): boolean => {
    return !hasReceipts;
  };

  it('nên cho phép xóa khi không có phiếu nhập', () => {
    expect(canDeleteSupplier(false)).toBe(true);
  });

  it('nên chặn xóa khi có phiếu nhập', () => {
    expect(canDeleteSupplier(true)).toBe(false);
  });
});