# Prompt — Task090 (UC9/UC10) — Trừ tồn kho khi POS checkout + hoàn kho khi hủy đơn Retail (bridge qua Task060 + Task058)

Tham chiếu workflow: [`backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md`](../../../backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md).

**SRS nguồn (chân lý triển khai):** [`backend/docs/srs/SRS_Task090_uc9-retail-checkout-stock-deduction.md`](../../../backend/docs/srs/SRS_Task090_uc9-retail-checkout-stock-deduction.md) — **Approved** 29/04/2026; OQ-1..OQ-6 đã chốt (StoreProfiles kho mặc định, FEFO, FOR UPDATE, cancel hoàn kho).

**API markdown liên quan (vì không có `API_Task090` riêng):**

- [`frontend/docs/api/API_Task060_sales_orders_retail_checkout.md`](../../docs/api/API_Task060_sales_orders_retail_checkout.md) — `POST /api/v1/sales-orders/retail/checkout` (đã đồng bộ trừ tồn theo `StoreProfiles`)
- [`frontend/docs/api/API_Task058_sales_orders_cancel.md`](../../docs/api/API_Task058_sales_orders_cancel.md) — `POST /api/v1/sales-orders/{id}/cancel` (Retail POS cancel hoàn kho)

**Controller / service / migration BE tham chiếu (để grep/đối chiếu):**

- `backend/smart-erp/src/main/java/com/example/smart_erp/sales/controller/SalesOrdersController.java`
- `backend/smart-erp/src/main/java/com/example/smart_erp/sales/service/SalesOrderService.java`
- `backend/smart-erp/src/main/java/com/example/smart_erp/sales/stock/RetailStockService.java`
- `backend/smart-erp/src/main/java/com/example/smart_erp/sales/stock/RetailStockJdbcRepository.java`
- Flyway: `backend/smart-erp/src/main/resources/db/migration/V20__task090_storeprofiles_default_retail_location.sql`

---

## 0. Master (dán một lần — outline + SRS)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, mục 2b–2c, 3, 5, 7).

Bối cảnh SRS: @backend/docs/srs/SRS_Task090_uc9-retail-checkout-stock-deduction.md — §4 OQ đã chốt; §10 SQL; BR-1..BR-4; checkout trừ tồn FEFO + FOR UPDATE + StockDispatches/InventoryLogs + dispatched_qty; cancel Retail hoàn kho.

Bước 1: Đọc @frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
Bước 2: Chạy 2 phiên verify (Task060 checkout, Task058 cancel) theo mục 0.1a.
Output: tạo/cập nhật 2 file bridge: BRIDGE_Task060_sales_orders_retail_checkout.md và BRIDGE_Task058_sales_orders_cancel.md.
```

### 0.1 Một dòng mỗi Path (`Mode=verify`)

```text
API_BRIDGE | Task=Task060 | Path=POST /api/v1/sales-orders/retail/checkout | Mode=verify
```

```text
API_BRIDGE | Task=Task058 | Path=POST /api/v1/sales-orders/{id}/cancel | Mode=verify
```

### 0.1a Verify — gộp sẵn (dán từng block = một phiên)

#### Task060 — verify (checkout có trừ tồn)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task060 | Path=POST /api/v1/sales-orders/retail/checkout | Mode=verify
Context SRS: @backend/docs/srs/SRS_Task090_uc9-retail-checkout-stock-deduction.md — OQ-1 (qty_base = qty*conversion_rate), OQ-2 (StoreProfiles default location), OQ-3 (FEFO), OQ-6 (FOR UPDATE + 409 thiếu tồn), §10 (StockDispatches + InventoryLogs + dispatched_qty).

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task060_sales_orders_retail_checkout.md
Grep "/api/v1/sales-orders/retail/checkout" trong @backend/smart-erp/src/main/java/com/example/smart_erp/sales
Grep "default_retail_location_id" trong @backend/smart-erp/src/main/resources/db/migration
Grep /api/v1/sales-orders/retail/checkout trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task060_sales_orders_retail_checkout.md
```

#### Task058 — verify (cancel Retail hoàn kho)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task058 | Path=POST /api/v1/sales-orders/{id}/cancel | Mode=verify
Context SRS: @backend/docs/srs/SRS_Task090_uc9-retail-checkout-stock-deduction.md — OQ-5 (cancel Retail hoàn kho), BR-3 (reverse log + huỷ dispatch + reset dispatched_qty), §11 AC.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task058_sales_orders_cancel.md
Grep "/api/v1/sales-orders/" trong @backend/smart-erp/src/main/java/com/example/smart_erp/sales
Grep /api/v1/sales-orders/ trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task058_sales_orders_cancel.md
```

---

## 0.2 `Mode=wire-fe` (nếu sprint yêu cầu nối UI)

### Task060 — wire-fe (POS checkout + invalidate tồn)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task060 | Path=POST /api/v1/sales-orders/retail/checkout | Mode=wire-fe
Context UI: `/orders/retail` — `RetailPage` / `POSCartPanel` (checkout), `POSProductSelector` (Task059).

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task060_sales_orders_retail_checkout.md
Bối cảnh SRS: @backend/docs/srs/SRS_Task090_uc9-retail-checkout-stock-deduction.md — §1.1 (invalidate products/list), OQ-2 (không có locationId trong body).

Thực hiện:
1. `features/orders/api/salesOrdersApi.ts` — hàm checkout gọi apiJson đúng spec (không thêm locationId).
2. `POSCartPanel.tsx` — useMutation; onSuccess invalidate: products list (`product-management/products/list`) + tùy UX thêm inventory summary.
3. Output cập nhật bridge cột Frontend.

Output: @frontend/docs/api/bridge/BRIDGE_Task060_sales_orders_retail_checkout.md
```

### Task058 — wire-fe (hủy đơn Retail + refresh tồn)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task058 | Path=POST /api/v1/sales-orders/{id}/cancel | Mode=wire-fe
Context UI: nút hủy ở wholesale/returns/retail (OrderTable / OrderDetailDialog).

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task058_sales_orders_cancel.md

Thực hiện:
1. `features/orders/api/salesOrdersApi.ts` — postCancelSalesOrder.
2. Sau 200: invalidate list đơn + invalidate products list để tồn cập nhật (Task090 Retail cancel hoàn kho).
3. Output cập nhật bridge.

Output: @frontend/docs/api/bridge/BRIDGE_Task058_sales_orders_cancel.md
```

---

## Ngữ cảnh SRS (nhắc trong mỗi phiên)

`SRS_Task090` là task **mở rộng logic** nhưng **không đổi Path**: dùng Task060 + Task058 làm điểm bridge. Quy tắc chính: StoreProfiles kho mặc định, FEFO, `FOR UPDATE` + 409 thiếu tồn, dispatch/log/dispatched_qty, cancel Retail hoàn kho.

