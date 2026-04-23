import type { InventoryItem, StockReceipt, ReceiptDetailItem, StockDispatch, DispatchItem, AuditSession, AuditItem } from "./types";

// ==========================================
// Mock Data - Inventory (Task004)
// ==========================================

export const mockInventory: InventoryItem[] = [
  {
    id: 1, productId: 1, productName: "Sữa Ông Thọ Hộp Giấy", skuCode: "SP001",
    locationId: 1, warehouseCode: "WH01", shelfCode: "A1",
    batchNumber: "B2026001", expiryDate: "2026-12-31",
    quantity: 150, minQuantity: 50, unitName: "Hộp", costPrice: 25000,
    updatedAt: "2026-04-12T10:30:00Z", isLowStock: false, isExpiringSoon: false, totalValue: 3750000, status: "Draft"
  },
  {
    id: 2, productId: 2, productName: "Nước Ngọt Coca Cola 1.5L", skuCode: "SP002",
    locationId: 2, warehouseCode: "WH01", shelfCode: "B2",
    batchNumber: "B2026002", expiryDate: "2027-06-15",
    quantity: 45, minQuantity: 50, unitName: "Chai", costPrice: 12000,
    updatedAt: "2026-04-11T14:20:00Z", isLowStock: true, isExpiringSoon: false, totalValue: 540000,
  },
  {
    id: 3, productId: 3, productName: "Bánh Quy Cosy", skuCode: "SP003",
    locationId: 3, warehouseCode: "WH01", shelfCode: "C1",
    expiryDate: "2026-05-10",
    quantity: 80, minQuantity: 30, unitName: "Gói", costPrice: 8000,
    updatedAt: "2026-04-10T09:15:00Z", isLowStock: false, isExpiringSoon: true, totalValue: 640000,
  },
  {
    id: 4, productId: 4, productName: "Dầu Ăn Simply 1L", skuCode: "SP004",
    locationId: 1, warehouseCode: "WH01", shelfCode: "A2",
    quantity: 0, minQuantity: 20, unitName: "Chai", costPrice: 35000,
    updatedAt: "2026-04-09T16:45:00Z", isLowStock: true, isExpiringSoon: false, totalValue: 0, status: "Draft"
  },
  {
    id: 5, productId: 5, productName: "Mì Gói Hảo Hảo", skuCode: "SP005",
    locationId: 4, warehouseCode: "WH01", shelfCode: "D1",
    batchNumber: "B2026005", expiryDate: "2027-01-20",
    quantity: 500, minQuantity: 100, unitName: "Gói", costPrice: 3500,
    updatedAt: "2026-04-12T08:00:00Z", isLowStock: false, isExpiringSoon: false, totalValue: 1750000,
  },
  {
    id: 6, productId: 6, productName: "Nước Tương Chin-Su", skuCode: "SP006",
    locationId: 2, warehouseCode: "WH01", shelfCode: "B1",
    quantity: 25, minQuantity: 30, unitName: "Chai", costPrice: 18000,
    updatedAt: "2026-04-08T11:30:00Z", isLowStock: true, isExpiringSoon: false, totalValue: 450000,
  },
  {
    id: 7, productId: 7, productName: "Bột Giặt OMO 3kg", skuCode: "SP007",
    locationId: 5, warehouseCode: "WH01", shelfCode: "E1",
    expiryDate: "2028-03-15",
    quantity: 60, minQuantity: 20, unitName: "Bao", costPrice: 85000,
    updatedAt: "2026-04-07T13:00:00Z", isLowStock: false, isExpiringSoon: false, totalValue: 5100000,
  },
  {
    id: 8, productId: 8, productName: "Cà Phê Trung Nguyên", skuCode: "SP008",
    locationId: 1, warehouseCode: "WH01", shelfCode: "A3",
    batchNumber: "B2026008", expiryDate: "2026-04-25",
    quantity: 35, minQuantity: 25, unitName: "Hộp", costPrice: 45000,
    updatedAt: "2026-04-06T10:00:00Z", isLowStock: false, isExpiringSoon: true, totalValue: 1575000,
  },
  {
    id: 9, productId: 9, productName: "Nước Mắm Nam Ngư", skuCode: "SP009",
    locationId: 2, warehouseCode: "WH01", shelfCode: "B3",
    quantity: 120, minQuantity: 40, unitName: "Chai", costPrice: 22000,
    updatedAt: "2026-04-12T10:30:00Z", isLowStock: false, isExpiringSoon: false, totalValue: 2640000,
  },
  {
    id: 10, productId: 10, productName: "Gạo ST25 (Túi 5kg)", skuCode: "SP010",
    locationId: 6, warehouseCode: "WH01", shelfCode: "F1",
    quantity: 80, minQuantity: 30, unitName: "Túi", costPrice: 185000,
    updatedAt: "2026-04-10T14:20:00Z", isLowStock: false, isExpiringSoon: false, totalValue: 14800000,
  },
  {
    id: 11, productId: 11, productName: "Đường Tinh Luyện Biên Hòa", skuCode: "SP011",
    locationId: 4, warehouseCode: "WH01", shelfCode: "D2",
    quantity: 200, minQuantity: 50, unitName: "Gói", costPrice: 20000,
    updatedAt: "2026-04-11T09:15:00Z", isLowStock: false, isExpiringSoon: false, totalValue: 4000000,
  },
  {
    id: 12, productId: 12, productName: "Muối I-ốt Hảo Hảo", skuCode: "SP012",
    locationId: 4, warehouseCode: "WH01", shelfCode: "D3",
    quantity: 15, minQuantity: 50, unitName: "Gói", costPrice: 5000,
    updatedAt: "2026-04-09T16:45:00Z", isLowStock: true, isExpiringSoon: false, totalValue: 75000,
  },
  {
    id: 13, productId: 13, productName: "Trà Xanh Không Độ", skuCode: "SP013",
    locationId: 2, warehouseCode: "WH01", shelfCode: "B4",
    quantity: 300, minQuantity: 100, unitName: "Chai", costPrice: 8000,
    updatedAt: "2026-04-12T08:00:00Z", isLowStock: false, isExpiringSoon: false, totalValue: 2400000,
  },
  {
    id: 14, productId: 14, productName: "Kem Đánh Răng P/S", skuCode: "SP014",
    locationId: 5, warehouseCode: "WH01", shelfCode: "E2",
    quantity: 110, minQuantity: 40, unitName: "Hộp", costPrice: 32000,
    updatedAt: "2026-04-08T11:30:00Z", isLowStock: false, isExpiringSoon: false, totalValue: 3520000,
  },
  {
    id: 15, productId: 15, productName: "Sữa Tắm Lifebuoy", skuCode: "SP015",
    locationId: 5, warehouseCode: "WH01", shelfCode: "E3",
    quantity: 0, minQuantity: 30, unitName: "Chai", costPrice: 75000,
    updatedAt: "2026-04-07T13:00:00Z", isLowStock: true, isExpiringSoon: false, totalValue: 0,
  },
  {
    id: 16, productId: 16, productName: "Mì Tôm Omachi", skuCode: "SP016",
    locationId: 4, warehouseCode: "WH01", shelfCode: "D4",
    batchNumber: "B2026016", expiryDate: "2026-05-01",
    quantity: 450, minQuantity: 100, unitName: "Gói", costPrice: 6500,
    updatedAt: "2026-04-06T10:00:00Z", isLowStock: false, isExpiringSoon: true, totalValue: 2925000,
  },
  {
    id: 17, productId: 17, productName: "Dầu Gội Clear", skuCode: "SP017",
    locationId: 5, warehouseCode: "WH01", shelfCode: "E4",
    quantity: 85, minQuantity: 30, unitName: "Chai", costPrice: 68000,
    updatedAt: "2026-04-12T10:30:00Z", isLowStock: false, isExpiringSoon: false, totalValue: 5780000,
  },
  {
    id: 18, productId: 18, productName: "Sữa Chua Vinamilk", skuCode: "SP018",
    locationId: 1, warehouseCode: "WH01", shelfCode: "A4",
    batchNumber: "B2026018", expiryDate: "2026-04-18",
    quantity: 120, minQuantity: 50, unitName: "Lốc", costPrice: 24000,
    updatedAt: "2026-04-10T14:20:00Z", isLowStock: false, isExpiringSoon: true, totalValue: 2880000,
  },
  {
    id: 19, productId: 19, productName: "Bánh Chocopie", skuCode: "SP019",
    locationId: 3, warehouseCode: "WH01", shelfCode: "C2",
    quantity: 210, minQuantity: 60, unitName: "Hộp", costPrice: 48000,
    updatedAt: "2026-04-11T09:15:00Z", isLowStock: false, isExpiringSoon: false, totalValue: 10080000,
  },
  {
    id: 20, productId: 20, productName: "Xúc Xích Vissan", skuCode: "SP020",
    locationId: 1, warehouseCode: "WH01", shelfCode: "A5",
    quantity: 25, minQuantity: 50, unitName: "Gói", costPrice: 38000,
    updatedAt: "2026-04-09T16:45:00Z", isLowStock: true, isExpiringSoon: false, totalValue: 950000,
  },
];

