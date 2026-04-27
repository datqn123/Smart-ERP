# Prompt đủ cho 6 Task — Nhà cung cấp (Task042–047)

Tham chiếu workflow: [`backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md`](../../../backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md) · PM handoff: [`backend/docs/task042-047/01-pm/README.md`](../../../backend/docs/task042-047/01-pm/README.md).

**SRS nguồn (chân lý nghiệp vụ + §8 hợp đồng):** [`backend/docs/srs/SRS_Task042-047_suppliers-management.md`](../../../backend/docs/srs/SRS_Task042-047_suppliers-management.md) — **§8.1** bảng endpoint; **§8.2–§8.7** request/response/lỗi; **§6** RBAC; **§2** C1–C7; **OQ** §4.1 (Owner xóa, bulk all-or-nothing, `lastReceiptAt`, v.v.).

Sau **G-DEV** (`mvn verify` xanh) — theo `WORKFLOW_RULE` §0.3: mỗi `Path` **một** phiên `API_BRIDGE` (khuyến nghị `Mode=verify` trước, rồi `wire-fe` khi cần nối `mini-erp`).

---

## 0. Master (dán một lần — outline + SRS)

Dùng khi Owner cần agent đọc SRS trước, rồi tách **6 phiên** theo bảng dưới (không gộp thành một prompt “làm hết” thay cho từng `BRIDGE_*`).

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, mục 2b–2c, 3, 5, 7).

Bối cảnh SRS: @backend/docs/srs/SRS_Task042-047_suppliers-management.md — §8.1–§8.7, §6 RBAC, §2 capabilities.

Bước 1: Đọc @frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
Bước 2: Với từng dòng bảng §8.1 SRS (042→047), chạy một prompt riêng mục 1 "Verify" tương ứng dưới đây — output `frontend/docs/api/bridge/BRIDGE_TaskXXX_*.md` đúng mục 5 file API_BRIDGE.

Controller BE tham chiếu: @backend/smart-erp/src/main/java/com/example/smart_erp/catalog/controller/SuppliersController.java
```

### 0.1 Một dòng mỗi Path (`Mode=verify`)

```text
API_BRIDGE | Task=Task042 | Path=GET /api/v1/suppliers | Mode=verify
```

```text
API_BRIDGE | Task=Task043 | Path=POST /api/v1/suppliers | Mode=verify
```

```text
API_BRIDGE | Task=Task044 | Path=GET /api/v1/suppliers/{id} | Mode=verify
```

```text
API_BRIDGE | Task=Task045 | Path=PATCH /api/v1/suppliers/{id} | Mode=verify
```

```text
API_BRIDGE | Task=Task046 | Path=DELETE /api/v1/suppliers/{id} | Mode=verify
```

```text
API_BRIDGE | Task=Task047 | Path=POST /api/v1/suppliers/bulk-delete | Mode=verify
```

**Cách dùng:** dòng **0.1** = lệnh tối thiểu; dán thêm **master §0** (16–24) nếu agent cần SRS/Controller. Hoặc dùng **0.1a** — một block cho mỗi phiên, không cần ghép tay.

### 0.1a Verify — gộp sẵn (dán từng block = một phiên `API_BRIDGE`)

#### Task042

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, mục 2b–2c, 3, 5, 7).

Bối cảnh SRS: @backend/docs/srs/SRS_Task042-047_suppliers-management.md — §8.1 dòng 042, §8.2 chi tiết.
Controller BE: @backend/smart-erp/src/main/java/com/example/smart_erp/catalog/controller/SuppliersController.java

API_BRIDGE | Task=Task042 | Path=GET /api/v1/suppliers | Mode=verify
Context SRS: @backend/docs/srs/SRS_Task042-047_suppliers-management.md §8.2 (sort whitelist, receiptCount).

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task042_suppliers_get_list.md
Grep GET "/api/v1/suppliers" trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep /api/v1/suppliers trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task042_suppliers_get_list.md
```

#### Task043

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, mục 2b–2c, 3, 5, 7).

Bối cảnh SRS: @backend/docs/srs/SRS_Task042-047_suppliers-management.md — §8.1 dòng 043, §8.3 chi tiết.
Controller BE: @backend/smart-erp/src/main/java/com/example/smart_erp/catalog/controller/SuppliersController.java

