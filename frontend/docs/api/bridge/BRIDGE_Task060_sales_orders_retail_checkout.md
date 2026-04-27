# BRIDGE — Task060 — `POST /api/v1/sales-orders/retail/checkout`

| Trường | Giá trị |
| :----- | :------ |
| **Task** | Task060 |
| **Path** | `POST /api/v1/sales-orders/retail/checkout` |
| **Mode** | wire-fe |
| **Date** | 28/04/2026 |
| **Đã đọc `FE_API_CONNECTION_GUIDE.md` (Y/N)** | Y |

## Bảng đối chiếu

| Hạng mục | API doc (mục) | Backend (file) | Frontend (`api/*.ts` + UI) | Khớp (Y/N) | Hành động |
| :-------- | :-------------- | :------------- | :--------------------------- | :--------: | :-------- |
| Path + `201` + envelope | §3, §5 | `SalesOrdersController.retailCheckout` | `salesOrdersApi.ts` — `postRetailCheckout` | **Y** | — |
| Body: `lines`, `walkIn`/`customerId`, `discountAmount`, `voucherCode`, `paymentStatus`, `notes`, `shiftReference` | §4, §8 | `RetailCheckoutRequest` | `buildRetailCheckoutBody` + `POSCartPanel` (`useMutation`) | **Y** | `shiftReference`: `sessionStorage.posShiftReference` hoặc field snapshot (mở rộng UI sau). |
| Walk-in | §2 | Như verify trước | `customerId == null` → `walkIn: true` | **Y** | — |
| Sau 201 | (prompt) | — | `clearCart` + `invalidateQueries` `SALES_ORDER_LIST_QUERY_KEY` + `POS_PRODUCTS_SEARCH_QUERY_KEY` + toast `orderCode` | **Y** | Chưa điều hướng trang chi tiết (chưa có route POS → detail). |
| 400 + `details` | §7 | `BusinessException` + `details` | `checkoutErrorToast` → `toast.error` + `description` từ `details` | **Y** | — |
| UI `/orders/retail` | §9 | — | `POSCartPanel`: Tiền mặt → `Paid`; Thẻ/Chuyển khoản → `Unpaid`; voucher “Áp dụng” lưu mã (BE xác nhận lúc checkout); tổng hiển thị “ước tính” (voucher không trừ client) | **Partial** | Đồng bộ % hiển thị voucher với BE khi có API tra policy. |

## Kết luận (≤5 dòng)

1. **`postRetailCheckout`** + **`buildRetailCheckoutBody`** trong `frontend/mini-erp/src/features/orders/api/salesOrdersApi.ts`.  
2. **`POSCartPanel`** gọi mutation, xử lý lỗi `ApiRequestError` (400 + `details`), sau thành công xóa giỏ + invalidate list POS + list đơn.  
3. **`Grep`** `retail/checkout` trong `mini-erp/src`: `salesOrdersApi.ts` (path POST).  
4. **`getFinalTotal`** (store) chỉ trừ `discount` tay; voucher chỉ gửi body — khớp “server tính lại” (§9).  
5. Build **mini-erp** `npm run build` **thành công**.
