# API: Tạo phiếu xuất gắn đơn & duyệt

## `POST /api/v1/stock-dispatches/from-order`

- **Quyền**: `can_manage_inventory`
- **Body** (JSON): `orderId` (int), `dispatchDate` (ISO date), `notes` (optional), `lines[]`: `inventoryId`, `quantity`, `unitPriceSnapshot` (decimal)
- **Trạng thái tạo**: `Pending` nếu mọi dòng đủ tồn; `Partial` nếu có dòng vượt tồn (vẫn lưu phiếu).
- **Notify**: gửi `SystemAlert` tới user **Owner** và **Admin** active (trừ người tạo nếu họ là Owner/Admin để giảm spam).

## `POST /api/v1/stock-dispatches/{id}/approve`

- **Quyền**: `can_manage_inventory` + JWT role **Owner** hoặc **Admin**
- **Điều kiện**: phiếu gắn `order_id`, `status = Pending`, không còn thiếu tồn (`stockdispatch_lines` vs `inventory`).
- **Kết quả**: `status` → `WaitingDispatch` (staff tiếp luồng Delivering → Delivered; trừ kho khi Delivered).

## PATCH phiếu chờ duyệt / thiếu hàng

- Staff (không Owner/Admin): **403** khi phiếu đang `Pending`/`Partial` và có `stockdispatch_lines`.
- Owner/Admin: được PATCH dòng (cho phép thiếu tồn khi sửa), không đổi `status` qua PATCH (dùng `/approve`).

## DB

- Flyway `V36`: mở rộng CHECK `stockdispatches.status`; cột `stockdispatch_lines.unit_price_snapshot`.
