# Prompt — Task092 (UC9) — Voucher POS: list, detail, preview + checkout lượt dùng (API_BRIDGE)

Tham chiếu workflow: [`backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md`](../../../backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md).

**SRS nguồn:** [`backend/docs/srs/SRS_Task092_uc9-retail-voucher-preview.md`](../../../backend/docs/srs/SRS_Task092_uc9-retail-voucher-preview.md) — **Approved**; §4 (OQ đã chốt); §8 HTTP; **OQ-10** `used_count` / `max_uses` / `voucher_redemptions`; preview **OQ-11/12**.

**API markdown (một file — nhiều Path):**

- [`frontend/docs/api/API_Task092_vouchers_and_retail_preview.md`](../../docs/api/API_Task092_vouchers_and_retail_preview.md)

**BE tham chiếu (grep / Read tối thiểu):**

- `backend/smart-erp/src/main/java/com/example/smart_erp/sales/controller/VouchersController.java`
- `backend/smart-erp/src/main/java/com/example/smart_erp/sales/controller/SalesOrdersController.java` — `POST …/retail/voucher-preview`
- `backend/smart-erp/src/main/java/com/example/smart_erp/sales/service/VoucherService.java`
- `backend/smart-erp/src/main/java/com/example/smart_erp/sales/service/SalesOrderService.java` — `retailVoucherPreview`, `retailCheckout` (lock voucher + increment + redemption), `cancel` (reverse redemption)
- `backend/smart-erp/src/main/java/com/example/smart_erp/sales/repository/VoucherJdbcRepository.java`
- Flyway: `backend/smart-erp/src/main/resources/db/migration/V24__task092_voucher_usage_and_redemptions.sql`

**Checkout đã có Path Task060** — sau Task092 cần **re-verify** nếu FE/bridge cũ chỉ mô tả voucher mà chưa nêu **409 hết lượt** / không invalidate gì thêm: [`frontend/docs/api/API_Task060_sales_orders_retail_checkout.md`](../../docs/api/API_Task060_sales_orders_retail_checkout.md).

---

## 0. Master (outline + SRS — Owner dán một lần rồi tách phiên theo Path)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, mục 2b–2c, 3, 5, 7).

Bối cảnh SRS: @backend/docs/srs/SRS_Task092_uc9-retail-voucher-preview.md — §1.1 UI `/orders/retail`, `POSCartPanel`; §8 GET /vouchers, GET /vouchers/{id}, POST /sales-orders/retail/voucher-preview; OQ-2 (page/limit 5); OQ-10 checkout + log.

Bước 1: Đọc @frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
Bước 2: Chạy **ba** phiên `Mode=verify` — một Path mỗi phiên (mục 0.1a). Tuỳ sprint: thêm phiên verify Task060 nếu cần cập nhật mô tả lỗi 409 voucher.
Output: tạo/cập nhật `frontend/docs/api/bridge/BRIDGE_Task092_vouchers_get_list.md`, `BRIDGE_Task092_vouchers_get_by_id.md`, `BRIDGE_Task092_sales_orders_retail_voucher_preview.md` (hoặc một file `BRIDGE_Task092_*.md` gộp **ba dòng bảng** theo mục 5 API_BRIDGE — **một Path = một dòng**).
```

---

## 0.1 Một dòng mỗi Path (`Mode=verify`)

```text
API_BRIDGE | Task=Task092 | Path=GET /api/v1/vouchers | Mode=verify
```

```text
API_BRIDGE | Task=Task092 | Path=GET /api/v1/vouchers/{id} | Mode=verify
```

```text
API_BRIDGE | Task=Task092 | Path=POST /api/v1/sales-orders/retail/voucher-preview | Mode=verify
```

**Tuỳ chọn (checkout + lượt voucher):**

```text
API_BRIDGE | Task=Task060 | Path=POST /api/v1/sales-orders/retail/checkout | Mode=verify
```

*(Ghi trong prompt SRS Task092: sau V24, checkout có thể trả **409** khi hết lượt voucher — đối chiếu `SalesOrderService.retailCheckout` + `ApiErrorCode.CONFLICT`.)*

---

## 0.1a Verify — gộp sẵn (mỗi khối = **một phiên** = một Path)

### Task092 — `GET /api/v1/vouchers`

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task092 | Path=GET /api/v1/vouchers | Mode=verify
Context SRS: @backend/docs/srs/SRS_Task092_uc9-retail-voucher-preview.md — §8.1; OQ-1 (chỉ trong hạn); OQ-2 (page, limit mặc định 5, max 50); OQ-4 (can_manage_orders).

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task092_vouchers_and_retail_preview.md (mục 1)
Grep "/api/v1/vouchers" trong @backend/smart-erp/src/main/java/com/example/smart_erp/sales
Grep /api/v1/vouchers trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task092_vouchers_get_list.md
```

### Task092 — `GET /api/v1/vouchers/{id}`

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task092 | Path=GET /api/v1/vouchers/{id} | Mode=verify
Context SRS: @backend/docs/srs/SRS_Task092_uc9-retail-voucher-preview.md — §8.2; 404 khi không tồn tại.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task092_vouchers_and_retail_preview.md (mục 2)
Grep "GetMapping" và "vouchers" trong @backend/smart-erp/src/main/java/com/example/smart_erp/sales/controller/VouchersController.java
Grep /api/v1/vouchers/ trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task092_vouchers_get_by_id.md
```

### Task092 — `POST /api/v1/sales-orders/retail/voucher-preview`

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task092 | Path=POST /api/v1/sales-orders/retail/voucher-preview | Mode=verify
Context SRS: @backend/docs/srs/SRS_Task092_uc9-retail-voucher-preview.md — §8.3; OQ-9A (namespace retail); OQ-11/§4.2 (200 + applicable); OQ-12 (400 preview).

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task092_vouchers_and_retail_preview.md (mục 3)
Grep "retail/voucher-preview" trong @backend/smart-erp/src/main/java/com/example/smart_erp/sales
Grep voucher-preview trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task092_sales_orders_retail_voucher_preview.md
```