API_BRIDGE | Task=Task043 | Path=POST /api/v1/suppliers | Mode=verify
Context SRS: §8.3, OQ-5(a) contactPerson bắt buộc; 409 supplierCode.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task043_suppliers_post.md
Grep POST suppliers trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep /api/v1/suppliers trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task043_suppliers_post.md
```

#### Task044

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, mục 2b–2c, 3, 5, 7).

Bối cảnh SRS: @backend/docs/srs/SRS_Task042-047_suppliers-management.md — §8.1 dòng 044, §8.4 chi tiết.
Controller BE: @backend/smart-erp/src/main/java/com/example/smart_erp/catalog/controller/SuppliersController.java

API_BRIDGE | Task=Task044 | Path=GET /api/v1/suppliers/{id} | Mode=verify
Context SRS: §8.4 — receiptCount + lastReceiptAt (OQ-4(b)).

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task044_suppliers_get_by_id.md
Grep suppliers trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep getSupplier hoặc suppliers/ trong @frontend/mini-erp/src/features/product-management

Output: @frontend/docs/api/bridge/BRIDGE_Task044_suppliers_get_by_id.md
```

#### Task045

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, mục 2b–2c, 3, 5, 7).

Bối cảnh SRS: @backend/docs/srs/SRS_Task042-047_suppliers-management.md — §8.1 dòng 045, §8.5 chi tiết.
Controller BE: @backend/smart-erp/src/main/java/com/example/smart_erp/catalog/controller/SuppliersController.java

API_BRIDGE | Task=Task045 | Path=PATCH /api/v1/suppliers/{id} | Mode=verify
Context SRS: §8.5 — ít nhất một field; 409 trùng supplierCode.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task045_suppliers_patch.md
Grep PATCH suppliers trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep patchSupplier trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task045_suppliers_patch.md
```

#### Task046

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, mục 2b–2c, 3, 5, 7).

Bối cảnh SRS: @backend/docs/srs/SRS_Task042-047_suppliers-management.md — §8.1 dòng 046, §6 Owner, §8.6, §7–9 delete.
Controller BE: @backend/smart-erp/src/main/java/com/example/smart_erp/catalog/controller/SuppliersController.java

API_BRIDGE | Task=Task046 | Path=DELETE /api/v1/suppliers/{id} | Mode=verify
Context SRS: §6 — chỉ Owner; §8.6 — 409 HAS_RECEIPTS / HAS_PARTNER_DEBTS.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task046_suppliers_delete.md
Grep DELETE suppliers trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep deleteSupplier trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task046_suppliers_delete.md
```

#### Task047

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, mục 2b–2c, 3, 5, 7).

Bối cảnh SRS: @backend/docs/srs/SRS_Task042-047_suppliers-management.md — §8.1 dòng 047, §8.7 chi tiết.
Controller BE: @backend/smart-erp/src/main/java/com/example/smart_erp/catalog/controller/SuppliersController.java

API_BRIDGE | Task=Task047 | Path=POST /api/v1/suppliers/bulk-delete | Mode=verify
Context SRS: §8.7 — all-or-nothing; duplicate ids → 400; chỉ Owner.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task047_suppliers_bulk_delete.md
Grep bulk-delete suppliers trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep bulk-delete trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task047_suppliers_bulk_delete.md
```

### 0.2 `Mode=fix-doc` (cập nhật contract / samples, không bắt buộc wire code)

Dùng khi drift doc ↔ `SuppliersController` / cần bổ sung `samples/Task042`…`Task047`.

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task043 | Path=POST /api/v1/suppliers | Mode=fix-doc
Context SRS: @backend/docs/srs/SRS_Task042-047_suppliers-management.md §8.3, OQ-5(a) contactPerson.

Đọc: @frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md → @frontend/docs/api/API_Task043_suppliers_post.md
→ tạo/cập nhật mẫu tại @frontend/docs/api/samples/Task043/ nếu có; grep Path trong @backend/smart-erp/.../SuppliersController.java

Output: @frontend/docs/api/bridge/BRIDGE_Task043_suppliers_post.md
```

