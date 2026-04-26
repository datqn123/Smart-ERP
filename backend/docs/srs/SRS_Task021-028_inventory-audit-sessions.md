# SRS — Kiểm kê kho (đợt kiểm kê) — REST Task021–Task028

> **File (Spring / `smart-erp`):** `backend/docs/srs/SRS_Task021-028_inventory-audit-sessions.md`  
> **Người soạn:** Agent BA (+ SQL Draft)  
> **Ngày:** 26/04/2026  
> **Trạng thái:** Draft  
> **PO duyệt (khi Approved):** *chưa*

---

## 0. Đầu vào & traceability

| Nguồn | Đường dẫn / ghi chú |
| :--- | :--- |
| API Task021 | [`../../../frontend/docs/api/API_Task021_inventory_audit_sessions_get_list.md`](../../../frontend/docs/api/API_Task021_inventory_audit_sessions_get_list.md) |
| API Task022 | [`../../../frontend/docs/api/API_Task022_inventory_audit_sessions_post.md`](../../../frontend/docs/api/API_Task022_inventory_audit_sessions_post.md) |
| API Task023 | [`../../../frontend/docs/api/API_Task023_inventory_audit_sessions_get_by_id.md`](../../../frontend/docs/api/API_Task023_inventory_audit_sessions_get_by_id.md) |
| API Task024 | [`../../../frontend/docs/api/API_Task024_inventory_audit_sessions_patch.md`](../../../frontend/docs/api/API_Task024_inventory_audit_sessions_patch.md) |
| API Task025 | [`../../../frontend/docs/api/API_Task025_inventory_audit_sessions_patch_lines.md`](../../../frontend/docs/api/API_Task025_inventory_audit_sessions_patch_lines.md) |
| API Task026 | [`../../../frontend/docs/api/API_Task026_inventory_audit_sessions_complete.md`](../../../frontend/docs/api/API_Task026_inventory_audit_sessions_complete.md) |
| API Task027 | [`../../../frontend/docs/api/API_Task027_inventory_audit_sessions_cancel.md`](../../../frontend/docs/api/API_Task027_inventory_audit_sessions_cancel.md) |
| API Task028 | [`../../../frontend/docs/api/API_Task028_inventory_audit_sessions_apply_variance.md`](../../../frontend/docs/api/API_Task028_inventory_audit_sessions_apply_variance.md) |
| API design | [`../../../frontend/docs/api/API_PROJECT_DESIGN.md`](../../../frontend/docs/api/API_PROJECT_DESIGN.md) §4.15 |
| UC / tồn kho | [`../../../frontend/docs/UC/Database_Specification.md`](../../../frontend/docs/UC/Database_Specification.md) §16 `Inventory` |
| Flyway | [`../../smart-erp/src/main/resources/db/migration/V1__baseline_smart_inventory.sql`](../../smart-erp/src/main/resources/db/migration/V1__baseline_smart_inventory.sql) — `Inventory`, `InventoryAuditSessions`, `InventoryAuditLines`, `InventoryLogs`, `Users`, `Products`, `WarehouseLocations`, `ProductUnits`, `SystemLogs` |

---

## 1. Tóm tắt điều hành

- **Vấn đề:** Cần một **bộ REST thống nhất** cho UC6 — danh sách đợt kiểm kê, tạo đợt + snapshot dòng từ `Inventory`, đọc chi tiết, cập nhật meta/trạng thái, ghi số thực tế từng dòng, hoàn tất, hủy, áp chênh lệch lên tồn — thay mock FE.
- **Mục tiêu:** Mô tả nghiệp vụ, máy trạng thái, transaction, toàn vẹn DB; **hợp nhất** lệch giữa các file API markdown và **schema Flyway thực tế** (tên bảng, kiểu khóa, cột idempotency).
- **Đối tượng:** Staff / Owner / Admin có quyền kho (chi tiết RBAC → §4 OQ + §6).

---

## 2. Bóc tách nghiệp vụ (capabilities)