export const mockInventoryKPIs = {
  totalSKUs: 8,
  totalValue: 13805000,
  lowStockCount: 3,
  expiringSoonCount: 2,
};

// ==========================================
// Mock Data - Stock Receipts (Task005)
// ==========================================

const mockReceiptDetails: ReceiptDetailItem[][] = [
  [
    { id: 1, receiptId: 1, productId: 1, productName: "Sữa Ông Thọ Hộp Giấy", skuCode: "SP001", unitId: 1, unitName: "Hộp", quantity: 200, costPrice: 25000, batchNumber: "B2026009", expiryDate: "2027-01-15", lineTotal: 5000000 },
    { id: 2, receiptId: 1, productId: 5, productName: "Mì Gói Hảo Hảo", skuCode: "SP005", unitId: 5, unitName: "Gói", quantity: 300, costPrice: 3500, lineTotal: 1050000 },
  ],
  [
    { id: 3, receiptId: 2, productId: 2, productName: "Nước Ngọt Coca Cola 1.5L", skuCode: "SP002", unitId: 2, unitName: "Chai", quantity: 100, costPrice: 12000, batchNumber: "B2026010", expiryDate: "2027-06-15", lineTotal: 1200000 },
  ],
  [
    { id: 4, receiptId: 3, productId: 7, productName: "Bột Giặt OMO 3kg", skuCode: "SP007", unitId: 7, unitName: "Bao", quantity: 50, costPrice: 85000, lineTotal: 4250000 },
    { id: 5, receiptId: 3, productId: 6, productName: "Nước Tương Chin-Su", skuCode: "SP006", unitId: 6, unitName: "Chai", quantity: 40, costPrice: 18000, lineTotal: 720000 },
    { id: 6, receiptId: 3, productId: 3, productName: "Bánh Quy Cosy", skuCode: "SP003", unitId: 3, unitName: "Gói", quantity: 100, costPrice: 8000, lineTotal: 800000 },
  ],
];

