# Prompt đủ cho 7 Task — Đơn bán (UC9): list, CRUD meta, hủy, POS tìm hàng, checkout bán lẻ (Task054–Task060)

Tham chiếu workflow: [`backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md`](../../../backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md).

**SRS nguồn (chân lý nghiệp vụ + §8 hợp đồng):** [`backend/docs/srs/SRS_Task054-060_sales-orders-pos-and-retail-checkout.md`](../../../backend/docs/srs/SRS_Task054-060_sales-orders-pos-and-retail-checkout.md) — **§8.1** bảng endpoint; **§8.2–§8.3** lỗi; **§2** C1–C7; **§6** RBAC (`can_manage_orders`); **OQ-8a:** `GET /sales-orders` **không** gửi `orderChannel` → chỉ **Owner/Admin** (Staff **403**); **OQ-5** hủy lặp **200** idempotent; **OQ-6** hủy khi đã xuất → **409**; **§12 GAP:** đồng bộ doc `posShiftRef` / voucher với **DOC_SYNC** khi drift.

Sau **G-DEV** (`mvn verify` xanh) — theo `WORKFLOW_RULE` §0.3: mỗi `Path` **một** phiên `API_BRIDGE` (khuyến nghị `Mode=verify` trước, rồi `wire-fe` khi cần nối `mini-erp`).

**Controller BE tham chiếu:**

- [`backend/smart-erp/src/main/java/com/example/smart_erp/sales/controller/SalesOrdersController.java`](../../../backend/smart-erp/src/main/java/com/example/smart_erp/sales/controller/SalesOrdersController.java) — prefix `/api/v1/sales-orders`
- [`backend/smart-erp/src/main/java/com/example/smart_erp/sales/controller/PosProductsController.java`](../../../backend/smart-erp/src/main/java/com/example/smart_erp/sales/controller/PosProductsController.java) — prefix `/api/v1/pos/products`

---

## 0. Master (dán một lần — outline + SRS)

Dùng khi Owner cần agent đọc SRS trước, rồi tách **7 phiên** theo bảng dưới (không gộp thành một prompt “làm hết” thay cho từng `BRIDGE_*`).

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, mục 2b–2c, 3, 5, 7).

Bối cảnh SRS: @backend/docs/srs/SRS_Task054-060_sales-orders-pos-and-retail-checkout.md — §8.1 endpoint; §2 C1–C7; §6 RBAC; §4 OQ (WALKIN, Delivered retail, Vouchers, pos_shift_ref, idempotent cancel, list kênh Owner/Admin); §12 GAP (doc posShiftRef).

Bước 1: Đọc @frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
Bước 2: Với từng dòng bảng §8.1 SRS (054→060), chạy một prompt riêng mục 0.1a "Verify" tương ứng — output `frontend/docs/api/bridge/BRIDGE_TaskXXX_*.md` đúng mục 5 file API_BRIDGE.

Controller BE: @backend/smart-erp/src/main/java/com/example/smart_erp/sales/controller/SalesOrdersController.java và PosProductsController.java
```

### 0.1 Một dòng mỗi Path (`Mode=verify`)

```text
API_BRIDGE | Task=Task054 | Path=GET /api/v1/sales-orders | Mode=verify
```

```text
API_BRIDGE | Task=Task055 | Path=GET /api/v1/sales-orders/{id} | Mode=verify
```

```text
API_BRIDGE | Task=Task056 | Path=POST /api/v1/sales-orders | Mode=verify
```

```text
API_BRIDGE | Task=Task057 | Path=PATCH /api/v1/sales-orders/{id} | Mode=verify
```

```text
API_BRIDGE | Task=Task058 | Path=POST /api/v1/sales-orders/{id}/cancel | Mode=verify
```

```text
API_BRIDGE | Task=Task059 | Path=GET /api/v1/pos/products | Mode=verify
```

```text
API_BRIDGE | Task=Task060 | Path=POST /api/v1/sales-orders/retail/checkout | Mode=verify
```

**Cách dùng:** dòng **0.1** = lệnh tối thiểu; dán thêm **master §0** nếu agent cần SRS/Controller. Hoặc dùng **0.1a** — một block cho mỗi phiên.

### 0.1a Verify — gộp sẵn (dán từng block = một phiên `API_BRIDGE`)

#### Task054

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, mục 2b–2c, 3, 5, 7).

Bối cảnh SRS: @backend/docs/srs/SRS_Task054-060_sales-orders-pos-and-retail-checkout.md — §8.1 dòng 054, C1, BR-6, §6 — list phân trang + lọc; **OQ-8a:** không gửi `orderChannel` → chỉ Owner/Admin (Staff 403).
Controller BE: @backend/smart-erp/src/main/java/com/example/smart_erp/sales/controller/SalesOrdersController.java

API_BRIDGE | Task=Task054 | Path=GET /api/v1/sales-orders | Mode=verify

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task054_sales_orders_get_list.md
Grep "/api/v1/sales-orders" trong @backend/smart-erp/src/main/java/com/example/smart_erp/sales
Grep /api/v1/sales-orders trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task054_sales_orders_get_list.md
```

