import type { StockDispatch, DispatchStatus } from './types';

export interface DispatchFilters {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

export function filterDispatches(dispatches: StockDispatch[], filters: DispatchFilters): StockDispatch[] {
  return dispatches.filter(d => {
    const searchLower = filters.search.toLowerCase();
    if (filters.search) {
      const matchesSearch =
        d.dispatchCode.toLowerCase().includes(searchLower) ||
        d.orderCode.toLowerCase().includes(searchLower) ||
        d.customerName.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    if (filters.status && filters.status !== 'all') {
      if (d.status !== (filters.status as DispatchStatus)) return false;
    }
    // Date filtering can be added here if needed in future
    return true;
  });
}

export function paginateDispatches(dispatches: StockDispatch[], visibleCount: number): StockDispatch[] {
  return dispatches.slice(0, visibleCount);
}

export function countDispatchedItems(items: Array<{ isFullyDispatched: boolean }>): number {
  return items.filter(i => i.isFullyDispatched).length;
}
