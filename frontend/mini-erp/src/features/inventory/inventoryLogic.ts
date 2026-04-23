import type { InventoryItem, InventoryKPIs } from './types';

export function applyBulkDelete(items: InventoryItem[], idsToDelete: number[]): InventoryItem[] {
  return items.filter(item => !idsToDelete.includes(item.id));
}

export function applyBulkApprove(items: InventoryItem[], idsToApprove: number[]): InventoryItem[] {
  return items.map(item => {
    if (idsToApprove.includes(item.id)) {
      return { ...item, status: 'Active' };
    }
    return item;
  });
}

export function recalculateKPIs(items: InventoryItem[]): InventoryKPIs {
  let totalValue = 0;
  let lowStockCount = 0;
  let expiringSoonCount = 0;

  for (const item of items) {
    totalValue += item.quantity * item.costPrice;
    if (item.quantity <= item.minQuantity) {
      lowStockCount++;
    }
    if (item.isExpiringSoon) {
      expiringSoonCount++;
    }
  }

  return {
    totalSKUs: items.length,
    totalValue,
    lowStockCount,
    expiringSoonCount,
  };
}