#### Task055

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, mục 2b–2c, 3, 5, 7).

Bối cảnh SRS: @backend/docs/srs/SRS_Task054-060_sales-orders-pos-and-retail-checkout.md — §8.1 dòng 055, C2; chi tiết header + `lines`; **§12:** `posShiftRef` (nếu BE trả) — đối chiếu `API_Task055` / DOC_SYNC.
Controller BE: @backend/smart-erp/src/main/java/com/example/smart_erp/sales/controller/SalesOrdersController.java

API_BRIDGE | Task=Task055 | Path=GET /api/v1/sales-orders/{id} | Mode=verify

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task055_sales_orders_get_by_id.md
Grep sales-orders trong @backend/smart-erp/src/main/java/com/example/smart_erp/sales
Grep sales-orders trong @frontend/mini-erp/src/features/orders

Output: @frontend/docs/api/bridge/BRIDGE_Task055_sales_orders_get_by_id.md
```

#### Task056

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, mục 2b–2c, 3, 5, 7).

Bối cảnh SRS: @backend/docs/srs/SRS_Task054-060_sales-orders-pos-and-retail-checkout.md — §8.1 dòng 056, C3, BR-1 — `orderChannel` ∈ {Wholesale, Return}; **không** tạo Retail qua endpoint này (→ Task060).
Controller BE: @backend/smart-erp/src/main/java/com/example/smart_erp/sales/controller/SalesOrdersController.java

API_BRIDGE | Task=Task056 | Path=POST /api/v1/sales-orders | Mode=verify

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task056_sales_orders_post.md
Grep POST sales-orders trong @backend/smart-erp/src/main/java/com/example/smart_erp/sales
Grep sales-orders trong @frontend/mini-erp/src/features/orders

Output: @frontend/docs/api/bridge/BRIDGE_Task056_sales_orders_post.md
```

#### Task057

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, mục 2b–2c, 3, 5, 7).

Bối cảnh SRS: @backend/docs/srs/SRS_Task054-060_sales-orders-pos-and-retail-checkout.md — §8.1 dòng 057, C4, BR-4 — đơn Cancelled → PATCH **409**.
Controller BE: @backend/smart-erp/src/main/java/com/example/smart_erp/sales/controller/SalesOrdersController.java

API_BRIDGE | Task=Task057 | Path=PATCH /api/v1/sales-orders/{id} | Mode=verify

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task057_sales_orders_patch.md
Grep PATCH sales-orders trong @backend/smart-erp/src/main/java/com/example/smart_erp/sales
Grep patch.*sales|sales-orders trong @frontend/mini-erp/src/features/orders

