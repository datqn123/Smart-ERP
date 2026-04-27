# BRIDGE — Task052 — `DELETE /api/v1/customers/{id}`

> **Task:** Task052 | **Path:** `DELETE /api/v1/customers/{id}` | **Mode:** wire-fe | **Date:** 27/04/2026

**Đã đọc** [`frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md`](../../AGENTS/docs/FE_API_CONNECTION_GUIDE.md): Y

| Hạng mục | API doc + SRS | Backend | Frontend | Khớp | Hành động / ghi chú |
| :-- | :-- | :-- | :-- | :--: | :-- |
| `DELETE` 200 `{ id, deleted }` + message | [`API_Task052_customers_delete.md`](../API_Task052_customers_delete.md) §2, §4 | [`CustomersController#delete`](../../../../backend/smart-erp/src/main/java/com/example/smart_erp/catalog/controller/CustomersController.java) → `CustomerService.delete` | [`deleteCustomer`](../../../mini-erp/src/features/product-management/api/customersApi.ts); `useMutation` + `ConfirmDialog` trên [`CustomersPage`](../../../mini-erp/src/features/product-management/pages/CustomersPage.tsx); `invalidateQueries` với [`CUSTOMER_LIST_QUERY_KEY`](../../../mini-erp/src/features/product-management/api/customersApi.ts) (chuẩn bị Task048) | Y | Trang vẫn dùng mock list — sau Task048 cùng `queryKey` sẽ refetch. |
| Owner-only xóa | SRS / `assertOwnerOnly` | `CustomerService.delete` → `StockReceiptAccessPolicy.assertOwnerOnly` | `useAuthStore` `user.role === "Owner"`: ẩn nút xóa bảng + bulk toolbar; toast nếu Staff cố gắng | Y | Gọi API trực tiếp khi không Owner → **403** + toast message BE. |
| 409 + `details.reason` | Doc §6; BE thông điệp chi tiết hơn | `HAS_SALES_ORDERS` / `HAS_PARTNER_DEBTS` (và bulk: `NOT_FOUND`) | `toastCustomerDeleteError` — map thân thiện + `message` server | Y | — |
| 404 | §6 | Không tìm thấy sau lock | `ApiRequestError` → `errToast` | Y | — |

**Kết luận:** Xóa một khách hàng qua `DELETE` đã nối trên `CustomersPage` (confirm, toast, invalidate key danh sách). Bulk xóa toolbar chỉ Owner; logic bulk vẫn local cho đến Task053 (`POST …/bulk-delete`).
