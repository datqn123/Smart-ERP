# Prompt đủ cho 6 Task — Khách hàng (Task048–Task053)

Tham chiếu workflow: [`backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md`](../../../backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md).

**SRS nguồn (chân lý nghiệp vụ + §8 hợp đồng):** [`backend/docs/srs/SRS_Task048-053_customers-management.md`](../../../backend/docs/srs/SRS_Task048-053_customers-management.md) — **§8.1** bảng endpoint; **§8.2–§8.7** request/response/lỗi; **§6** RBAC; **§2** C1–C7; **OQ** §4.1 (`can_manage_customers` **OQ-4(b)**; xóa **chỉ Owner** **OQ-1(a)**; bulk **all-or-nothing** **OQ-2(a)**; 409 `HAS_SALES_ORDERS` \| `HAS_PARTNER_DEBTS` **OQ-3(a)**; bulk **dedupe `ids`**, tối đa **50** id duy nhất **OQ-5(b)**; PATCH **`loyaltyPoints`**: Staff **403**, Owner/Admin được **BR-3**).

Sau **G-DEV** (`mvn verify` xanh) — theo `WORKFLOW_RULE` §0.3: mỗi `Path` **một** phiên `API_BRIDGE` (khuyến nghị `Mode=verify` trước, rồi `wire-fe` khi cần nối `mini-erp`).

---

## 0. Master (dán một lần — outline + SRS)

Dùng khi Owner cần agent đọc SRS trước, rồi tách **6 phiên** theo bảng dưới (không gộp thành một prompt “làm hết” thay cho từng `BRIDGE_*`).

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, mục 2b–2c, 3, 5, 7).

Bối cảnh SRS: @backend/docs/srs/SRS_Task048-053_customers-management.md — §8.1–§8.7, §6 RBAC, §2 capabilities, §0.1 GAP (aggregate loại trừ Cancelled, partnerdebts trên xóa).

Bước 1: Đọc @frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
Bước 2: Với từng dòng bảng §8.1 SRS (048→053), chạy một prompt riêng mục 1 "Verify" tương ứng dưới đây — output `frontend/docs/api/bridge/BRIDGE_TaskXXX_*.md` đúng mục 5 file API_BRIDGE.

Controller BE tham chiếu: @backend/smart-erp/src/main/java/com/example/smart_erp/catalog/controller/CustomersController.java
```

### 0.1 Một dòng mỗi Path (`Mode=verify`)

```text
API_BRIDGE | Task=Task048 | Path=GET /api/v1/customers | Mode=verify
```

```text
API_BRIDGE | Task=Task049 | Path=POST /api/v1/customers | Mode=verify
```

```text
API_BRIDGE | Task=Task050 | Path=GET /api/v1/customers/{id} | Mode=verify
```

```text
API_BRIDGE | Task=Task051 | Path=PATCH /api/v1/customers/{id} | Mode=verify
```

```text
API_BRIDGE | Task=Task052 | Path=DELETE /api/v1/customers/{id} | Mode=verify
```

```text
API_BRIDGE | Task=Task053 | Path=POST /api/v1/customers/bulk-delete | Mode=verify
```

**Cách dùng:** dòng **0.1** = lệnh tối thiểu; dán thêm **master §0** nếu agent cần SRS/Controller. Hoặc dùng **0.1a** — một block cho mỗi phiên.

### 0.1a Verify — gộp sẵn (dán từng block = một phiên `API_BRIDGE`)

#### Task048

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, mục 2b–2c, 3, 5, 7).

Bối cảnh SRS: @backend/docs/srs/SRS_Task048-053_customers-management.md — §8.1 dòng 048, §8.2 (sort whitelist, orderCount, totalSpent, loyaltyPoints).
Controller BE: @backend/smart-erp/src/main/java/com/example/smart_erp/catalog/controller/CustomersController.java

API_BRIDGE | Task=Task048 | Path=GET /api/v1/customers | Mode=verify
Context SRS: Task048–051 cần JWT **`can_manage_customers`** (OQ-4(b)); list aggregate loại trừ đơn `Cancelled` (§0.1, BR-1).

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task048_customers_get_list.md
Grep "/api/v1/customers" trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep /api/v1/customers trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task048_customers_get_list.md
```

#### Task049

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, mục 2b–2c, 3, 5, 7).