Output: @frontend/docs/api/bridge/BRIDGE_Task057_sales_orders_patch.md
```

#### Task058

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, mục 2b–2c, 3, 5, 7).

Bối cảnh SRS: @backend/docs/srs/SRS_Task054-060_sales-orders-pos-and-retail-checkout.md — §8.1 dòng 058, C5, BR-3 — **OQ-5** idempotent 200; **OQ-6** 409 nếu đã xuất/dispatched.
Controller BE: @backend/smart-erp/src/main/java/com/example/smart_erp/sales/controller/SalesOrdersController.java

API_BRIDGE | Task=Task058 | Path=POST /api/v1/sales-orders/{id}/cancel | Mode=verify

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task058_sales_orders_cancel.md
Grep cancel trong @backend/smart-erp/src/main/java/com/example/smart_erp/sales
Grep cancel trong @frontend/mini-erp/src/features/orders

Output: @frontend/docs/api/bridge/BRIDGE_Task058_sales_orders_cancel.md
```

#### Task059

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, mục 2b–2c, 3, 5, 7).

Bối cảnh SRS: @backend/docs/srs/SRS_Task054-060_sales-orders-pos-and-retail-checkout.md — §8.1 dòng 059, C6, **OQ-7a** — `availableQty` từ Inventory + quy đổi `ProductUnits`.
Controller BE: @backend/smart-erp/src/main/java/com/example/smart_erp/sales/controller/PosProductsController.java

API_BRIDGE | Task=Task059 | Path=GET /api/v1/pos/products | Mode=verify

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task059_pos_products_get_search.md
Grep "/api/v1/pos/products" trong @backend/smart-erp/src/main/java/com/example/smart_erp/sales
Grep /api/v1/pos/products trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task059_pos_products_get_search.md
```

#### Task060

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, mục 2b–2c, 3, 5, 7).

Bối cảnh SRS: @backend/docs/srs/SRS_Task054-060_sales-orders-pos-and-retail-checkout.md — §8.1 dòng 060, C7, §7.2, BR-2, BR-5 — walk-in WALKIN, voucher DB, `shiftReference` → `posShiftRef`, mặc định status Delivered; **§12 GAP** doc response.
Controller BE: @backend/smart-erp/src/main/java/com/example/smart_erp/sales/controller/SalesOrdersController.java

API_BRIDGE | Task=Task060 | Path=POST /api/v1/sales-orders/retail/checkout | Mode=verify

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task060_sales_orders_retail_checkout.md
Grep retail/checkout trong @backend/smart-erp/src/main/java/com/example/smart_erp/sales
Grep retail/checkout|pos/products trong @frontend/mini-erp/src/features/orders

Output: @frontend/docs/api/bridge/BRIDGE_Task060_sales_orders_retail_checkout.md
```

### 0.2 `Mode=fix-doc` (cập nhật contract / samples, không bắt buộc wire code)

Dùng khi drift doc ↔ controller / cần bổ sung `samples/Task054`…`Task060` (theo **DOC_SYNC** mục 2a).

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task060 | Path=POST /api/v1/sales-orders/retail/checkout | Mode=fix-doc
Context SRS: @backend/docs/srs/SRS_Task054-060_sales-orders-pos-and-retail-checkout.md §8.3.2, §12 (posShiftRef, voucher).

Đọc: @frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md → @frontend/docs/api/API_Task060_sales_orders_retail_checkout.md
→ mẫu tại @frontend/docs/api/samples/Task060/ nếu có; grep Path trong @backend/smart-erp/.../SalesOrdersController.java

