// ==========================================
// Product Management Feature Types
// ==========================================

// --- Categories (Task009) ---

export interface Category {
  id: number;
  categoryCode: string; // CAT001
  name: string;
  description?: string;
  parentId?: number;
  parentName?: string;
  sortOrder: number;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt: string;
  children?: Category[];
  productCount?: number;
}

// --- Products (Task010) ---

export interface Product {
  id: number;
  categoryId?: number;
  categoryName?: string;
  skuCode: string;
  barcode?: string;
  name: string;
  imageUrl?: string;
  description?: string;
  weight?: number;
  status: "Active" | "Inactive";
  currentStock?: number;
  currentPrice?: number;
  createdAt: string;
  updatedAt: string;
}

// --- Suppliers (Task011) ---

export interface Supplier {
  id: number;
  supplierCode: string; // NCC0001
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxCode?: string;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt: string;
  receiptCount?: number;
}

// --- Customers (Task012) ---

export interface Customer {
  id: number;
  customerCode: string; // KH00001
  name: string;
  phone: string;
  email?: string;
  address?: string;
  loyaltyPoints: number;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt: string;
  totalSpent?: number;
  orderCount?: number;
}