Bối cảnh SRS: @backend/docs/srs/SRS_Task048-053_customers-management.md — §8.1 dòng 049, §8.3; 201 + loyaltyPoints server = 0; 409 trùng customerCode.
Controller BE: @backend/smart-erp/src/main/java/com/example/smart_erp/catalog/controller/CustomersController.java

API_BRIDGE | Task=Task049 | Path=POST /api/v1/customers | Mode=verify
Context SRS: can_manage_customers; validation body theo §8.3.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task049_customers_post.md
Grep POST customers trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep /api/v1/customers trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task049_customers_post.md
```

#### Task050

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, mục 2b–2c, 3, 5, 7).

Bối cảnh SRS: @backend/docs/srs/SRS_Task048-053_customers-management.md — §8.1 dòng 050, §8.4 — totalSpent, orderCount đồng bộ list (loại trừ Cancelled).
Controller BE: @backend/smart-erp/src/main/java/com/example/smart_erp/catalog/controller/CustomersController.java

API_BRIDGE | Task=Task050 | Path=GET /api/v1/customers/{id} | Mode=verify

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task050_customers_get_by_id.md
Grep customers trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep getCustomer hoặc customers/ trong @frontend/mini-erp/src/features/product-management

Output: @frontend/docs/api/bridge/BRIDGE_Task050_customers_get_by_id.md
```

#### Task051

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, mục 2b–2c, 3, 5, 7).

Bối cảnh SRS: @backend/docs/srs/SRS_Task048-053_customers-management.md — §8.1 dòng 051, §8.5, §6 — `loyaltyPoints` trong body: **403** nếu `role=Staff` (BR-3, OQ-4); 409 trùng customerCode.
Controller BE: @backend/smart-erp/src/main/java/com/example/smart_erp/catalog/controller/CustomersController.java

API_BRIDGE | Task=Task051 | Path=PATCH /api/v1/customers/{id} | Mode=verify
Context SRS: can_manage_customers; partial ≥1 field.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task051_customers_patch.md
Grep PATCH customers trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep patchCustomer trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task051_customers_patch.md
```

#### Task052

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, mục 2b–2c, 3, 5, 7).

Bối cảnh SRS: @backend/docs/srs/SRS_Task048-053_customers-management.md — §8.1 dòng 052, §6 — **chỉ Owner** (OQ-1(a)); §8.6 — 409 `HAS_SALES_ORDERS` | `HAS_PARTNER_DEBTS` (OQ-3(a), BR-2); 403 nếu không phải Owner dù có can_manage_customers.
Controller BE: @backend/smart-erp/src/main/java/com/example/smart_erp/catalog/controller/CustomersController.java

API_BRIDGE | Task=Task052 | Path=DELETE /api/v1/customers/{id} | Mode=verify
Context SRS: xóa một; kiểm cả `salesorders` và `partnerdebts`.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task052_customers_delete.md
Grep DELETE customers trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep deleteCustomer trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task052_customers_delete.md
```

#### Task053

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, mục 2b–2c, 3, 5, 7).

Bối cảnh SRS: @backend/docs/srs/SRS_Task048-053_customers-management.md — §8.1 dòng 053, §8.7 — all-or-nothing (OQ-2(a)); **dedupe** `ids`, sau dedupe **1–50** id duy nhất (OQ-5(b)); >50 unique → **400**; **chỉ Owner**.
Controller BE: @backend/smart-erp/src/main/java/com/example/smart_erp/catalog/controller/CustomersController.java

API_BRIDGE | Task=Task053 | Path=POST /api/v1/customers/bulk-delete | Mode=verify
Context SRS: bulk; cùng điều kiện 409 như xóa một (BR-2).

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task053_customers_bulk_delete.md
Grep bulk-delete customers trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep bulk-delete|bulkDelete trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task053_customers_bulk_delete.md
```

### 0.2 `Mode=fix-doc` (cập nhật contract / samples, không bắt buộc wire code)

Dùng khi drift doc ↔ `CustomersController` / cần bổ sung `samples/Task048`…`Task053`.

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task048 | Path=GET /api/v1/customers | Mode=fix-doc
Context SRS: @backend/docs/srs/SRS_Task048-053_customers-management.md §8.2 (sort, aggregate).

Đọc: @frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md → @frontend/docs/api/API_Task048_customers_get_list.md
→ tạo/cập nhật mẫu tại @frontend/docs/api/samples/Task048/ nếu có; grep Path trong @backend/smart-erp/.../CustomersController.java

Output: @frontend/docs/api/bridge/BRIDGE_Task048_customers_get_list.md
```