export const mockStockReceipts: StockReceipt[] = [
  {
    id: 1, receiptCode: "PN-2026-0001", supplierId: 1, supplierName: "Công ty TNHH Vinamilk",
    staffId: 2, staffName: "Nguyễn Văn A", receiptDate: "2026-04-10",
    status: "Approved", invoiceNumber: "INV-2026-001", totalAmount: 6050000,
    notes: "Nhập hàng tháng 4", approvedBy: 1, approvedByName: "Trần Quản Lý",
    approvedAt: "2026-04-11T09:00:00Z", createdAt: "2026-04-10T14:00:00Z", updatedAt: "2026-04-11T09:00:00Z",
    details: mockReceiptDetails[0],
  },
  {
    id: 2, receiptCode: "PN-2026-0002", supplierId: 2, supplierName: "Nhà phân phối PepsiCo",
    staffId: 2, staffName: "Nguyễn Văn A", receiptDate: "2026-04-12",
    status: "Pending", invoiceNumber: "INV-2026-002", totalAmount: 1200000,
    notes: "Chờ phê duyệt", createdAt: "2026-04-12T10:00:00Z", updatedAt: "2026-04-12T10:00:00Z",
    details: mockReceiptDetails[1],
  },
  {
    id: 3, receiptCode: "PN-2026-0003", supplierId: 3, supplierName: "Công ty Hàng Tiêu Dùng",
    staffId: 3, staffName: "Lê Thị B", receiptDate: "2026-04-13",
    status: "Draft", totalAmount: 5770000,
    notes: "Phiếu nháp", createdAt: "2026-04-13T08:00:00Z", updatedAt: "2026-04-13T08:00:00Z",
    details: mockReceiptDetails[2],
  },
  {
    id: 4, receiptCode: "PN-2026-0004", supplierId: 1, supplierName: "Công ty TNHH Vinamilk",
    staffId: 2, staffName: "Nguyễn Văn A", receiptDate: "2026-04-08",
    status: "Rejected", totalAmount: 2500000,
    notes: "Sai đơn giá", approvedBy: 1, approvedByName: "Trần Quản Lý",
    approvedAt: "2026-04-09T10:00:00Z", createdAt: "2026-04-08T11:00:00Z", updatedAt: "2026-04-09T10:00:00Z",
    details: [],
  },
  {
    id: 5, receiptCode: "PN-2026-0005", supplierId: 4, supplierName: "Công ty Hàng Tiêu Dùng Masan",
    staffId: 3, staffName: "Lê Thị B", receiptDate: "2026-04-07",
    status: "Approved", invoiceNumber: "INV-2026-005", totalAmount: 4200000,
    notes: "Nhập hàng Masan", approvedBy: 1, approvedByName: "Trần Quản Lý",
    approvedAt: "2026-04-08T09:00:00Z", createdAt: "2026-04-07T10:00:00Z", updatedAt: "2026-04-08T09:00:00Z",
    details: [],
  },
  {
    id: 6, receiptCode: "PN-2026-0006", supplierId: 2, supplierName: "Nhà phân phối PepsiCo",
    staffId: 2, staffName: "Nguyễn Văn A", receiptDate: "2026-04-06",
    status: "Pending", invoiceNumber: "INV-2026-006", totalAmount: 1800000,
    notes: "Đang chờ duyệt", createdAt: "2026-04-06T09:00:00Z", updatedAt: "2026-04-06T09:00:00Z",
    details: [],
  },
  {
    id: 7, receiptCode: "PN-2026-0007", supplierId: 5, supplierName: "Đại lý Unilever",
    staffId: 3, staffName: "Lê Thị B", receiptDate: "2026-04-05",
    status: "Draft", totalAmount: 6750000,
    notes: "Phiếu nháp hàng gia dụng", createdAt: "2026-04-05T14:00:00Z", updatedAt: "2026-04-05T14:00:00Z",
    details: [],
  },
  {
    id: 8, receiptCode: "PN-2026-0008", supplierId: 1, supplierName: "Công ty TNHH Vinamilk",
    staffId: 2, staffName: "Nguyễn Văn A", receiptDate: "2026-04-04",
    status: "Approved", invoiceNumber: "INV-2026-008", totalAmount: 9100000,
    approvedBy: 1, approvedByName: "Trần Quản Lý",
    approvedAt: "2026-04-05T10:00:00Z", createdAt: "2026-04-04T08:00:00Z", updatedAt: "2026-04-05T10:00:00Z",
    details: [],
  },
  {
    id: 9, receiptCode: "PN-2026-0009", supplierId: 3, supplierName: "Công ty Hàng Tiêu Dùng",
    staffId: 3, staffName: "Lê Thị B", receiptDate: "2026-04-03",
    status: "Approved", invoiceNumber: "INV-2026-009", totalAmount: 3350000,
    approvedBy: 1, approvedByName: "Trần Quản Lý",
    approvedAt: "2026-04-04T09:00:00Z", createdAt: "2026-04-03T10:00:00Z", updatedAt: "2026-04-04T09:00:00Z",
    details: [],
  },
  {
    id: 10, receiptCode: "PN-2026-0010", supplierId: 2, supplierName: "Nhà phân phối PepsiCo",
    staffId: 2, staffName: "Nguyễn Văn A", receiptDate: "2026-04-02",
    status: "Rejected", totalAmount: 1100000,
    notes: "Hàng hết hạn sử dụng", approvedBy: 1, approvedByName: "Trần Quản Lý",
    approvedAt: "2026-04-03T11:00:00Z", createdAt: "2026-04-02T13:00:00Z", updatedAt: "2026-04-03T11:00:00Z",
    details: [],
  },
  {
    id: 11, receiptCode: "PN-2026-0011", supplierId: 4, supplierName: "Công ty Hàng Tiêu Dùng Masan",
    staffId: 3, staffName: "Lê Thị B", receiptDate: "2026-04-01",
    status: "Approved", invoiceNumber: "INV-2026-011", totalAmount: 5500000,
    approvedBy: 1, approvedByName: "Trần Quản Lý",
    approvedAt: "2026-04-02T08:00:00Z", createdAt: "2026-04-01T09:00:00Z", updatedAt: "2026-04-02T08:00:00Z",
    details: [],
  },
  {
    id: 12, receiptCode: "PN-2026-0012", supplierId: 5, supplierName: "Đại lý Unilever",
    staffId: 2, staffName: "Nguyễn Văn A", receiptDate: "2026-03-31",
    status: "Draft", totalAmount: 2200000,
    notes: "Phiếu tháng 3", createdAt: "2026-03-31T10:00:00Z", updatedAt: "2026-03-31T10:00:00Z",
    details: [],
  },
  {
    id: 13, receiptCode: "PN-2026-0013", supplierId: 1, supplierName: "Công ty TNHH Vinamilk",
    staffId: 3, staffName: "Lê Thị B", receiptDate: "2026-03-30",
    status: "Approved", invoiceNumber: "INV-2026-013", totalAmount: 7800000,
    approvedBy: 1, approvedByName: "Trần Quản Lý",
    approvedAt: "2026-03-31T09:00:00Z", createdAt: "2026-03-30T08:00:00Z", updatedAt: "2026-03-31T09:00:00Z",
    details: [],
  },
  {
    id: 14, receiptCode: "PN-2026-0014", supplierId: 2, supplierName: "Nhà phân phối PepsiCo",
    staffId: 2, staffName: "Nguyễn Văn A", receiptDate: "2026-03-28",
    status: "Pending", totalAmount: 3100000,
    createdAt: "2026-03-28T11:00:00Z", updatedAt: "2026-03-28T11:00:00Z",
    details: [],
  },
  {
    id: 15, receiptCode: "PN-2026-0015", supplierId: 3, supplierName: "Công ty Hàng Tiêu Dùng",
    staffId: 3, staffName: "Lê Thị B", receiptDate: "2026-03-25",
    status: "Approved", invoiceNumber: "INV-2026-015", totalAmount: 4600000,
    approvedBy: 1, approvedByName: "Trần Quản Lý",
    approvedAt: "2026-03-26T10:00:00Z", createdAt: "2026-03-25T09:00:00Z", updatedAt: "2026-03-26T10:00:00Z",
    details: [],
  },
  {
    id: 16, receiptCode: "PN-2026-0016", supplierId: 4, supplierName: "Công ty Hàng Tiêu Dùng Masan",
    staffId: 2, staffName: "Nguyễn Văn A", receiptDate: "2026-03-22",
    status: "Draft", totalAmount: 1950000,
    notes: "Phiếu nháp cuối tháng 3", createdAt: "2026-03-22T08:00:00Z", updatedAt: "2026-03-22T08:00:00Z",
    details: [],
  },
  {
    id: 17, receiptCode: "PN-2026-0017", supplierId: 5, supplierName: "Đại lý Unilever",
    staffId: 3, staffName: "Lê Thị B", receiptDate: "2026-03-20",
    status: "Approved", invoiceNumber: "INV-2026-017", totalAmount: 8250000,
    approvedBy: 1, approvedByName: "Trần Quản Lý",
    approvedAt: "2026-03-21T09:00:00Z", createdAt: "2026-03-20T10:00:00Z", updatedAt: "2026-03-21T09:00:00Z",
    details: [],
  },
  {
    id: 18, receiptCode: "PN-2026-0018", supplierId: 1, supplierName: "Công ty TNHH Vinamilk",
    staffId: 2, staffName: "Nguyễn Văn A", receiptDate: "2026-03-18",
    status: "Rejected", totalAmount: 2750000,
    notes: "Hàng bị hư hỏng", approvedBy: 1, approvedByName: "Trần Quản Lý",
    approvedAt: "2026-03-19T10:00:00Z", createdAt: "2026-03-18T09:00:00Z", updatedAt: "2026-03-19T10:00:00Z",
    details: [],
  },
  {
    id: 19, receiptCode: "PN-2026-0019", supplierId: 2, supplierName: "Nhà phân phối PepsiCo",
    staffId: 3, staffName: "Lê Thị B", receiptDate: "2026-03-15",
    status: "Approved", invoiceNumber: "INV-2026-019", totalAmount: 5150000,
    approvedBy: 1, approvedByName: "Trần Quản Lý",
    approvedAt: "2026-03-16T08:00:00Z", createdAt: "2026-03-15T10:00:00Z", updatedAt: "2026-03-16T08:00:00Z",
    details: [],
  },
  {
    id: 20, receiptCode: "PN-2026-0020", supplierId: 3, supplierName: "Công ty Hàng Tiêu Dùng",
    staffId: 2, staffName: "Nguyễn Văn A", receiptDate: "2026-03-12",
    status: "Pending", totalAmount: 3900000,
    notes: "Phiếu cuối tháng 3", createdAt: "2026-03-12T11:00:00Z", updatedAt: "2026-03-12T11:00:00Z",
    details: [],
  },
  {
    id: 21, receiptCode: "PN-2026-0021", supplierId: 1, supplierName: "Công ty TNHH Vinamilk",
    staffId: 3, staffName: "Lê Thị B", receiptDate: "2026-03-10",
    status: "Approved", totalAmount: 4500000,
    invoiceNumber: "INV-2026-021", createdAt: "2026-03-10T09:00:00Z", updatedAt: "2026-03-10T14:00:00Z",
    details: [],
  },
  {
    id: 22, receiptCode: "PN-2026-0022", supplierId: 4, supplierName: "Công ty Hàng Tiêu Dùng Masan",
    staffId: 2, staffName: "Nguyễn Văn A", receiptDate: "2026-03-08",
    status: "Pending", totalAmount: 1200000,
    createdAt: "2026-03-08T10:00:00Z", updatedAt: "2026-03-08T10:00:00Z",
    details: [],
  },
  {
    id: 23, receiptCode: "PN-2026-0023", supplierId: 5, supplierName: "Đại lý Unilever",
    staffId: 3, staffName: "Lê Thị B", receiptDate: "2026-03-05",
    status: "Approved", totalAmount: 7200000,
    invoiceNumber: "INV-2026-023", createdAt: "2026-03-05T08:00:00Z", updatedAt: "2026-03-05T16:00:00Z",
    details: [],
  },
  {
    id: 24, receiptCode: "PN-2026-0024", supplierId: 2, supplierName: "Nhà phân phối PepsiCo",
    staffId: 2, staffName: "Nguyễn Văn A", receiptDate: "2026-03-03",
    status: "Draft", totalAmount: 3300000,
    createdAt: "2026-03-03T11:00:00Z", updatedAt: "2026-03-03T11:00:00Z",
    details: [],
  },
  {
    id: 25, receiptCode: "PN-2026-0025", supplierId: 3, supplierName: "Công ty Hàng Tiêu Dùng",
    staffId: 3, staffName: "Lê Thị B", receiptDate: "2026-03-01",
    status: "Approved", totalAmount: 2100000,
    invoiceNumber: "INV-2026-025", createdAt: "2026-03-01T09:00:00Z", updatedAt: "2026-03-01T15:00:00Z",
    details: [],
  },
  {
    id: 26, receiptCode: "PN-2026-0026", supplierId: 1, supplierName: "Công ty TNHH Vinamilk",
    staffId: 2, staffName: "Nguyễn Văn A", receiptDate: "2026-02-28",
    status: "Pending", totalAmount: 5800000,
    createdAt: "2026-02-28T10:00:00Z", updatedAt: "2026-02-28T10:00:00Z",
    details: [],
  },
  {
    id: 27, receiptCode: "PN-2026-0027", supplierId: 4, supplierName: "Công ty Hàng Tiêu Dùng Masan",
    staffId: 3, staffName: "Lê Thị B", receiptDate: "2026-02-25",
    status: "Approved", totalAmount: 4400000,
    invoiceNumber: "INV-2026-027", createdAt: "2026-02-25T08:00:00Z", updatedAt: "2026-02-25T17:00:00Z",
    details: [],
  },
  {
    id: 28, receiptCode: "PN-2026-0028", supplierId: 5, supplierName: "Đại lý Unilever",
    staffId: 2, staffName: "Nguyễn Văn A", receiptDate: "2026-02-22",
    status: "Rejected", totalAmount: 1500000,
    notes: "Hàng không đúng quy cách", createdAt: "2026-02-22T09:00:00Z", updatedAt: "2026-02-22T14:00:00Z",
    details: [],
  },
  {
    id: 29, receiptCode: "PN-2026-0029", supplierId: 2, supplierName: "Nhà phân phối PepsiCo",
    staffId: 3, staffName: "Lê Thị B", receiptDate: "2026-02-20",
    status: "Approved", totalAmount: 8900000,
    invoiceNumber: "INV-2026-029", createdAt: "2026-02-20T10:00:00Z", updatedAt: "2026-02-20T16:00:00Z",
    details: [],
  },
  {
    id: 30, receiptCode: "PN-2026-0030", supplierId: 3, supplierName: "Công ty Hàng Tiêu Dùng",
    staffId: 2, staffName: "Nguyễn Văn A", receiptDate: "2026-02-18",
    status: "Pending", totalAmount: 2700000,
    createdAt: "2026-02-18T11:00:00Z", updatedAt: "2026-02-18T11:00:00Z",
    details: [],
  },
];

