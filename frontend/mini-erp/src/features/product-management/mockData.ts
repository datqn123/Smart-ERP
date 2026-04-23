import type { Category, Product, Supplier, Customer } from "./types";

// ==========================================
// Mock Data - Categories (Task009)
// ==========================================

export const mockCategories: Category[] = [
  { id: 1, categoryCode: "CAT001", name: "Thực phẩm", description: "Nhóm hàng thực phẩm", sortOrder: 1, status: "Active", createdAt: "2026-01-15T08:00:00Z", updatedAt: "2026-01-15T08:00:00Z", productCount: 45,
    children: [
      { id: 4, categoryCode: "CAT001-01", name: "Thực phẩm khô", parentId: 1, parentName: "Thực phẩm", description: "Gạo, mì, đồ khô", sortOrder: 1, status: "Active", createdAt: "2026-01-15T08:00:00Z", updatedAt: "2026-01-15T08:00:00Z", productCount: 20 },
      { id: 5, categoryCode: "CAT001-02", name: "Đồ uống", parentId: 1, parentName: "Thực phẩm", description: "Nước giải khát, bia, rượu", sortOrder: 2, status: "Active", createdAt: "2026-01-15T08:00:00Z", updatedAt: "2026-01-15T08:00:00Z", productCount: 25 },
    ]
  },
  { id: 2, categoryCode: "CAT002", name: "Hóa mỹ phẩm", description: "Xà phòng, dầu gội, kem đánh răng", sortOrder: 2, status: "Active", createdAt: "2026-01-15T08:00:00Z", updatedAt: "2026-01-15T08:00:00Z", productCount: 30,
    children: [
      { id: 6, categoryCode: "CAT002-01", name: "Chăm sóc cá nhân", parentId: 2, parentName: "Hóa mỹ phẩm", sortOrder: 1, status: "Active", createdAt: "2026-01-15T08:00:00Z", updatedAt: "2026-01-15T08:00:00Z", productCount: 18 },
    ]
  },
  { id: 3, categoryCode: "CAT003", name: "Đồ gia dụng", description: "Vật dụng gia đình", sortOrder: 3, status: "Active", createdAt: "2026-01-15T08:00:00Z", updatedAt: "2026-01-15T08:00:00Z", productCount: 15 },
  { id: 7, categoryCode: "CAT004", name: "Sữa các loại", parentId: 1, parentName: "Thực phẩm", description: "Sữa tươi, sữa đặc, sữa bột", sortOrder: 3, status: "Active", createdAt: "2026-02-01T08:00:00Z", updatedAt: "2026-02-01T08:00:00Z", productCount: 12 },
  { id: 8, categoryCode: "CAT005", name: "Hàng cũ", description: "Danh mục không còn sử dụng", sortOrder: 99, status: "Inactive", createdAt: "2025-06-01T08:00:00Z", updatedAt: "2025-12-01T08:00:00Z", productCount: 0 },
];

// ==========================================
// Mock Data - Products (Task010)
// ==========================================

export const mockProducts: Product[] = [
  { id: 1, categoryId: 7, categoryName: "Sữa các loại", skuCode: "SP001", name: "Sữa Ông Thọ Hộp Giấy", imageUrl: "", description: "Sữa đặc có đường", weight: 380, status: "Active", currentStock: 150, currentPrice: 25000, createdAt: "2026-01-20T08:00:00Z", updatedAt: "2026-04-10T10:00:00Z" },
  { id: 2, categoryId: 5, categoryName: "Đồ uống", skuCode: "SP002", name: "Nước Ngọt Coca Cola 1.5L", imageUrl: "", description: "Nước giải khát", weight: 1500, status: "Active", currentStock: 45, currentPrice: 12000, createdAt: "2026-01-20T08:00:00Z", updatedAt: "2026-04-11T14:20:00Z" },
  { id: 3, categoryId: 4, categoryName: "Thực phẩm khô", skuCode: "SP003", name: "Bánh Quy Cosy", imageUrl: "", description: "Bánh quy hỗn hợp", weight: 300, status: "Active", currentStock: 80, currentPrice: 8000, createdAt: "2026-01-20T08:00:00Z", updatedAt: "2026-04-10T09:15:00Z" },
  { id: 4, categoryId: 1, categoryName: "Thực phẩm", skuCode: "SP004", name: "Dầu Ăn Simply 1L", imageUrl: "", description: "Dầu ăn thực vật", weight: 1000, status: "Inactive", currentStock: 0, currentPrice: 35000, createdAt: "2026-01-20T08:00:00Z", updatedAt: "2026-04-09T16:45:00Z" },
  { id: 5, categoryId: 4, categoryName: "Thực phẩm khô", skuCode: "SP005", name: "Mì Gói Hảo Hảo", imageUrl: "", description: "Mì ăn liền tôm chua cay", weight: 75, status: "Active", currentStock: 500, currentPrice: 3500, createdAt: "2026-01-20T08:00:00Z", updatedAt: "2026-04-12T08:00:00Z" },
  { id: 6, categoryId: 1, categoryName: "Thực phẩm", skuCode: "SP006", name: "Nước Tương Chin-Su", imageUrl: "", description: "Nước tương 500ml", weight: 500, status: "Active", currentStock: 25, currentPrice: 18000, createdAt: "2026-01-20T08:00:00Z", updatedAt: "2026-04-08T11:30:00Z" },
  { id: 7, categoryId: 2, categoryName: "Hóa mỹ phẩm", skuCode: "SP007", name: "Bột Giặt OMO 3kg", imageUrl: "", description: "Bột giặt hương chanh", weight: 3000, status: "Active", currentStock: 60, currentPrice: 85000, createdAt: "2026-01-20T08:00:00Z", updatedAt: "2026-04-07T13:00:00Z" },
  { id: 8, categoryId: 5, categoryName: "Đồ uống", skuCode: "SP008", name: "Cà Phê Trung Nguyên", imageUrl: "", description: "Cà phê hòa tan 20 gói", weight: 320, status: "Active", currentStock: 35, currentPrice: 45000, createdAt: "2026-01-20T08:00:00Z", updatedAt: "2026-04-06T10:00:00Z" },
];