(Lặp lại pattern 0.2 với `Task`/`Path`/`API_Task*.md`/`BRIDGE_*` tương ứng cho 042, 044, 045, 046, 047 nếu cần sửa doc theo ticket.)

---

## Ngữ cảnh SRS (copy vào đầu phiên hoặc nhắc trong từng prompt)

[`backend/docs/srs/SRS_Task042-047_suppliers-management.md`](../../../backend/docs/srs/SRS_Task042-047_suppliers-management.md) — §8.1 endpoint; §2 C1–C7 (`receiptCount`, **`lastReceiptAt`** Task044, POST/PATCH **`contactPerson` bắt buộc** OQ-5(a)); §6 RBAC: **`can_manage_products`** cho Task042–045; **`DELETE` + `bulk-delete`: chỉ Owner** (OQ-1(a)); §7.2–§9 **DELETE**: chặn **`stockreceipts`** và **`partnerdebts`** — **409** `HAS_RECEIPTS` \| `HAS_PARTNER_DEBTS` (OQ-3(a)); bulk **all-or-nothing** (OQ-2(a)); **`ids` trùng → 400** (OQ-6(a)); bulk max **50** id (SRS §8.1).

**UI §1.1:** `/products/suppliers` → [`SuppliersPage`](../../mini-erp/src/features/product-management/pages/SuppliersPage.tsx) (`SupplierTable`, `SupplierToolbar`, `SupplierForm`, `SupplierDetailDialog`). Tra [`frontend/mini-erp/src/features/FEATURES_UI_INDEX.md`](../../mini-erp/src/features/FEATURES_UI_INDEX.md).

**Quy ước API_BRIDGE:** đọc [`FE_API_CONNECTION_GUIDE.md`](./FE_API_CONNECTION_GUIDE.md) trước; **`Grep`** `/api/v1/suppliers` trong `frontend/mini-erp/src`; output [`frontend/docs/api/bridge/`](../../docs/api/bridge/) `BRIDGE_TaskXXX_<slug>.md`.

| Task | Spec FE | Bridge output |
| :--- | :--- | :--- |
| 042 | `API_Task042_suppliers_get_list.md` | `BRIDGE_Task042_suppliers_get_list.md` |
| 043 | `API_Task043_suppliers_post.md` | `BRIDGE_Task043_suppliers_post.md` |
| 044 | `API_Task044_suppliers_get_by_id.md` | `BRIDGE_Task044_suppliers_get_by_id.md` |
| 045 | `API_Task045_suppliers_patch.md` | `BRIDGE_Task045_suppliers_patch.md` |
| 046 | `API_Task046_suppliers_delete.md` | `BRIDGE_Task046_suppliers_delete.md` |
| 047 | `API_Task047_suppliers_bulk_delete.md` | `BRIDGE_Task047_suppliers_bulk_delete.md` |

---

## Task042 — `GET /api/v1/suppliers`

### Verify

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task042 | Path=GET /api/v1/suppliers | Mode=verify
Context SRS: @backend/docs/srs/SRS_Task042-047_suppliers-management.md §8.2 (sort whitelist, receiptCount).

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task042_suppliers_get_list.md
Grep GET "/api/v1/suppliers" trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep /api/v1/suppliers trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task042_suppliers_get_list.md
```

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task042 | Path=GET /api/v1/suppliers | Mode=wire-fe
Context UI: `/products/suppliers` — SuppliersPage — SupplierTable + SupplierToolbar.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task042_suppliers_get_list.md

Thực hiện:
1. features/product-management/api/*.ts — getSupplierList (query đúng spec).
2. useQuery + phân trang / filter / sort whitelist.
3. Grep Path trong @frontend/mini-erp/src — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task042_suppliers_get_list.md
```

---

## Task043 — `POST /api/v1/suppliers`

