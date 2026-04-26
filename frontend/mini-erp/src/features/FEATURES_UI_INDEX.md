# Mini-ERP — Index giao diện (`src/features/`)

> **Mục đích:** Agent / Dev tra **route → file page → feature** trong **một file**, tránh quét cả `features/`.  
> **Route nguồn:** [`../App.tsx`](../App.tsx) · **Nhãn menu:** [`../components/shared/layout/Sidebar.tsx`](../components/shared/layout/Sidebar.tsx)

---

## 1. Bảng route → màn hình (ưu tiên đọc khi sửa UI)

| Path | Page (export) | File |
| :--- | :--- | :--- |
| `/login` | `LoginPage` | `auth/pages/LoginPage.tsx` |
| `/dashboard` | `DashboardPage` | `dashboard/pages/DashboardPage.tsx` |
| `/dashboard/ai-insights` | *Placeholder* (không trong `features/`) | `App.tsx` |
| `/inventory/stock` | `StockPage` | `inventory/pages/StockPage.tsx` |
| `/inventory/locations` | `WarehouseLocationsPage` | `inventory/pages/WarehouseLocationsPage.tsx` |
| `/inventory/inbound` | `InboundPage` | `inventory/pages/InboundPage.tsx` |
| `/inventory/dispatch` | `DispatchPage` | `inventory/pages/DispatchPage.tsx` |
| `/inventory/audit` | `AuditPage` | `inventory/pages/AuditPage.tsx` |
| `/products/categories` | `CategoriesPage` | `product-management/pages/CategoriesPage.tsx` |
| `/products/list` | `ProductsPage` | `product-management/pages/ProductsPage.tsx` |
| `/products/suppliers` | `SuppliersPage` | `product-management/pages/SuppliersPage.tsx` |
| `/products/customers` | `CustomersPage` | `product-management/pages/CustomersPage.tsx` |
| `/orders/retail` | `RetailPage` | `orders/pages/RetailPage.tsx` |
| `/orders/wholesale` | `WholesalePage` | `orders/pages/WholesalePage.tsx` |
| `/orders/returns` | `ReturnsPage` | `orders/pages/ReturnsPage.tsx` |
| `/approvals/pending` | `PendingApprovalsPage` (default export) | `approvals/pages/PendingApprovalsPage.tsx` |
| `/approvals/history` | `ApprovalHistoryPage` | `approvals/pages/ApprovalHistoryPage.tsx` |
| `/cashflow/transactions` | `TransactionsPage` | `cashflow/pages/TransactionsPage.tsx` |
| `/cashflow/debt` | `DebtPage` | `cashflow/pages/DebtPage.tsx` |
| `/cashflow/ledger` | `LedgerPage` | `cashflow/pages/LedgerPage.tsx` |
| `/analytics/revenue` | `RevenuePage` | `analytics/pages/RevenuePage.tsx` |
| `/analytics/top-products` | `TopProductsPage` | `analytics/pages/TopProductsPage.tsx` |
| `/ai/chat` | `ChatBotPage` | `ai/pages/ChatBotPage.tsx` |
| `/settings/store-info` | `StoreInfoPage` | `settings/pages/StoreInfoPage.tsx` |
| `/settings/employees` | `EmployeesPage` | `settings/pages/EmployeesPage.tsx` |
| `/settings/alerts` | `AlertSettingsPage` | `settings/pages/AlertSettingsPage.tsx` |
| `/settings/system-logs` | `LogsPage` | `settings/pages/LogsPage.tsx` |

**Ghi chú:** `inventory/pages/CategoriesPage.tsx` **tồn tại** nhưng **không** có `<Route>` trong `App.tsx` (trùng tên với PM categories — chỉ PM route `/products/categories`).

---

## 2. Feature → component UI chính (không liệt kê `*.test.tsx`)

### `auth/`

| Loại | File |
| :--- | :--- |
| Form đăng nhập | `components/LoginForm.tsx` |
| API (nối BE) | `api/authApi.ts` |

### `dashboard/`

| Loại | File |
| :--- | :--- |
| Trang chủ | `pages/DashboardPage.tsx` |

### `inventory/`