(Lặp lại pattern 0.2 với `Task` / `Path` / `API_Task*.md` / `BRIDGE_*` tương ứng cho 049…053 nếu cần.)

---

## Ngữ cảnh SRS (copy vào đầu phiên hoặc nhắc trong từng prompt)

[`backend/docs/srs/SRS_Task048-053_customers-management.md`](../../../backend/docs/srs/SRS_Task048-053_customers-management.md) — §8.1 endpoint; §2 C1–C7 (`orderCount` / `totalSpent` **không** tính đơn `Cancelled`); §6: **`can_manage_customers`** cho Task048–051 (**OQ-4(b)**); **Task052–053: chỉ Owner** (OQ-1(a)); **`loyaltyPoints`** PATCH: Staff **403** (BR-3); xóa: chặn **`salesorders`** và **`partnerdebts`** — **409** `HAS_SALES_ORDERS` \| `HAS_PARTNER_DEBTS` (OQ-3(a)); bulk **all-or-nothing**; **`ids` trùng → dedupe** (OQ-5(b)), sau dedupe max **50** id — **>50 → 400**; mảng rỗng → **400**.

**UI §1.1:** `/products/customers` → [`CustomersPage`](../../mini-erp/src/features/product-management/pages/CustomersPage.tsx) (`CustomerTable`, `CustomerToolbar`, `CustomerForm`, `CustomerDetailDialog`). Tra [`frontend/mini-erp/src/features/FEATURES_UI_INDEX.md`](../../mini-erp/src/features/FEATURES_UI_INDEX.md) (feature `product-management/` — Khách).

**Quy ước API_BRIDGE:** đọc [`FE_API_CONNECTION_GUIDE.md`](./FE_API_CONNECTION_GUIDE.md) trước; **`Grep`** `/api/v1/customers` trong `frontend/mini-erp/src`; ưu tiên **`features/product-management/api/*customers*.ts`** (hoặc tên team đã đặt); output [`frontend/docs/api/bridge/`](../../docs/api/bridge/) `BRIDGE_TaskXXX_<slug>.md`.

| Task | Spec FE | Bridge output (mục tiêu) |
| :--- | :--- | :--- |
| 048 | `API_Task048_customers_get_list.md` | `BRIDGE_Task048_customers_get_list.md` |
| 049 | `API_Task049_customers_post.md` | `BRIDGE_Task049_customers_post.md` |
| 050 | `API_Task050_customers_get_by_id.md` | `BRIDGE_Task050_customers_get_by_id.md` |
| 051 | `API_Task051_customers_patch.md` | `BRIDGE_Task051_customers_patch.md` |
| 052 | `API_Task052_customers_delete.md` | `BRIDGE_Task052_customers_delete.md` |
| 053 | `API_Task053_customers_bulk_delete.md` | `BRIDGE_Task053_customers_bulk_delete.md` |

---

## Task048 — `GET /api/v1/customers`

### Verify

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task048 | Path=GET /api/v1/customers | Mode=verify
Context SRS: @backend/docs/srs/SRS_Task048-053_customers-management.md §8.2 (sort whitelist, can_manage_customers, aggregate non-Cancelled).

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task048_customers_get_list.md
Grep "/api/v1/customers" trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep /api/v1/customers trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task048_customers_get_list.md
```

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task048 | Path=GET /api/v1/customers | Mode=wire-fe
Context UI: `/products/customers` — CustomersPage — CustomerTable + CustomerToolbar; guard menu/route theo `can_manage_customers` nếu SRS đã bật.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task048_customers_get_list.md

Thực hiện:
1. features/product-management/api — getCustomerList (query đúng spec: search, status, page, limit, sort whitelist).
2. useQuery + phân trang; hiển thị orderCount, totalSpent, loyaltyPoints.
3. Grep Path trong @frontend/mini-erp/src — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task048_customers_get_list.md
```

---

## Task049 — `POST /api/v1/customers`

### Verify

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task049 | Path=POST /api/v1/customers | Mode=verify
Context SRS: §8.3, can_manage_customers; 201; 409 trùng mã; loyaltyPoints từ server 0.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task049_customers_post.md
Grep POST customers trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep /api/v1/customers trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task049_customers_post.md
```

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task049 | Path=POST /api/v1/customers | Mode=wire-fe
Context UI: CustomerForm / dialog tạo KH.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task049_customers_post.md

Thực hiện:
1. postCustomer trong product-management api; map 400/409 → thông báo/field theo envelope.
2. useMutation → invalidate list.
3. Grep Path trong @frontend/mini-erp/src — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task049_customers_post.md
```