---

## 0.2 `Mode=wire-fe` (nối `POSCartPanel` / trang bán lẻ)

**Mục 7 — một phiên = một Path:** mỗi khối prompt dưới đây = **một** phiên agent; mỗi phiên cập nhật **đúng một** file `BRIDGE_Task092_*.md` được nêu trong `Output` (cột Frontend + Khớp).  
**Thứ tự khuyến nghị:** verify (§0.1a) xong → wire-fe **0.2a → 0.2b → 0.2c** (đúng luồng SRS §7: list → detail → preview).  
**Task060 checkout:** URL `POST /api/v1/sales-orders/retail/checkout` không đổi; Task092/V24 bổ sung **trừ lượt + log** và **409** khi hết lượt voucher. Xử lý **409** trên UI thường cùng `POSCartPanel` — có thể gộp vào phiên **0.2c** (cùng file) hoặc tách phiên `API_BRIDGE | Task=Task060 | Path=POST …/retail/checkout | Mode=wire-fe` nếu Owner muốn tách sổ.

### 0.2a — `GET /api/v1/vouchers` (picker + phân trang)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task092 | Path=GET /api/v1/vouchers | Mode=wire-fe
Context UI: `/orders/retail` — picker voucher trong `POSCartPanel`.

Đọc: @frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md → @frontend/mini-erp/src/features/FEATURES_UI_INDEX.md → @frontend/docs/api/API_Task092_vouchers_and_retail_preview.md (mục 1).

Thực hiện: `features/orders/api/` (`getVouchersList` qua `apiJson`) + móc UI (ví dụ `useInfiniteQuery`, **Xem thêm**, `limit=5` / OQ-2); không `fetch` trực tiếp trong component.

Output: @frontend/docs/api/bridge/BRIDGE_Task092_vouchers_get_list.md
```

### 0.2b — `GET /api/v1/vouchers/{id}`

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task092 | Path=GET /api/v1/vouchers/{id} | Mode=wire-fe
Context UI: `/orders/retail` — xác thực voucher khi chọn theo `id` (ví dụ trước khi gắn mã vào giỏ).

Đọc: @frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md → @frontend/mini-erp/src/features/FEATURES_UI_INDEX.md → @frontend/docs/api/API_Task092_vouchers_and_retail_preview.md (mục 2).

Thực hiện: `features/orders/api/` (`getVoucherById`) + móc UI; xử lý **404**/envelope theo `FE_API_CONNECTION_GUIDE.md`.

Output: @frontend/docs/api/bridge/BRIDGE_Task092_vouchers_get_by_id.md
```

### 0.2c — `POST /api/v1/sales-orders/retail/voucher-preview`

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task092 | Path=POST /api/v1/sales-orders/retail/voucher-preview | Mode=wire-fe
Context UI: `/orders/retail` — `POSCartPanel` (SRS §1.1).

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task092_vouchers_and_retail_preview.md (mục 3)
@backend/docs/srs/SRS_Task092_uc9-retail-voucher-preview.md — §7 (preview trước checkout).

Thực hiện:
1. `features/orders/api/` — `postRetailVoucherPreview` qua `apiJson`.
2. `POSCartPanel.tsx` (hoặc component con) — gọi preview khi đổi voucher/giỏ; map `applicable`, `payableAmount`, `message`; xử lý **400** theo envelope.
3. (Tuỳ chọn cùng phiên nếu chỉnh chung panel) Checkout Task060 — map **409** hết lượt voucher; không đổi URL checkout.

Output: @frontend/docs/api/bridge/BRIDGE_Task092_sales_orders_retail_voucher_preview.md
```

### 0.2z — Wire-fe gộp (chỉ khi Owner chấp nhận một phiên bundle)

Một phiên gọi cả ba Path + cập nhật ba bridge — **lệch mục 7** (nhiều Path/phiên). Chỉ dùng khi Owner ghi rõ chấp nhận bundle.

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task092 | Path=POST /api/v1/sales-orders/retail/voucher-preview | Mode=wire-fe
(BUNDLE — Owner opt-in) Cùng phiên: GET list, GET {id}, POST preview + nút Xem thêm + preview + 409 checkout trong `POSCartPanel`.

Đọc: @frontend/docs/api/API_Task092_vouchers_and_retail_preview.md — toàn bộ; SRS Task092 §7.

Output: cập nhật đủ ba file `BRIDGE_Task092_vouchers_get_list.md`, `BRIDGE_Task092_vouchers_get_by_id.md`, `BRIDGE_Task092_sales_orders_retail_voucher_preview.md` + cột Frontend khớp `api/*.ts` và component.
```

---

## Ngữ cảnh SRS (nhắc trong mỗi phiên)

- **Ba Path mới** Task092; checkout **Task060** giữ nguyên URL nhưng bổ sung hành vi **trừ lượt + log** (V24) và **409** khi hết lượt.  
- **Một phiên = một Path** (mục 7 `API_BRIDGE_AGENT_INSTRUCTIONS.md`); **verify** (§0.1a) xong mới **wire-fe** (§0.2a–c) nếu Owner yêu cầu — **không** dùng khối **0.2z** trừ khi Owner chấp nhận bundle.