| # | Capability | Method + path | Kết quả |
| :---: | :--- | :--- | :--- |
| C1 | Phân trang + lọc danh sách đợt; tổng hợp `totalLines` / `countedLines` / `varianceLines` | `GET /api/v1/inventory/audit-sessions` | `200` + `items[]` |
| C2 | Tạo đợt `Pending`, sinh `audit_code` (KK-YYYY-NNNN), snapshot dòng theo `scope` | `POST /api/v1/inventory/audit-sessions` | `201` + shape Task023 |
| C3 | Đọc một đợt + toàn bộ dòng (join SP, vị trí, đơn vị hiển thị) | `GET /api/v1/inventory/audit-sessions/{id}` | `200` / `404` |
| C4 | PATCH meta (`title`, `notes`) + chuyển `Pending` → `In Progress` | `PATCH /api/v1/inventory/audit-sessions/{id}` | `200` |
| C5 | Ghi `actual_quantity` / `notes` cho một hoặc nhiều dòng | `PATCH /api/v1/inventory/audit-sessions/{id}/lines` | `200` |
| C6 | Đóng đợt `Completed` (+ `completed_at`, `completed_by`) | `POST /api/v1/inventory/audit-sessions/{id}/complete` | `200` |
| C7 | Hủy đợt `Cancelled` | `POST /api/v1/inventory/audit-sessions/{id}/cancel` | `200` |
| C8 | Áp chênh lệch lên `Inventory` + `InventoryLogs`, idempotent theo dòng | `POST /api/v1/inventory/audit-sessions/{id}/apply-variance` | `200` / `409` nếu đã apply |

**Máy trạng thái (mặc định SRS — đã hợp nhất Task024 + Task026 + Task027):**

```text
                    ┌── cancel (Task027) ──► Cancelled
                    │
Pending ──PATCH status In Progress──► In Progress ──complete (Task026)──► Completed
   │                      │                              │
   │                      └── cancel ─────────────────────┘
   └── (không cho Completed/Cancelled quay lui — Task027)
```

- **`Cancelled`:** chỉ qua **Task027** (không qua PATCH meta — tránh trùng với Task024 “khuyến nghị Task027”).
- **`Completed`:** chỉ qua **Task026** (không PATCH trạng thái Completed).

---

## 3. Phạm vi

### 3.1 In-scope

- Tám endpoint Task021–028; envelope JSON dự án (`success`, `data`, `message`, `error`, `details`).
- Validation query/body theo từng API doc; mã lỗi: 400, 401, 403, 404, 409, 500 theo từng luồng.

### 3.2 Out-of-scope

- Báo cáo kiểm kê tổng hợp đa cửa hàng; import CSV; quyền phê duyệt riêng (trừ khi OQ chốt).
- **Task012** notify Owner — chỉ ghi nhắc trong Task028 API; không bắt buộc trong SRS v1.

---

## 4. Câu hỏi làm rõ cho PO (Open Questions)

> BA không tự chốt thay PO. Các mục **Quyết định BA đã hợp nhất** (§12) không nằm ở đây.

| ID | Câu hỏi | Ảnh hưởng nếu không trả lời | Blocker? |
| :--- | :--- | :--- | :---: |
| **OQ-1** | **RBAC cụ thể:** Map “Owner / Staff / Admin (UC6)” sang `hasAuthority('can_manage_inventory')` (và có cần `can_approve` cho bất kỳ endpoint này không)? | 403 rule không nhất quán với module tồn khác | **Có** |
| **OQ-2** | **Giới hạn song song:** Có chặn tạo đợt mới / chuyển `In Progress` khi đã tồn tại **một** đợt `In Progress` toàn hệ thống / theo `location` không? (Task022 gợi ý 409 — tùy PM.) | 409 vs luôn cho phép | Không |
| **OQ-3** | **Hoàn tất (Task026):** Chỉ cho `In Progress` → `Completed`, hay cho phép **`Pending` → `Completed`** (bỏ bước đếm trong một số quy trình)? | AC test complete từ Pending | **Có** |
| **OQ-4** | **Hủy (Task027):** Lý do hủy chỉ **nối vào `notes`** (Flyway hiện **không** có `cancel_reason`), hay bắt buộc **migration thêm cột** `cancel_reason`? | Ghi log/audit vs schema | Không |
| **OQ-5** | **Áp chênh lệch (Task028):** `Inventory.quantity` là **INT**; `actual_quantity` / `system_quantity` là **DECIMAL(12,4)**. Khi apply: **(A)** làm tròn HALF_UP về int; **(B)** nâng cột `inventory.quantity` lên NUMERIC (migration). | Lệch số lượng so với đếm thực tế | **Có** |
| **OQ-6** | **`SystemLogs`** sau các bước ghi (Task022,024,025,026,027,028): insert **bắt buộc** trong transaction hay **best-effort** sau commit (lỗi log không fail request)? | Hành vi hiếm / vận hành | Không |
| **OQ-7** | **Snapshot dòng có `quantity = 0`:** Task022 ghi “mặc định vẫn snapshot”; có policy **loại bỏ** dòng tồn 0 khỏi đợt kiểm không? | Số dòng đợt / UX đếm | Không |

**Trả lời PO (điền khi chốt):**

