import { describe, it, expect } from 'vitest';
import { filterReceipts, paginateReceipts, sortByDate } from './inboundLogic';
import type { StockReceipt } from './types';

const mockReceipts: StockReceipt[] = [
  {
    id: 1, receiptCode: 'PN-001', supplierId: 1, supplierName: 'Vinamilk',
    staffId: 1, staffName: 'Nguyễn A', receiptDate: '2026-04-10',
    status: 'Approved', totalAmount: 5000000, invoiceNumber: 'INV-001',
    createdAt: '2026-04-10T08:00:00Z', updatedAt: '2026-04-10T09:00:00Z', details: [],
  },
  {
    id: 2, receiptCode: 'PN-002', supplierId: 2, supplierName: 'PepsiCo',
    staffId: 2, staffName: 'Trần B', receiptDate: '2026-04-12',
    status: 'Pending', totalAmount: 2000000,
    createdAt: '2026-04-12T08:00:00Z', updatedAt: '2026-04-12T08:00:00Z', details: [],
  },
  {
    id: 3, receiptCode: 'PN-003', supplierId: 3, supplierName: 'Unilever',
    staffId: 1, staffName: 'Nguyễn A', receiptDate: '2026-04-08',
    status: 'Draft', totalAmount: 3000000,
    createdAt: '2026-04-08T08:00:00Z', updatedAt: '2026-04-08T08:00:00Z', details: [],
  },
];

describe('sortByDate', () => {
  it('sắp xếp phiếu mới nhất trước', () => {
    const result = sortByDate(mockReceipts);
    expect(result[0].receiptDate).toBe('2026-04-12');
    expect(result[1].receiptDate).toBe('2026-04-10');
    expect(result[2].receiptDate).toBe('2026-04-08');
  });

  it('không thay đổi mảng gốc', () => {
    const original = [...mockReceipts];
    sortByDate(mockReceipts);
    expect(mockReceipts).toEqual(original);
  });
});

describe('filterReceipts', () => {
  const defaultFilters = { search: '', status: 'all', dateFrom: '', dateTo: '', supplier: '' };

  it('trả về tất cả khi không có filter', () => {
    const result = filterReceipts(mockReceipts, defaultFilters);
    expect(result).toHaveLength(3);
  });

  it('lọc theo mã phiếu', () => {
    const result = filterReceipts(mockReceipts, { ...defaultFilters, search: 'PN-001' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('lọc theo tên nhà cung cấp', () => {
    const result = filterReceipts(mockReceipts, { ...defaultFilters, search: 'pepsi' });
    expect(result).toHaveLength(1);
    expect(result[0].supplierName).toBe('PepsiCo');
  });

  it('lọc theo trạng thái', () => {
    const result = filterReceipts(mockReceipts, { ...defaultFilters, status: 'Pending' });
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('Pending');
  });

  it('lọc theo dateFrom', () => {
    const result = filterReceipts(mockReceipts, { ...defaultFilters, dateFrom: '2026-04-10' });
    expect(result).toHaveLength(2);
  });

  it('lọc theo dateTo', () => {
    const result = filterReceipts(mockReceipts, { ...defaultFilters, dateTo: '2026-04-10' });
    expect(result).toHaveLength(2);
  });

  it('trả về rỗng khi không khớp', () => {
    const result = filterReceipts(mockReceipts, { ...defaultFilters, search: 'NOMATCH_XYZ' });
    expect(result).toHaveLength(0);
  });

  it('trả về rỗng khi danh sách rỗng', () => {
    const result = filterReceipts([], defaultFilters);
    expect(result).toHaveLength(0);
  });
});

describe('paginateReceipts', () => {
  it('trả về đúng số lượng theo visibleCount', () => {
    const result = paginateReceipts(mockReceipts, 2);
    expect(result).toHaveLength(2);
  });

  it('trả về tất cả nếu visibleCount lớn hơn list', () => {
    const result = paginateReceipts(mockReceipts, 100);
    expect(result).toHaveLength(3);
  });

  it('trả về rỗng khi visibleCount = 0', () => {
    const result = paginateReceipts(mockReceipts, 0);
    expect(result).toHaveLength(0);
  });
});