// ==========================================
// Mock Data - Stock Dispatch (Task006)
// ==========================================

const mockDispatchItems: DispatchItem[][] = [
  [
    { id: 1, dispatchId: 1, orderDetailId: 1, productId: 1, productName: "Sữa Ông Thọ Hộp Giấy", skuCode: "SP001", unitId: 1, unitName: "Hộp", orderedQty: 20, alreadyDispatchedQty: 0, remainingQty: 20, dispatchQty: 20, warehouseLocation: "WH01", shelfCode: "A1", batchNumber: "B2026001", availableStock: 150, isFullyDispatched: true },
    { id: 2, dispatchId: 1, orderDetailId: 2, productId: 5, productName: "Mì Gói Hảo Hảo", skuCode: "SP005", unitId: 5, unitName: "Gói", orderedQty: 50, alreadyDispatchedQty: 0, remainingQty: 50, dispatchQty: 50, warehouseLocation: "WH01", shelfCode: "D1", availableStock: 500, isFullyDispatched: true },
  ],
  [
    { id: 3, dispatchId: 2, orderDetailId: 3, productId: 2, productName: "Nước Ngọt Coca Cola 1.5L", skuCode: "SP002", unitId: 2, unitName: "Chai", orderedQty: 60, alreadyDispatchedQty: 0, remainingQty: 60, dispatchQty: 40, warehouseLocation: "WH01", shelfCode: "B2", availableStock: 45, isFullyDispatched: false },
  ],
];