### Verify

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task043 | Path=POST /api/v1/suppliers | Mode=verify
Context SRS: §8.3, OQ-5(a) contactPerson bắt buộc; 409 supplierCode.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task043_suppliers_post.md
Grep POST suppliers trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep /api/v1/suppliers trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task043_suppliers_post.md
```

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task043 | Path=POST /api/v1/suppliers | Mode=wire-fe
Context UI: SupplierForm / dialog tạo NCC.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task043_suppliers_post.md

Thực hiện:
1. postSupplier trong api/*.ts; map 400 details → field (contactPerson, …).
2. useMutation → invalidate list.
3. Grep Path trong @frontend/mini-erp/src — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task043_suppliers_post.md
```

---

## Task044 — `GET /api/v1/suppliers/{id}`

### Verify

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task044 | Path=GET /api/v1/suppliers/{id} | Mode=verify
Context SRS: §8.4 — receiptCount + lastReceiptAt (OQ-4(b)).

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task044_suppliers_get_by_id.md
Grep suppliers trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep getSupplier hoặc suppliers/ trong @frontend/mini-erp/src/features/product-management

Output: @frontend/docs/api/bridge/BRIDGE_Task044_suppliers_get_by_id.md
```

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task044 | Path=GET /api/v1/suppliers/{id} | Mode=wire-fe
Context UI: SupplierDetailDialog.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task044_suppliers_get_by_id.md

Thực hiện:
1. getSupplierById trong api/*.ts.
2. useQuery khi mở chi tiết; hiển thị lastReceiptAt, receiptCount.
3. Grep Path trong @frontend/mini-erp/src — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task044_suppliers_get_by_id.md
```

---

## Task045 — `PATCH /api/v1/suppliers/{id}`

### Verify

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task045 | Path=PATCH /api/v1/suppliers/{id} | Mode=verify
Context SRS: §8.5 — ít nhất một field; 409 trùng supplierCode.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task045_suppliers_patch.md
Grep PATCH suppliers trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep patchSupplier trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task045_suppliers_patch.md
```

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task045 | Path=PATCH /api/v1/suppliers/{id} | Mode=wire-fe
Context UI: SupplierForm chỉnh sửa.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task045_suppliers_patch.md

Thực hiện:
1. patchSupplier trong api/*.ts.
2. useMutation; invalidate list + detail.
3. Grep Path trong @frontend/mini-erp/src — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task045_suppliers_patch.md
```

---

## Task046 — `DELETE /api/v1/suppliers/{id}`

### Verify

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task046 | Path=DELETE /api/v1/suppliers/{id} | Mode=verify
Context SRS: §6 — chỉ Owner; §8.6 — 409 HAS_RECEIPTS / HAS_PARTNER_DEBTS.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task046_suppliers_delete.md
Grep DELETE suppliers trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep deleteSupplier trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task046_suppliers_delete.md
```

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task046 | Path=DELETE /api/v1/suppliers/{id} | Mode=wire-fe
Context UI: SupplierTable — xóa một; ẩn/disable nếu không Owner.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task046_suppliers_delete.md

Thực hiện:
1. deleteSupplier trong api/*.ts.
2. Confirm + useMutation; map details.reason → toast/copy.
3. Grep Path trong @frontend/mini-erp/src — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task046_suppliers_delete.md
```

---

## Task047 — `POST /api/v1/suppliers/bulk-delete`

### Verify

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task047 | Path=POST /api/v1/suppliers/bulk-delete | Mode=verify
Context SRS: §8.7 — all-or-nothing; duplicate ids → 400; chỉ Owner.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task047_suppliers_bulk_delete.md
Grep bulk-delete suppliers trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep bulk-delete trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task047_suppliers_bulk_delete.md
```

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task047 | Path=POST /api/v1/suppliers/bulk-delete | Mode=wire-fe
Context UI: SupplierToolbar chọn nhiều + xóa bulk.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task047_suppliers_bulk_delete.md

Thực hiện:
1. postSuppliersBulkDelete(ids) — body `{ ids }`; dedupe phía FE không thay validation BE.
2. useMutation; chỉ Owner thấy hành động.
3. Grep Path trong @frontend/mini-erp/src — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task047_suppliers_bulk_delete.md
```

---

## Một dòng (verify)

```text
API_BRIDGE | Task=Task044 | Path=GET /api/v1/suppliers/{id} | Mode=verify
```