| Loại | File |
| :--- | :--- |
| API (nối BE) | `api/inventoryApi.ts` — Task005–009 tồn kho; `api/stockReceiptsApi.ts` — Task013–017 + submit + approve (Task019) + **reject** `POST …/{id}/reject` (Task020) |
| Bảng / toolbar tồn | `components/StockTable.tsx`, `StockToolbar.tsx`, …; `pages/StockPage` — KPI qua Task009 (`getInventorySummary`); 20 bản ghi lần đầu, tải thêm khi **cuộn tới gần cuối** (`useInfiniteQuery`) |
| Nhập kho | `pages/InboundPage.tsx` — list phiếu Task013 (`useInfiniteQuery` + `getStockReceiptList`); `components/ReceiptForm.tsx`, `ReceiptTable.tsx`, `ReceiptDetailPanel.tsx`, `ReceiptDetailDialog.tsx` |
| Xuất / điều phối | `components/DispatchForm.tsx`, `DispatchTable.tsx`, `DispatchDetailDialog.tsx`, `DispatchDetailPanel.tsx` |
| Kiểm kê | `components/AuditSessionsTable.tsx` |
| Kho vị trí | `components/LocationTable.tsx`, `LocationToolbar.tsx` |
| Badge trạng thái | `components/StatusBadge.tsx` |

### `product-management/`

| Loại | File |
| :--- | :--- |
| Danh mục | `components/CategoryTable.tsx`, `CategoryToolbar.tsx`, `CategoryForm.tsx`, `CategoryDetailDialog.tsx` |
| Sản phẩm | `components/ProductTable.tsx`, `ProductToolbar.tsx`, `ProductForm.tsx`, `ProductDetailDialog.tsx` |
| NCC | `components/SupplierTable.tsx`, `SupplierToolbar.tsx`, `SupplierForm.tsx`, `SupplierDetailDialog.tsx` |
| Khách | `components/CustomerTable.tsx`, `CustomerToolbar.tsx`, `CustomerForm.tsx`, `CustomerDetailDialog.tsx` |

### `orders/`

| Loại | File |
| :--- | :--- |
| POS / đơn | `components/OrderTable.tsx`, `OrderToolbar.tsx`, `OrderDetailPanel.tsx`, `OrderDetailDialog.tsx`, `OrderFormDialog.tsx`, `POSCartPanel.tsx`, `POSProductSelector.tsx` |
| Trả hàng | `components/ReturnFormDialog.tsx` |

### `approvals/`

| Loại | File |
| :--- | :--- |
| *(chủ yếu trong `pages/`)* | Xem `PendingApprovalsPage`, `ApprovalHistoryPage` |

### `cashflow/`

| Loại | File |
| :--- | :--- |
| Thu chi | `components/TransactionTable.tsx`, `TransactionToolbar.tsx`, `TransactionFormDialog.tsx`, `TransactionDetailDialog.tsx`, `TransactionDetailModal.tsx` |
| Nợ | `components/DebtTable.tsx`, `DebtToolbar.tsx` |
| Sổ cái | `components/LedgerTable.tsx`, `LedgerToolbar.tsx` |

### `analytics/`

| Loại | File |
| :--- | :--- |
| *(trang trong `pages/`)* | `RevenuePage`, `TopProductsPage` |

### `ai/`

| Loại | File |
| :--- | :--- |
| Chat | `pages/ChatBotPage.tsx` |

### `settings/`

| Loại | File |
| :--- | :--- |
| Nhân viên | `components/EmployeeTable.tsx`, `EmployeeToolbar.tsx`, `EmployeeForm.tsx`, `EmployeeDetailDialog.tsx` |
| API (nối BE) | `api/usersApi.ts` (`POST /api/v1/users` — Task078) |
| Nhật ký | `components/LogTable.tsx`, `LogToolbar.tsx` |

---

## 3. Cách tra nhanh (Agent)

1. Có **URL path** → dùng **bảng 1**.  
2. Có **tên màn** (tiếng Việt) → `Sidebar.tsx` `label` → `path` → **bảng 1**.  
3. Sửa **bảng / dialog** trong feature → **bảng 2** feature tương ứng → `Read` **đúng** file (không `Glob` cả thư mục nếu đã biết tên).

**Cập nhật index:** khi thêm `<Route>` trong `App.tsx` hoặc page mới dưới `features/**/pages/`, chỉnh **bảng 1** (và bảng 2 nếu có component chính mới).