| ID | Quyết định PO | Ngày |
| :--- | :--- | :--- |
| OQ-1 | Ai cũng làm được chức năng kiểm kê này, Permission all User | |
| OQ-2 | Có | |
| OQ-3 | Chỉ cho `In Progress` → `Completed` | |
| OQ-4 | **migration thêm cột** `cancel_reason` | |
| OQ-5 | **(A)** làm tròn HALF_UP về int | |
| OQ-6 | Tạm thời chưa làm SysLogs | |
| OQ-7 | Không loại bỏ | |

---

## 5. Phân tích scope tệp & bằng chứng

### 5.1 Tài liệu đã đối chiếu

- `API_Task021` … `API_Task028` (toàn bộ).
- Flyway `V1__baseline_smart_inventory.sql` (mục Inventory audit + Inventory + InventoryLogs).

### 5.2 Mã / package dự kiến (Spring)

- Controller mới hoặc mở rộng dưới `.../inventory/` (prefix `/api/v1/inventory/audit-sessions`).
- Service + JDBC/JPA repository cho `InventoryAuditSessions` / `InventoryAuditLines`, đồng bộ với quy ước module `inventory` hiện có.
- **Không** sửa `frontend/mini-erp/**` trong SRS backend (API_BRIDGE sau G-DEV).

### 5.3 Rủi ro phát hiện sớm

- **Race** khi `apply-variance` đồng thời với nhập/xuất khác trên cùng `inventory_id` — cần `SELECT … FOR UPDATE` trên `inventory` trong transaction Task028 (đã nêu trong API Task028).

---

## 6. Persona & RBAC

| Vai trò | Điều kiện (sau khi OQ-1 chốt) | HTTP khi từ chối |
| :--- | :--- | :--- |
| Người dùng đã đăng nhập | JWT hợp lệ | 401 |
| Quyền UC6 / kho | Theo OQ-1 (mặc định tạm: `can_manage_inventory` cho Task021–027; Task028 giữ cùng authority trừ PO đổi) | 403 |

---

## 7. Actor & luồng nghiệp vụ

### 7.1 Actor

| Actor | Mô tả |
| :--- | :--- |
| User | Nhân viên / quản lý thực hiện kiểm kê |
| Client | Mini-ERP |
| API | `smart-erp` |
| DB | PostgreSQL |

### 7.2 Luồng chính (tóm tắt)

1. User tạo đợt (scope) → hệ thống snapshot `system_quantity` từ `inventory`.
2. User chuyển `In Progress` (PATCH), nhập số thực tế (PATCH lines).
3. User hoàn tất (complete) khi đủ điều kiện đếm.
4. User áp chênh lệch (apply-variance) → cập nhật `inventory` + `inventory_logs`.

### 7.3 Sơ đồ (apply variance)

```mermaid
sequenceDiagram
  participant C as Client
  participant A as API
  participant D as DB
  C->>A: POST apply-variance (reason, mode)
  A->>D: BEGIN; lock session + lines + inventory rows
  A->>D: UPDATE inventory; INSERT inventory_logs
  A->>D: UPDATE audit lines variance_applied_at (idempotent)
  A->>D: COMMIT
  A-->>C: 200 + appliedLines
```

---

## 8. Hợp đồng HTTP & ví dụ JSON

> Chi tiết field-level: **bám nguyên** các mục §5–§6 của từng file `API_Task021` … `API_Task028`. Dưới đây là ví dụ rút gọn + lỗi tiêu biểu; Tester lấy đủ mẫu từ API doc + [`API_RESPONSE_ENVELOPE.md`](../../../frontend/docs/api/API_RESPONSE_ENVELOPE.md).

### 8.1 Bảng endpoint

| Task | Method | Path |
| :---: | :--- | :--- |
| 021 | GET | `/api/v1/inventory/audit-sessions` |
| 022 | POST | `/api/v1/inventory/audit-sessions` |
| 023 | GET | `/api/v1/inventory/audit-sessions/{id}` |
| 024 | PATCH | `/api/v1/inventory/audit-sessions/{id}` |
| 025 | PATCH | `/api/v1/inventory/audit-sessions/{id}/lines` |
| 026 | POST | `/api/v1/inventory/audit-sessions/{id}/complete` |
| 027 | POST | `/api/v1/inventory/audit-sessions/{id}/cancel` |
| 028 | POST | `/api/v1/inventory/audit-sessions/{id}/apply-variance` |

### 8.2 Request ví dụ — Task022 (tạo đợt)