export const mockStockDispatchs: StockDispatch[] = [
  {
    id: 1, dispatchCode: "PX-2026-0001", orderId: 1, orderCode: "SO-2026-0001",
    customerName: "Nguyễn Thị C", userId: 2, userName: "Nguyễn Văn A",
    dispatchDate: "2026-04-12", status: "Full",
    notes: "Xuất đủ hàng", createdAt: "2026-04-12T08:00:00Z", updatedAt: "2026-04-12T09:00:00Z",
    items: mockDispatchItems[0],
  },
  {
    id: 2, dispatchCode: "PX-2026-0002", orderId: 2, orderCode: "SO-2026-0002",
    customerName: "Trần Văn D", userId: 3, userName: "Lê Thị B",
    dispatchDate: "2026-04-13", status: "Partial",
    notes: "Không đủ hàng, đã tạo backorder", createdAt: "2026-04-13T10:00:00Z", updatedAt: "2026-04-13T11:00:00Z",
    items: mockDispatchItems[1],
  },
  {
    id: 3, dispatchCode: "PX-2026-0003", orderId: 3, orderCode: "SO-2026-0003",
    customerName: "Phạm Thị E", userId: 2, userName: "Nguyễn Văn A",
    dispatchDate: "2026-04-13", status: "Pending",
    notes: "Chờ xuất kho", createdAt: "2026-04-13T14:00:00Z", updatedAt: "2026-04-13T14:00:00Z",
    items: [],
  },
];