// ==========================================
// Mock Data - Suppliers (Task011)
// ==========================================

export const mockSuppliers: Supplier[] = [
  { id: 1, supplierCode: "NCC0001", name: "Công ty TNHH Vinamilk", contactPerson: "Nguyễn Văn A", phone: "0901234567", email: "contact@vinamilk.com.vn", address: "10 Tân Trào, Quận 7, TP.HCM", taxCode: "0300123456", status: "Active", createdAt: "2025-06-01T08:00:00Z", updatedAt: "2026-03-15T10:00:00Z", receiptCount: 25 },
  { id: 2, supplierCode: "NCC0002", name: "Nhà phân phối PepsiCo", contactPerson: "Trần Thị B", phone: "0912345678", email: "sales@pepsico.vn", address: "20 Nguyễn Huệ, Quận 1, TP.HCM", taxCode: "0300234567", status: "Active", createdAt: "2025-07-15T08:00:00Z", updatedAt: "2026-03-20T14:00:00Z", receiptCount: 18 },
  { id: 3, supplierCode: "NCC0003", name: "Công ty Hàng Tiêu Dùng", contactPerson: "Lê Văn C", phone: "0923456789", email: "info@h tieudung.vn", address: "15 Lê Lợi, Quận 3, TP.HCM", taxCode: "0300345678", status: "Active", createdAt: "2025-08-01T08:00:00Z", updatedAt: "2026-04-01T09:00:00Z", receiptCount: 12 },
  { id: 4, supplierCode: "NCC0004", name: "Đại lý Bánh kẹo Hà Nội", contactPerson: "Phạm Thị D", phone: "0934567890", email: "", address: "50 Phố Huế, Hà Nội", taxCode: "0100456789", status: "Active", createdAt: "2025-09-01T08:00:00Z", updatedAt: "2026-02-15T11:00:00Z", receiptCount: 8 },
  { id: 5, supplierCode: "NCC0005", name: "Công ty Mỹ phẩm Hàn Quốc", contactPerson: "Kim Min Soo", phone: "0945678901", email: "export@kbeauty.kr", address: "Seoul, Korea", taxCode: "", status: "Inactive", createdAt: "2025-03-01T08:00:00Z", updatedAt: "2025-12-01T08:00:00Z", receiptCount: 3 },
];

// ==========================================
// Mock Data - Customers (Task012)
// ==========================================

export const mockCustomers: Customer[] = [
  { id: 1, customerCode: "KH00001", name: "Nguyễn Thị Mai", phone: "0909111222", email: "mai.nguyen@gmail.com", address: "123 Nguyễn Trãi, Quận 5, TP.HCM", loyaltyPoints: 850, status: "Active", createdAt: "2025-01-15T08:00:00Z", updatedAt: "2026-04-10T10:00:00Z", totalSpent: 8500000, orderCount: 42 },
  { id: 2, customerCode: "KH00002", name: "Trần Văn Hùng", phone: "0919222333", email: "hung.tran@yahoo.com", address: "45 Lê Văn Sỹ, Quận 3, TP.HCM", loyaltyPoints: 320, status: "Active", createdAt: "2025-03-20T08:00:00Z", updatedAt: "2026-04-08T14:00:00Z", totalSpent: 3200000, orderCount: 15 },
  { id: 3, customerCode: "KH00003", name: "Lê Thị Hương", phone: "0929333444", email: "huong.le@gmail.com", address: "78 Điện Biên Phủ, Bình Thạnh, TP.HCM", loyaltyPoints: 50, status: "Active", createdAt: "2025-06-10T08:00:00Z", updatedAt: "2026-04-05T09:00:00Z", totalSpent: 500000, orderCount: 3 },
  { id: 4, customerCode: "KH00004", name: "Phạm Văn Đức", phone: "0939444555", email: "", address: "200 Võ Thị Sáu, Quận 3, TP.HCM", loyaltyPoints: 1200, status: "Active", createdAt: "2024-11-01T08:00:00Z", updatedAt: "2026-04-12T11:00:00Z", totalSpent: 12000000, orderCount: 68 },
  { id: 5, customerCode: "KH00005", name: "Hoàng Thị Lan", phone: "0949555666", email: "lan.hoang@outlook.com", address: "15 Cách Mạng Tháng 8, Quận 10, TP.HCM", loyaltyPoints: 0, status: "Inactive", createdAt: "2025-09-15T08:00:00Z", updatedAt: "2025-12-20T08:00:00Z", totalSpent: 150000, orderCount: 1 },
  { id: 6, customerCode: "KH00006", name: "Võ Thành Long", phone: "0959666777", email: "long.vo@gmail.com", address: "90 Nguyễn Đình Chiểu, Phú Nhuận, TP.HCM", loyaltyPoints: 480, status: "Active", createdAt: "2025-04-01T08:00:00Z", updatedAt: "2026-04-11T16:00:00Z", totalSpent: 4800000, orderCount: 22 },
];
