# Prompt đủ cho 2 Task — UC4 Approvals: danh sách chờ & lịch sử (Task061–Task062)

Tham chiếu workflow: [`backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md`](../../../backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md).

**SRS nguồn (chân lý nghiệp vụ + hợp đồng HTTP):** [`backend/docs/srs/SRS_Task061-062_approvals-pending-and-history.md`](../../../backend/docs/srs/SRS_Task061-062_approvals-pending-and-history.md) — **§8.A / §8.B** endpoint + query + ví dụ JSON; **§9** BR-1…BR-6; **§6** RBAC; **§0.1** đồng nhất (lọc pending theo `receipt_date`, history theo `reviewed_at`; `fromDate > toDate` → **400** cả hai GET); **OQ-1a** Staff **403**; **OQ-2b** pending: `date` item = `receipt_date`, sort **`created_at ASC`**; **OQ-3c** `rejectionReason` non-empty khi `Rejected`; **§1.1** route UI.

Sau **G-DEV** (`mvn verify` xanh) — mỗi `Path` **một** phiên `API_BRIDGE` (khuyến nghị `Mode=verify` trước, rồi `wire-fe` khi thay mock).

**Controller BE tham chiếu:**

- [`backend/smart-erp/src/main/java/com/example/smart_erp/inventory/controller/ApprovalsController.java`](../../../backend/smart-erp/src/main/java/com/example/smart_erp/inventory/controller/ApprovalsController.java) — prefix `/api/v1/approvals`

**Chân lý API markdown FE:**

- [`frontend/docs/api/API_Task061_approvals_pending_get_list.md`](../../docs/api/API_Task061_approvals_pending_get_list.md)
- [`frontend/docs/api/API_Task062_approvals_history_get_list.md`](../../docs/api/API_Task062_approvals_history_get_list.md)

**Ghi chú Doc Sync:** repo có thể **chưa** có `frontend/docs/api/endpoints/Task061*.md` hoặc `samples/Task061/` — agent đọc trực tiếp `API_Task061` / `API_Task062` theo mục **Bước 1** trong `API_BRIDGE_AGENT_INSTRUCTIONS.md`.

---

## 0. Master (dán một lần — outline + SRS)

Dùng khi Owner cần agent đọc SRS trước, rồi tách **2 phiên** theo bảng dưới.

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, mục 2b–2c, 3, 5, 7).

Bối cảnh SRS: @backend/docs/srs/SRS_Task061-062_approvals-pending-and-history.md — §8.A Task061, §8.B Task062; §2 C1–C4; §6 RBAC Owner/Admin (Staff 403); §0.1 + §9 BR; OQ-1a, OQ-2b, OQ-3c.

Bước 1: Đọc @frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
Bước 2: Với từng endpoint (061 → 062), chạy một prompt riêng mục 0.1a "Verify" — output `frontend/docs/api/bridge/BRIDGE_TaskXXX_*.md` đúng mục 5 file API_BRIDGE.

Controller BE: @backend/smart-erp/src/main/java/com/example/smart_erp/inventory/controller/ApprovalsController.java
```

### 0.1 Một dòng mỗi Path (`Mode=verify`)

```text
API_BRIDGE | Task=Task061 | Path=GET /api/v1/approvals/pending | Mode=verify
```

```text
API_BRIDGE | Task=Task062 | Path=GET /api/v1/approvals/history | Mode=verify
```

### 0.1a Verify — gộp sẵn (dán từng block = một phiên)

#### Task061

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, mục 2b–2c, 3, 5, 7).

Bối cảnh SRS: @backend/docs/srs/SRS_Task061-062_approvals-pending-and-history.md — §8.A (pending), C1; §6; §0.1 (lọc `receipt_date`, `date` trong item, sort `created_at ASC`); §9 BR-2, BR-4; OQ-1a Staff 403.
Controller BE: @backend/smart-erp/src/main/java/com/example/smart_erp/inventory/controller/ApprovalsController.java

API_BRIDGE | Task=Task061 | Path=GET /api/v1/approvals/pending | Mode=verify

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task061_approvals_pending_get_list.md
Grep "/api/v1/approvals/pending" trong @backend/smart-erp/src/main/java/com/example/smart_erp/inventory
Grep approvals/pending hoặc /api/v1/approvals trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task061_approvals_pending_get_list.md
```

#### Task062

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, mục 2b–2c, 3, 5, 7).

Bối cảnh SRS: @backend/docs/srs/SRS_Task061-062_approvals-pending-and-history.md — §8.B (history), C2; lọc `reviewed_at::date`; `resolution`; search creator+reviewer; §9 BR-1, BR-3, BR-4, BR-6; OQ-3c `rejectionReason`; sort `reviewed_at DESC`.
Controller BE: @backend/smart-erp/src/main/java/com/example/smart_erp/inventory/controller/ApprovalsController.java