// ==========================================
// Mock Data - Inventory Audit (Task007)
// ==========================================

const mockAuditItems: AuditItem[][] = [
  [
    { id: 1, auditSessionId: 1, productId: 1, productName: "Sữa Ông Thọ Hộp Giấy", skuCode: "SP001", unitName: "Hộp", locationId: 1, warehouseCode: "WH01", shelfCode: "A1", batchNumber: "B2026001", systemQuantity: 150, actualQuantity: 148, variance: -2, variancePercent: -1.33, isCounted: true, notes: "Thiếu 2 hộp" },
    { id: 2, auditSessionId: 1, productId: 2, productName: "Nước Ngọt Coca Cola 1.5L", skuCode: "SP002", unitName: "Chai", locationId: 2, warehouseCode: "WH01", shelfCode: "B2", systemQuantity: 45, actualQuantity: 45, variance: 0, variancePercent: 0, isCounted: true },
    { id: 3, auditSessionId: 1, productId: 5, productName: "Mì Gói Hảo Hảo", skuCode: "SP005", unitName: "Gói", locationId: 4, warehouseCode: "WH01", shelfCode: "D1", systemQuantity: 500, actualQuantity: 505, variance: 5, variancePercent: 1, isCounted: true, notes: "Thừa 5 gói" },
    { id: 4, auditSessionId: 1, productId: 7, productName: "Bột Giặt OMO 3kg", skuCode: "SP007", unitName: "Bao", locationId: 5, warehouseCode: "WH01", shelfCode: "E1", systemQuantity: 60, actualQuantity: 60, variance: 0, variancePercent: 0, isCounted: true },
    { id: 5, auditSessionId: 1, productId: 3, productName: "Bánh Quy Cosy", skuCode: "SP003", unitName: "Gói", locationId: 3, warehouseCode: "WH01", shelfCode: "C1", systemQuantity: 80, actualQuantity: 75, variance: -5, variancePercent: -6.25, isCounted: true, notes: "Thiếu 5 gói, có thể do vỡ" },
    { id: 6, auditSessionId: 1, productId: 8, productName: "Cà Phê Trung Nguyên", skuCode: "SP008", unitName: "Hộp", locationId: 1, warehouseCode: "WH01", shelfCode: "A3", systemQuantity: 35, actualQuantity: 35, variance: 0, variancePercent: 0, isCounted: true },
  ],
  [
    { id: 7, auditSessionId: 2, productId: 1, productName: "Sữa Ông Thọ Hộp Giấy", skuCode: "SP001", unitName: "Hộp", locationId: 1, warehouseCode: "WH01", shelfCode: "A1", systemQuantity: 150, actualQuantity: 148, variance: -2, variancePercent: -1.33, isCounted: true },
    { id: 8, auditSessionId: 2, productId: 4, productName: "Dầu Ăn Simply 1L", skuCode: "SP004", unitName: "Chai", locationId: 1, warehouseCode: "WH01", shelfCode: "A2", systemQuantity: 0, actualQuantity: undefined, variance: 0, variancePercent: 0, isCounted: false },
    { id: 9, auditSessionId: 2, productId: 6, productName: "Nước Tương Chin-Su", skuCode: "SP006", unitName: "Chai", locationId: 2, warehouseCode: "WH01", shelfCode: "B1", systemQuantity: 25, actualQuantity: undefined, variance: 0, variancePercent: 0, isCounted: false },
  ],
];