```json
{
  "title": "Kiểm kê kho A1 - Tháng 4",
  "auditDate": "2026-04-13",
  "notes": null,
  "scope": {
    "mode": "by_location_ids",
    "locationIds": [1, 2]
  }
}
```

### 8.3 Response lỗi tiêu biểu — 409 (state / idempotency)

```json
{
  "success": false,
  "error": "CONFLICT",
  "message": "Không thể hoàn tất: còn dòng chưa đếm",
  "details": {}
}
```

---

## 9. Quy tắc nghiệp vụ (BR)

| Mã | Điều kiện | Hành động / kết quả |
| :--- | :--- | :--- |
| BR-1 | `status` ∈ `Pending`, `In Progress`, `Completed`, `Cancelled` (đúng chuỗi có khoảng trắng như CHECK Flyway) | Validate mọi transition |
| BR-2 | Task021 `varianceLines` | Chỉ đếm dòng `is_counted = true` AND `actual_quantity` NOT NULL AND `(actual_quantity - system_quantity) <> 0` (theo Task021) |
| BR-3 | Task023 `variance` / `variancePercent` khi chưa đếm | `actualQuantity` null → API trả `variance = 0`, `variancePercent = 0`, `isCounted = false` (theo Task023) |
| BR-4 | Task025 | `actual_quantity >= 0`; khi ghi số: `is_counted = true` |
| BR-5 | Task026 `requireAllCounted = true` (mặc định) | `COUNT(*) WHERE is_counted = false` > 0 → 409 |
| BR-6 | Task028 idempotent | Nếu `variance_applied_at` IS NOT NULL trên dòng → không apply lại dòng đó; toàn request đã apply hết → 409 “Đã áp chênh lệch” |
| BR-7 | Task028 sau cập nhật | `inventory.quantity >= 0` (CHECK DB); vi phạm → rollback, 409 hoặc 400 |

---

## 10. Dữ liệu & SQL tham chiếu (Agent SQL)

### 10.1 Tên bảng vật lý PostgreSQL (Flyway V1)

PostgreSQL chuẩn hoá identifier không có dấu ngoặc kép về **chữ thường**. DDL Flyway dùng `CREATE TABLE InventoryAuditSessions` → tên bảng thực tế **`inventoryauditsessions`**; tương tự **`inventoryauditlines`**, **`inventory`**, **`inventorylogs`**, **`users`**, **`products`**, **`warehouselocations`**, **`productunits`**, **`systemlogs`**.

> **GAP tài liệu API:** các file API ghi `inventory_audit_sessions` (snake có gạch dưới) — **không** khớp tên vật lý trên. Dev dùng đúng tên PG hoặc quote identifier có chủ ý; SRS chốt theo **Flyway**.

### 10.2 Cột liên quan (rút gọn)

| Bảng | Cột / ghi chú |
| :--- | :--- |
| `inventoryauditsessions` | `id` SERIAL PK, `audit_code` UNIQUE, `title`, `audit_date`, `status`, `location_filter`, `category_filter`, `notes`, `created_by`, `completed_at`, `completed_by`, timestamps |
| `inventoryauditlines` | `id` SERIAL PK, `session_id` FK → sessions, `inventory_id` FK → `inventory`, `system_quantity` DECIMAL(12,4), `actual_quantity` DECIMAL(12,4) NULL, `is_counted` BOOLEAN, `notes` VARCHAR(500), **`variance_applied_at`** TIMESTAMP NULL (idempotency Task028) |
| `inventory` | `id`, `product_id`, `location_id`, `batch_number`, `expiry_date`, **`quantity` INT** ≥ 0 |

### 10.3 SQL mẫu — danh sách Task021 (ý tưởng)

```sql
-- Đếm tổng (filter giống query list)
SELECT COUNT(*) FROM inventoryauditsessions s
WHERE (:status = 'all' OR s.status = :status)
  AND ( :search IS NULL OR s.audit_code ILIKE :search OR s.title ILIKE :search
        OR EXISTS (SELECT 1 FROM users u WHERE u.id = s.created_by AND u.full_name ILIKE :search) );

-- Một dòng list: join users (created_by, completed_by) + aggregate từ lines
SELECT s.id, s.audit_code, ...,
       (SELECT COUNT(*) FROM inventoryauditlines l WHERE l.session_id = s.id) AS total_lines,
       (SELECT COUNT(*) FROM inventoryauditlines l WHERE l.session_id = s.id AND l.is_counted) AS counted_lines,
       (SELECT COUNT(*) FROM inventoryauditlines l WHERE l.session_id = s.id AND l.is_counted
          AND l.actual_quantity IS NOT NULL
          AND (l.actual_quantity - l.system_quantity) <> 0) AS variance_lines
FROM inventoryauditsessions s
JOIN users uc ON uc.id = s.created_by
LEFT JOIN users uf ON uf.id = s.completed_by
WHERE ...
ORDER BY s.audit_date DESC, s.id DESC
LIMIT :limit OFFSET :offset;
```