Output: @frontend/docs/api/bridge/BRIDGE_Task060_sales_orders_retail_checkout.md
```

(Lặp pattern 0.2 với `Task` / `Path` / `API_Task*.md` / `BRIDGE_*` tương ứng cho 054…059 nếu cần.)

---

## Ngữ cảnh SRS (copy vào đầu phiên hoặc nhắc trong từng prompt)

[`backend/docs/srs/SRS_Task054-060_sales-orders-pos-and-retail-checkout.md`](../../../backend/docs/srs/SRS_Task054-060_sales-orders-pos-and-retail-checkout.md) — **§8.1** endpoint; **§2** C1–C7; **§6** JWT + **`can_manage_orders`**; **OQ-8a** list không `orderChannel` → Owner/Admin; Staff luôn gửi `orderChannel` từ màn; **OQ-5** cancel lặp **200**; **OQ-6** cancel **409** khi đã xuất; Task056 chỉ Wholesale/Return; Task060 retail + WALKIN + Vouchers + `posShiftRef`; **§12** đồng bộ API doc `posShiftRef`/voucher khi GAP.

**UI §1.1 SRS (Mini-ERP — nhóm Đơn hàng):** tra [`frontend/mini-erp/src/features/FEATURES_UI_INDEX.md`](../../mini-erp/src/features/FEATURES_UI_INDEX.md) — feature `orders/`:

| Route | Page / vùng chính |
| :--- | :--- |
| `/orders/wholesale` | `WholesalePage` — `OrderTable`, `OrderFormDialog`, `OrderDetailDialog` |
| `/orders/returns` | `ReturnsPage` — `ReturnFormDialog`, `OrderTable` |
| `/orders/retail` | `RetailPage` — `POSProductSelector`, `POSCartPanel` (`handleCheckout` → Task060) |

**Quy ước API_BRIDGE:** đọc [`FE_API_CONNECTION_GUIDE.md`](./FE_API_CONNECTION_GUIDE.md) trước; **`Grep`** path trong `frontend/mini-erp/src`; ưu tiên **`features/orders/api/*.ts`**; output [`frontend/docs/api/bridge/`](../../docs/api/bridge/) `BRIDGE_TaskXXX_<slug>.md`.

| Task | Spec FE | Bridge output (mục tiêu) |
| :--- | :--- | :--- |
| 054 | `API_Task054_sales_orders_get_list.md` | `BRIDGE_Task054_sales_orders_get_list.md` |
| 055 | `API_Task055_sales_orders_get_by_id.md` | `BRIDGE_Task055_sales_orders_get_by_id.md` |
| 056 | `API_Task056_sales_orders_post.md` | `BRIDGE_Task056_sales_orders_post.md` |
| 057 | `API_Task057_sales_orders_patch.md` | `BRIDGE_Task057_sales_orders_patch.md` |
| 058 | `API_Task058_sales_orders_cancel.md` | `BRIDGE_Task058_sales_orders_cancel.md` |
| 059 | `API_Task059_pos_products_get_search.md` | `BRIDGE_Task059_pos_products_get_search.md` |
| 060 | `API_Task060_sales_orders_retail_checkout.md` | `BRIDGE_Task060_sales_orders_retail_checkout.md` |

---

## Task054 — `GET /api/v1/sales-orders`

### Verify

Xem **§0.1a Task054**.

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task054 | Path=GET /api/v1/sales-orders | Mode=wire-fe
Context UI: `/orders/wholesale`, `/orders/returns` — gửi `orderChannel` đúng màn (Wholesale | Return); màn “tất cả kênh” (nếu có) chỉ Owner/Admin — SRS OQ-8a.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task054_sales_orders_get_list.md

Thực hiện:
1. `features/orders/api/*.ts` — hàm list (query: page, limit, orderChannel, search, status, paymentStatus theo spec).
2. Page/component gọi qua handler/query; xử lý 403 (Staff không filter kênh).
3. Grep `/api/v1/sales-orders` trong @frontend/mini-erp/src — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task054_sales_orders_get_list.md
```

---

## Task055 — `GET /api/v1/sales-orders/{id}`

### Verify

Xem **§0.1a Task055**.

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task055 | Path=GET /api/v1/sales-orders/{id} | Mode=wire-fe
Context UI: `OrderDetailDialog` (wholesale/returns/retail tùy index).

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task055_sales_orders_get_by_id.md

Thực hiện:
1. getSalesOrderById trong `features/orders/api`.
2. Hiển thị `lines`, các trường read-model; map `posShiftRef` nếu spec/BE đã có (đối chiếu §12).
3. Grep Path trong @frontend/mini-erp/src — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task055_sales_orders_get_by_id.md
```

---

## Task056 — `POST /api/v1/sales-orders`

### Verify

Xem **§0.1a Task056**.

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task056 | Path=POST /api/v1/sales-orders | Mode=wire-fe
Context UI: `/orders/wholesale` — tạo đơn sỉ; `/orders/returns` — đơn trả (orderChannel Return, refSalesOrderId theo spec).

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task056_sales_orders_post.md

Thực hiện:
1. postSalesOrder trong `features/orders/api`; body camelCase; map 400/409 theo envelope.
2. `OrderFormDialog` / `ReturnFormDialog` gọi API; invalidate list sau thành công.
3. Grep Path trong @frontend/mini-erp/src — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task056_sales_orders_post.md
```

---

## Task057 — `PATCH /api/v1/sales-orders/{id}`

### Verify

Xem **§0.1a Task057**.

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task057 | Path=PATCH /api/v1/sales-orders/{id} | Mode=wire-fe
Context UI: chỉnh meta header đơn (form/dialog wholesale hoặc shared order form theo index).

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task057_sales_orders_patch.md

Thực hiện:
1. patchSalesOrder trong `features/orders/api`.
2. Xử lý 409 khi đơn Cancelled (BR-4).
3. Grep Path trong @frontend/mini-erp/src — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task057_sales_orders_patch.md
```

---

## Task058 — `POST /api/v1/sales-orders/{id}/cancel`

### Verify

Xem **§0.1a Task058**.

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task058 | Path=POST /api/v1/sales-orders/{id}/cancel | Mode=wire-fe
Context UI: nút hủy trên `OrderTable` / chi tiết đơn (toolbar hoặc dialog xác nhận).

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task058_sales_orders_cancel.md

Thực hiện:
1. postCancelSalesOrder trong `features/orders/api` (body `cancelReason` theo spec).
2. 200 idempotent (OQ-5); 409 HAS_DISPATCH / nghiệp vụ tương đương (OQ-6) — toast/message rõ.
3. Grep cancel trong @frontend/mini-erp/src — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task058_sales_orders_cancel.md
```

---

## Task059 — `GET /api/v1/pos/products`

### Verify

Xem **§0.1a Task059**.

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task059 | Path=GET /api/v1/pos/products | Mode=wire-fe
Context UI: `/orders/retail` — `POSProductSelector` (tìm/barcode/query theo spec).

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task059_pos_products_get_search.md

Thực hiện:
1. searchPosProducts (query: q, limit, … theo `API_Task059`) trong `features/orders/api`.
2. Gắn vào selector; hiển thị `availableQty`, `unitPrice`, ảnh nếu có.
3. Grep /api/v1/pos/products trong @frontend/mini-erp/src — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task059_pos_products_get_search.md
```

---

## Task060 — `POST /api/v1/sales-orders/retail/checkout`

### Verify

Xem **§0.1a Task060**.

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task060 | Path=POST /api/v1/sales-orders/retail/checkout | Mode=wire-fe
Context UI: `/orders/retail` — `POSCartPanel` / `handleCheckout` — body: lines, walkIn/customerId, discountAmount, voucherCode, paymentStatus, shiftReference, notes theo `API_Task060`.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task060_sales_orders_retail_checkout.md
Bối cảnh SRS: @backend/docs/srs/SRS_Task054-060_sales-orders-pos-and-retail-checkout.md §7.2, BR-2, BR-5

Thực hiện:
1. postRetailCheckout trong `features/orders/api`.
2. Sau 201: refresh giỏ / chuyển sang chi tiết hoặc toast; map 400 (voucher/validation).
3. Grep retail/checkout trong @frontend/mini-erp/src — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task060_sales_orders_retail_checkout.md
```

---

**Tổng kết file này**

- **Đã làm:** Bộ prompt **7 Path** (verify one-liner, verify đầy đủ 0.1a, wire-fe, fix-doc mẫu), map **API_Task054–060** → **BRIDGE_*** , UI theo SRS §1.1 + `FEATURES_UI_INDEX`.
- **Cách dùng:** sau BE merge — chạy từng block **0.1a** hoặc **wire-fe** theo Path; một phiên = một `BRIDGE_*`.
- **Rủi ro:** §12 GAP — nếu FE cần `posShiftRef`/voucher trước khi doc cập nhật, ưu tiên **DOC_SYNC** rồi chạy lại verify.
