export interface Order {
  id: number;
  orderCode: string;
  customerId?: number;
  customerName: string;
  totalAmount: number; // total before discount
  discountAmount?: number;
  finalAmount: number; // total after discount
  status: "Pending" | "Processing" | "Partial" | "Shipped" | "Delivered" | "Completed" | "Cancelled";
  date: string;
  type: "Wholesale" | "Retail" | "Return";
  itemsCount: number;
  paymentStatus: "Paid" | "Unpaid" | "Partial";
  notes?: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  skuCode: string;
  quantity: number;
  unitName: string;
  unitPrice: number;
  lineTotal: number;
}