### 10.4 Transaction & khóa

| Luồng | Khuyến nghị |
| :--- | :--- |
| Task022 tạo đợt | Một transaction: sinh mã + INSERT session + INSERT N lines |
| Task024 / 025 / 026 / 027 | `SELECT … FROM inventoryauditsessions WHERE id = ? FOR UPDATE` trước UPDATE |
| Task028 | FOR UPDATE trên session (`Completed` only), từng `inventory` row liên quan, cập nhật line `variance_applied_at` trong cùng transaction |

### 10.5 Index (đã có / đủ cho v1)

- `idx_audit_sessions_status` trên `inventoryauditsessions(status)` — lọc list.
- `idx_audit_lines_session` trên `inventoryauditlines(session_id)` — join + aggregate.

Đề xuất bổ sung (tùy volume): index `(audit_date DESC, id DESC)` nếu EXPLAIN list chậm.

### 10.6 Kiểm chứng cho Tester

- Sau Task022: số dòng `inventoryauditlines` = số dòng `inventory` khớp scope.
- Sau Task028: với dòng đã có `variance_applied_at`, gọi lại apply → 409; `inventory.quantity` khớp mode (sau làm tròn nếu OQ-5 = A).

---

## 11. Acceptance criteria (Given / When / Then) — rút gọn

```text
Given đợt ở trạng thái Pending và có ít nhất một dòng snapshot
When PATCH …/lines với actualQuantity hợp lệ
Then is_counted = true và GET by id trả đúng actualQuantity
```

```text
Given đợt In Progress và mọi dòng is_counted = true
When POST …/complete với requireAllCounted true
Then status = Completed và completed_at / completed_by được set
```

```text
Given đợt Completed và dòng có variance <> 0 chưa apply
When POST …/apply-variance (reason, mode)
Then inventory.quantity cập nhật đúng policy OQ-5; inventory_logs có bản ghi; variance_applied_at NOT NULL
```

```text
Given đã apply variance cho session
When POST …/apply-variance lần nữa
Then 409 (idempotent)
```

---

## 12. GAP & giả định — **Quyết định BA đã hợp nhất** (không cần PO nếu không sai mục đích)

| # | Chủ đề | Quyết định |
| :---: | :--- | :--- |
| G1 | Tên bảng API vs Flyway | SRS & Dev bám **Flyway** (mục §10.1); API markdown giữ nguyên nhưng coi là **tên logic** — cập nhật doc sau (Doc Sync) hoặc ghi chú trong BRIDGE. |
| G2 | Kiểu `id` session/line | **SERIAL (INT)** theo V1; không dùng BIGSERIAL như phụ lục DDL mẫu trong Task022. |
| G3 | Hủy đợt | **`Cancelled` chỉ qua Task027**; PATCH Task024 **không** chuyển sang `Cancelled` (tránh trùng Task024 §2 vs Task027). |
| G4 | PATCH status Task024 | Chỉ cho phép chuyển **`Pending` → `In Progress`** (khớp Zod Task024 chỉ enum `In Progress`); không cho `In Progress` → `Pending` qua PATCH (Task024 gợi ý rollback → mặc định 409). |
| G5 | Đơn vị hiển thị Task023 | **Đơn vị cơ sở** (`productunits.is_base_unit = true`) cho `unitName` — nhất quán với các API tồn đã chốt base unit ở module nhập. |
| G6 | `location_filter` / `category_filter` | Text snapshot trên header theo scope (Task022 §7) — map từ `warehouse_code` gộp / `category_id` string hoá tùy Dev miễn hiển thị list Task021. |
| G7 | Task028 `InventoryLogs` | Dùng `action_type = 'ADJUSTMENT'`; `reference_note` ≤ 255 ký tự — nối mã đợt + lineId (truncate nếu cần). |
| G8 | Task028 mode mặc định | Mặc định **`delta`** (theo Zod Task028); `set_actual` vẫn hỗ trợ như spec với cảnh báo trong API doc. |

---

## 13. PO sign-off (chỉ điền khi Approved)

- [ ] Đã trả lời / đóng các **OQ blocker** (OQ-1, OQ-3, OQ-5 tối thiểu)
- [ ] JSON / state machine khớp vận hành thực tế cửa hàng
- [ ] Đồng ý phạm vi In/Out §3

**Chữ ký / nhãn PR:** …
