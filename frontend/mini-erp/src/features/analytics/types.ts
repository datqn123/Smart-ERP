export interface RevenueData {
  date: string;
  revenue: number;
  profit: number;
}

export interface TopProduct {
  id: number;
  skuCode: string;
  name: string;
  quantitySold: number;
  revenue: number;
}

export interface InventoryReportItem {
  id: number;
  skuCode: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  status: "Normal" | "Low" | "Out" | "Over";
}
