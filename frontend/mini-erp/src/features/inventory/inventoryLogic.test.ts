import { describe, it, expect } from 'vitest';
import { applyBulkDelete, applyBulkApprove, recalculateKPIs } from './inventoryLogic';
import type { InventoryItem } from './types';

describe('inventoryLogic', () => {
  const mockItems: InventoryItem[] = [
    {
      id: 1, productId: 1, productName: "Test 1", skuCode: "T01",
      locationId: 1, warehouseCode: "W1", shelfCode: "S1",
      quantity: 10, minQuantity: 5, unitName: "Gói", costPrice: 1000,
      updatedAt: "2026-04-12T10:30:00Z", isLowStock: false, isExpiringSoon: false, totalValue: 10000,
      status: 'Draft'
    },
    {
      id: 2, productId: 2, productName: "Test 2", skuCode: "T02",
      locationId: 1, warehouseCode: "W1", shelfCode: "S1",
      quantity: 3, minQuantity: 5, unitName: "Gói", costPrice: 2000,
      updatedAt: "2026-04-12T10:30:00Z", isLowStock: true, isExpiringSoon: false, totalValue: 6000,
      status: 'Active'
    },
    {
      id: 3, productId: 3, productName: "Test 3", skuCode: "T03",
      locationId: 1, warehouseCode: "W1", shelfCode: "S1",
      quantity: 0, minQuantity: 5, unitName: "Gói", costPrice: 500,
      updatedAt: "2026-04-12T10:30:00Z", isLowStock: true, isExpiringSoon: false, totalValue: 0,
      status: 'Draft'
    }
  ];

  describe('applyBulkDelete', () => {
    it('nên trả về mảng mới không chứa các ID đã chọn', () => {
      const result = applyBulkDelete(mockItems, [1, 3]);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });

    it('không thay đổi mảng nếu danh sách ID rỗng', () => {
      const result = applyBulkDelete(mockItems, []);
      expect(result).toHaveLength(3);
    });
  });

  describe('applyBulkApprove', () => {
    it('nên cập nhật status thành Active cho các ID được chọn', () => {
      const result = applyBulkApprove(mockItems, [1, 3]);
      expect(result).toHaveLength(3);
      expect(result.find(i => i.id === 1)?.status).toBe('Active');
      expect(result.find(i => i.id === 3)?.status).toBe('Active');
      // ID 2 should be unaffected
      const item2 = result.find(i => i.id === 2);
      expect(item2?.status).toBe('Active');
    });

    it('không thay đổi mảng liên kết cũ', () => {
      const result = applyBulkApprove(mockItems, [1]);
      expect(result).not.toBe(mockItems);
    });
  });

  describe('recalculateKPIs', () => {
    it('nên tính chuẩn các KPI từ array', () => {
      const kpis = recalculateKPIs(mockItems);
      expect(kpis.totalSKUs).toBe(3);
      expect(kpis.totalValue).toBe(16000); // 10*1000 + 3*2000 + 0*500
      expect(kpis.lowStockCount).toBe(2); // ID 2 & 3
      expect(kpis.expiringSoonCount).toBe(0);
    });

    it('trả về 0 nếu mảng rỗng', () => {
      const kpis = recalculateKPIs([]);
      expect(kpis.totalSKUs).toBe(0);
      expect(kpis.totalValue).toBe(0);
      expect(kpis.lowStockCount).toBe(0);
      expect(kpis.expiringSoonCount).toBe(0);
    });
  });
});