export const mockAuditSessions: AuditSession[] = [
  {
    id: 1, auditCode: "KK-2026-0001", title: "Kiểm kê cuối tháng 3",
    auditDate: "2026-03-31", status: "Completed",
    locationFilter: "WH01", notes: "Kiểm kê toàn bộ kho chính",
    createdBy: 2, createdByName: "Nguyễn Văn A",
    completedAt: "2026-04-01T16:00:00Z", completedByName: "Trần Quản Lý",
    createdAt: "2026-03-31T08:00:00Z", updatedAt: "2026-04-01T16:00:00Z",
    items: mockAuditItems[0],
  },
  {
    id: 2, auditCode: "KK-2026-0002", title: "Kiểm kê kho A1 - Tháng 4",
    auditDate: "2026-04-13", status: "In Progress",
    locationFilter: "WH01-A1",
    createdBy: 3, createdByName: "Lê Thị B",
    createdAt: "2026-04-13T08:00:00Z", updatedAt: "2026-04-13T10:00:00Z",
    items: mockAuditItems[1],
  },
  {
    id: 3, auditCode: "KK-2026-0003", title: "Kiểm kê nhóm hàng tiêu dùng",
    auditDate: "2026-04-15", status: "Pending",
    categoryFilter: "CAT001",
    createdBy: 2, createdByName: "Nguyễn Văn A",
    createdAt: "2026-04-13T09:00:00Z", updatedAt: "2026-04-13T09:00:00Z",
    items: [],
  },
];