API_BRIDGE | Task=Task062 | Path=GET /api/v1/approvals/history | Mode=verify

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task062_approvals_history_get_list.md
Grep "/api/v1/approvals/history" trong @backend/smart-erp/src/main/java/com/example/smart_erp/inventory
Grep approvals/history hoặc /api/v1/approvals trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task062_approvals_history_get_list.md
```

---

## 0.2 `Mode=wire-fe` — thay mock `useApprovalStore` (đọc SRS §1.1 + index)

**Bối cảnh UI hiện tại:** `PendingApprovalsPage` / `ApprovalHistoryPage` vẫn có thể dùng `mockApprovals` qua Zustand — cần **TanStack Query** (hoặc pattern đã dùng ở feature khác) + `features/approvals/api/*.ts` gọi `apiJson`. **Duyệt / từ chối** phiếu nhập: **không** thuộc Task061/062 — map `entityType` + `entityId` → Task019 / Task020 (`API_Task019`, `API_Task020`).

### Task061 — Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task061 | Path=GET /api/v1/approvals/pending | Mode=wire-fe
Context UI: route `/approvals/pending` — @frontend/mini-erp/src/features/FEATURES_UI_INDEX.md (bảng 1 + mục `approvals/`).

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task061_approvals_pending_get_list.md
Bối cảnh SRS (tối thiểu): @backend/docs/srs/SRS_Task061-062_approvals-pending-and-history.md — §8.A, §6, OQ-2b

Thực hiện:
1. Tạo hoặc mở rộng `features/approvals/api/*.ts` — hàm list pending (query: search, type, fromDate, toDate, page, limit) qua `apiJson`.
2. `PendingApprovalsPage.tsx` — load danh sách + `summary` từ API; xử lý 400 (khoảng ngày), 401/403; map row → `entityType`/`entityId` cho nút duyệt/từ chối (Task019/020).
3. Grep `/api/v1/approvals` trong @frontend/mini-erp/src — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task061_approvals_pending_get_list.md
```

### Task062 — Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task062 | Path=GET /api/v1/approvals/history | Mode=wire-fe
Context UI: route `/approvals/history` — FEATURES_UI_INDEX.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task062_approvals_history_get_list.md
Bối cảnh SRS: @backend/docs/srs/SRS_Task061-062_approvals-pending-and-history.md — §8.B, §6, OQ-3c

Thực hiện:
1. `features/approvals/api/*.ts` — hàm list history (resolution, search, type, fromDate, toDate, page, limit).
2. `ApprovalHistoryPage.tsx` — bảng lịch sử từ API; cột `reviewedAt`, `resolution`, `rejectionReason`, `reviewerName` theo spec.
3. Grep Path trong @frontend/mini-erp/src — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task062_approvals_history_get_list.md
```

---

## 0.3 `Mode=fix-doc` / `fix-fe` / `fix-be` (tối thiểu)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task061 | Path=GET /api/v1/approvals/pending | Mode=fix-doc
Context SRS: @backend/docs/srs/SRS_Task061-062_approvals-pending-and-history.md §8.A

Đọc: @frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md → @frontend/docs/api/API_Task061_approvals_pending_get_list.md
Grep Path trong @backend/smart-erp/src/main/java/com/example/smart_erp/inventory/controller/ApprovalsController.java

Output: @frontend/docs/api/bridge/BRIDGE_Task061_approvals_pending_get_list.md
```

(Lặp với `Task062`, `fix-fe` / `fix-be` khi ticket chỉ rõ drift.)

---

## Ngữ cảnh SRS (copy vào đầu phiên hoặc nhắc trong từng prompt)

[`backend/docs/srs/SRS_Task061-062_approvals-pending-and-history.md`](../../../backend/docs/srs/SRS_Task061-062_approvals-pending-and-history.md) — **§8** hợp đồng GET; **§2** C1–C4; **§6** Owner/Admin, Staff **403**; **§0.1** pending theo `receipt_date`, history theo `reviewed_at`, **400** khi `fromDate > toDate`; **§9** BR (type không Inbound → danh sách rỗng; history chỉ Approved/Rejected có `reviewed_at`); **OQ-3c** dữ liệu `Rejected` có lý do.

**UI §1.1 SRS + index:**

| Route | Page |
| :--- | :--- |
| `/approvals/pending` | `PendingApprovalsPage` |
| `/approvals/history` | `ApprovalHistoryPage` |

Tra [`frontend/mini-erp/src/features/FEATURES_UI_INDEX.md`](../../mini-erp/src/features/FEATURES_UI_INDEX.md) — feature `approvals/`.

**Bảng output `BRIDGE_*` mục tiêu:**

| Task | Spec FE | Bridge output |
| :--- | :--- | :--- |
| 061 | `API_Task061_approvals_pending_get_list.md` | `BRIDGE_Task061_approvals_pending_get_list.md` |
| 062 | `API_Task062_approvals_history_get_list.md` | `BRIDGE_Task062_approvals_history_get_list.md` |

---

## Tổng kết

- **Hai phiên tối thiểu:** Task061 pending, Task062 history — mỗi phiên một `BRIDGE_*.md`.
- **Wire-fe:** ưu tiên `features/approvals/api/*.ts` + hai page; giữ tách **đọc danh sách** (061/062) và **hành động duyệt** (019/020).
- **Không** đọc full SRS trong phiên verify — agent chỉ cần các mục SRS đã gắn `@` ở trên.
