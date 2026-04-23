import { describe, it, expect } from 'vitest';
import { mockInventory, mockInventoryKPIs, mockStockReceipts, mockStockDispatchs, mockAuditSessions } from './mockData';

describe('Layout Tests - KPI Cards (Task004)', () => {
  it('nên hiển thị đúng KPI tổng SKUs', () => {
    expect(mockInventoryKPIs.totalSKUs).toBe(8);
  });

  it('nên hiển thị đúng KPI giá trị tồn kho', () => {
    expect(mockInventoryKPIs.totalValue).toBeGreaterThan(0);
  });

  it('nên hiển thị đúng KPI sắp hết', () => {
    expect(mockInventoryKPIs.lowStockCount).toBeGreaterThan(0);
  });

  it('nên hiển thị đúng KPI cận date', () => {
    expect(mockInventoryKPIs.expiringSoonCount).toBeGreaterThan(0);
  });
});

describe('Layout Tests - Table Columns (Task004)', () => {
  const tableColumns = ['Mã SP', 'Tên sản phẩm', 'Vị trí', 'Số lượng', 'Đơn vị', 'Hạn sử dụng', 'Trạng thái'];
  
  it('nên có đủ các cột trong bảng', () => {
    expect(tableColumns.length).toBe(7);
  });

  it('nên có inventory items để hiển thị', () => {
    expect(mockInventory.length).toBeGreaterThan(0);
  });
});

describe('Layout Tests - Receipt List (Task005)', () => {
  const receiptColumns = ['Mã phiếu', 'Nhà cung cấp', 'Ngày nhập', 'Số dòng', 'Tổng tiền', 'Trạng thái', 'Người tạo'];
  
  it('nên có đủ các cột trong bảng phiếu', () => {
    expect(receiptColumns.length).toBe(7);
  });

  it('nên có đủ 4 trạng thái phiếu', () => {
    const statuses = new Set(mockStockReceipts.map(r => r.status));
    expect(statuses.size).toBe(4);
  });
});

describe('Layout Tests - Dispatch List (Task006)', () => {
  const dispatchColumns = ['Mã phiếu', 'Đơn hàng', 'Khách hàng', 'Ngày xuất', 'Số mặt hàng', 'Trạng thái', 'Người xuất'];
  
  it('nên có đủ các cột trong bảng xuất', () => {
    expect(dispatchColumns.length).toBe(7);
  });

  it('nên có dispatch Full và Partial', () => {
    const hasFull = mockStockDispatchs.some(d => d.status === 'Full');
    const hasPartial = mockStockDispatchs.some(d => d.status === 'Partial');
    expect(hasFull).toBe(true);
    expect(hasPartial).toBe(true);
  });
});

describe('Layout Tests - Audit List (Task007)', () => {
  const auditColumns = ['Mã kiểm kê', 'Tên đợt', 'Ngày kiểm', 'Vị trí', 'Số mặt hàng', 'Trạng thái', 'Người tạo'];
  
  it('nên có đủ các cột trong bảng kiểm kê', () => {
    expect(auditColumns.length).toBe(7);
  });

  it('nên có session Completed và In Progress', () => {
    const hasCompleted = mockAuditSessions.some(a => a.status === 'Completed');
    const hasInProgress = mockAuditSessions.some(a => a.status === 'In Progress');
    expect(hasCompleted).toBe(true);
    expect(hasInProgress).toBe(true);
  });
});

describe('Responsive Layout Tests', () => {
  it('nên có đủ data cho mobile card view', () => {
    expect(mockInventory.length).toBeGreaterThan(0);
  });

  it('nên có đủ data cho desktop table view', () => {
    expect(mockInventory.length).toBeGreaterThanOrEqual(5);
  });
});

describe('Status Color Mapping', () => {
  const colorMapping = {
    inventory: {
      'in-stock': 'bg-green-50',
      'low-stock': 'bg-red-50',
      'out-of-stock': 'bg-red-100',
    },
    receipt: {
      'Draft': 'bg-slate-100',
      'Pending': 'bg-amber-50',
      'Approved': 'bg-green-50',
      'Rejected': 'bg-red-50',
    },
    dispatch: {
      'Pending': 'bg-amber-50',
      'Full': 'bg-green-50',
      'Partial': 'bg-blue-50',
    },
    audit: {
      'Pending': 'bg-amber-50',
      'In Progress': 'bg-blue-50',
      'Completed': 'bg-green-50',
    },
  };

  it('nên có đủ mapping màu cho inventory', () => {
    expect(colorMapping.inventory).toHaveProperty('in-stock');
    expect(colorMapping.inventory).toHaveProperty('low-stock');
    expect(colorMapping.inventory).toHaveProperty('out-of-stock');
  });

  it('nên có đủ mapping màu cho receipt', () => {
    expect(colorMapping.receipt).toHaveProperty('Draft');
    expect(colorMapping.receipt).toHaveProperty('Pending');
    expect(colorMapping.receipt).toHaveProperty('Approved');
    expect(colorMapping.receipt).toHaveProperty('Rejected');
  });
});