---

## Task050 — `GET /api/v1/customers/{id}`

### Verify

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task050 | Path=GET /api/v1/customers/{id} | Mode=verify
Context SRS: §8.4; read-model đồng bộ Task048 (orderCount, totalSpent, loyaltyPoints).

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task050_customers_get_by_id.md
Grep customers trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep getCustomer hoặc customers/ trong @frontend/mini-erp/src/features/product-management

Output: @frontend/docs/api/bridge/BRIDGE_Task050_customers_get_by_id.md
```

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task050 | Path=GET /api/v1/customers/{id} | Mode=wire-fe
Context UI: CustomerDetailDialog.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task050_customers_get_by_id.md

Thực hiện:
1. getCustomerById trong product-management api.
2. useQuery khi mở chi tiết; đồng bộ số liệu read-model.
3. Grep Path trong @frontend/mini-erp/src — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task050_customers_get_by_id.md
```

---

## Task051 — `PATCH /api/v1/customers/{id}`

### Verify

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task051 | Path=PATCH /api/v1/customers/{id} | Mode=verify
Context SRS: §8.5; can_manage_customers; **loyaltyPoints** + Staff → **403**; 409 trùng mã KH.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task051_customers_patch.md
Grep PATCH customers trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep patchCustomer trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task051_customers_patch.md
```

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task051 | Path=PATCH /api/v1/customers/{id} | Mode=wire-fe
Context UI: CustomerForm chỉnh sửa; **ẩn hoặc vô hiệu hóa** field loyaltyPoints khi `role=Staff` (tránh 403) — theo BR-3.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task051_customers_patch.md

Thực hiện:
1. patchCustomer trong product-management api.
2. useMutation; invalidate list + detail.
3. Grep Path trong @frontend/mini-erp/src — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task051_customers_patch.md
```

---

## Task052 — `DELETE /api/v1/customers/{id}`

### Verify

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task052 | Path=DELETE /api/v1/customers/{id} | Mode=verify
Context SRS: §6 — **chỉ Owner**; §8.6 — 409 theo `details.reason`; 403 nếu Staff/Admin có can_manage_customers.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task052_customers_delete.md
Grep DELETE customers trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep deleteCustomer trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task052_customers_delete.md
```

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task052 | Path=DELETE /api/v1/customers/{id} | Mode=wire-fe
Context UI: CustomerTable / detail — nút xóa **chỉ** cho Owner; map 409 theo `HAS_SALES_ORDERS` / `HAS_PARTNER_DEBTS`.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task052_customers_delete.md

Thực hiện:
1. deleteCustomer trong product-management api.
2. useMutation; toast/confirm; invalidate list.
3. Grep Path trong @frontend/mini-erp/src.

Output: @frontend/docs/api/bridge/BRIDGE_Task052_customers_delete.md
```

---

## Task053 — `POST /api/v1/customers/bulk-delete`

### Verify

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task053 | Path=POST /api/v1/customers/bulk-delete | Mode=verify
Context SRS: §8.7; **chỉ Owner**; all-or-nothing; **dedupe** ids; max **50** id duy nhất sau dedupe; 400 nếu >50 hoặc mảng rỗng.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task053_customers_bulk_delete.md
Grep bulk-delete|bulkDelete trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep bulkDelete|bulk trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task053_customers_bulk_delete.md
```

### Wire-fe

```text


```

---

## Một dòng (verify nhanh — copy từng dòng)

```text
API_BRIDGE | Task=Task048 | Path=GET /api/v1/customers | Mode=verify
```

```text
API_BRIDGE | Task=Task049 | Path=POST /api/v1/customers | Mode=verify
```

```text
API_BRIDGE | Task=Task050 | Path=GET /api/v1/customers/{id} | Mode=verify
```

```text
API_BRIDGE | Task=Task051 | Path=PATCH /api/v1/customers/{id} | Mode=verify
```

```text
API_BRIDGE | Task=Task052 | Path=DELETE /api/v1/customers/{id} | Mode=verify
```

```text
API_BRIDGE | Task=Task053 | Path=POST /api/v1/customers/bulk-delete | Mode=verify
```
