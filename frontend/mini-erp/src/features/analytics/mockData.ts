import type { RevenueData, TopProduct, InventoryReportItem } from "./types"

export const mockRevenue: RevenueData[] = [
  { date: "2024-03-01", revenue: 45000000, profit: 12000000 },
  { date: "2024-03-02", revenue: 52000000, profit: 15000000 },
  { date: "2024-03-03", revenue: 38000000, profit: 9000000 },
  { date: "2024-03-04", revenue: 65000000, profit: 21000000 },
  { date: "2024-03-05", revenue: 48000000, profit: 14000000 },
  { date: "2024-03-06", revenue: 70000000, profit: 25000000 },
  { date: "2024-03-07", revenue: 55000000, profit: 16000000 },
]

export const mockTopProducts: TopProduct[] = [
  { id: 1, skuCode: "MILK001", name: "Sữa tươi Vinamilk 180ml", quantitySold: 1200, revenue: 15000000 },
  { id: 2, skuCode: "CAKE002", name: "Bánh quy Oreo 133g", quantitySold: 850, revenue: 8500000 },
  { id: 3, skuCode: "WTR003", name: "Nước khoáng Lavie 500ml", quantitySold: 2100, revenue: 10500000 },
  { id: 4, skuCode: "NOOD004", name: "Mì Hảo Hảo Tôm Chua Cay", quantitySold: 3500, revenue: 14000000 },
  { id: 5, skuCode: "DET005", name: "Nước xả vải Downy", quantitySold: 320, revenue: 19500000 },
]

export const mockInventoryReport: InventoryReportItem[] = [
  { id: 1, skuCode: "MILK001", name: "Sữa tươi Vinamilk 180ml", category: "Thực phẩm", currentStock: 150, minStock: 200, maxStock: 1000, status: "Low" },
  { id: 2, skuCode: "CAKE002", name: "Bánh quy Oreo 133g", category: "Thực phẩm", currentStock: 500, minStock: 100, maxStock: 800, status: "Normal" },
  { id: 3, skuCode: "WTR003", name: "Nước khoáng Lavie 500ml", category: "Đồ uống", currentStock: 2500, minStock: 500, maxStock: 3000, status: "Normal" },
  { id: 4, skuCode: "NOOD004", name: "Mì Hảo Hảo Tôm Chua Cay", category: "Thực phẩm", currentStock: 0, minStock: 1000, maxStock: 5000, status: "Out" },
  { id: 5, skuCode: "DET005", name: "Nước xả vải Downy", category: "Hóa phẩm", currentStock: 45, minStock: 50, maxStock: 200, status: "Low" },
]
