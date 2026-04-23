import type { Order } from "./types"

export const mockOrders: Order[] = [
  // Wholesale
  { 
    id: 1, 
    orderCode: "BB0001", 
    customerName: "Công ty TNHH Tuấn Phát", 
    totalAmount: 45000000, 
    finalAmount: 45000000,
    status: "Completed", 
    date: "2024-03-01T10:00:00Z", 
    type: "Wholesale",
    itemsCount: 5,
    paymentStatus: "Paid"
  },
  { 
    id: 2, 
    orderCode: "BB0002", 
    customerName: "Đại lý An Khang", 
    totalAmount: 12000000, 
    finalAmount: 11500000,
    discountAmount: 500000,
    status: "Pending", 
    date: "2024-03-02T14:30:00Z", 
    type: "Wholesale",
    itemsCount: 3,
    paymentStatus: "Partial"
  },
  // Retail
  { 
    id: 3, 
    orderCode: "BL0001", 
    customerName: "Khách lẻ", 
    totalAmount: 250000, 
    finalAmount: 250000,
    status: "Completed", 
    date: "2024-03-03T09:15:00Z", 
    type: "Retail",
    itemsCount: 2,
    paymentStatus: "Paid"
  },
  { 
    id: 4, 
    orderCode: "BL0002", 
    customerName: "Khách lẻ", 
    totalAmount: 1200000, 
    finalAmount: 1100000,
    discountAmount: 100000,
    status: "Completed", 
    date: "2024-03-03T15:20:00Z", 
    type: "Retail",
    itemsCount: 4,
    paymentStatus: "Paid"
  },
  // Returns
  { 
    id: 5, 
    orderCode: "TH0001", 
    customerName: "Nguyễn Văn A", 
    totalAmount: 500000, 
    finalAmount: 500000,
    status: "Completed", 
    date: "2024-03-04T10:00:00Z", 
    type: "Return",
    itemsCount: 1,
    paymentStatus: "Paid",
    notes: "Trả hàng do lỗi sản xuất"
  }
]
