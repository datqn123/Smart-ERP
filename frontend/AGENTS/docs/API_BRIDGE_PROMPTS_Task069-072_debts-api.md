# Prompt — API_BRIDGE — Task069–072 (sổ nợ / `debts`)

Tham chiếu: [`backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md`](../../../backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md).  
**SRS:** [`backend/docs/srs/SRS_Task069-072_debts-api.md`](../../../backend/docs/srs/SRS_Task069-072_debts-api.md) — **Approved**; §4 OQ-1..OQ-4; §6 RBAC + PATCH theo `created_by`; §8 JSON; §9 BR-9 (Cleared); §10 SQL + Flyway V26.

---

## 1. Context đầy đủ (mỗi phiên Task069–072: `@` **toàn bộ** khối dưới + file API của Task đang chạy)

```text
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_RESPONSE_ENVELOPE.md
@frontend/docs/api/API_PROJECT_DESIGN.md
@backend/docs/srs/SRS_Task069-072_debts-api.md

@backend/smart-erp/src/main/java/com/example/smart_erp/finance/controller/DebtsController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/finance/debts/PartnerDebtService.java
@backend/smart-erp/src/main/java/com/example/smart_erp/finance/debts/PartnerDebtJdbcRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/finance/ledger/FinanceLedgerAccessPolicy.java
@backend/smart-erp/src/main/resources/db/migration/V26__task069_072_partner_debts_created_by.sql

@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/mini-erp/src/features/cashflow/pages/DebtPage.tsx
@frontend/mini-erp/src/features/cashflow/components/DebtTable.tsx
@frontend/mini-erp/src/features/cashflow/components/DebtToolbar.tsx
@frontend/mini-erp/src/features/cashflow/components/DebtFormDialog.tsx
@frontend/mini-erp/src/features/cashflow/components/DebtDetailDialog.tsx
```

- **API Task (chọn đúng Task đang bridge):** `API_Task069` … `API_Task072` trong `frontend/docs/api/`.

---

## 0. Master (outline)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, §2b–2c, §3, §5, §7).

Bước 1: Đọc khối **§1 Context đầy đủ** + đúng một file `API_Task0NN_debts_*.md`.
Bước 2: Chạy từng phiên **một Path** (verify → wire-fe khi PM yêu cầu).
Output: `frontend/docs/api/bridge/BRIDGE_Task0NN_*.md` tương ứng.
```

---

## 2. Một dòng (`Mode=verify`)

```text
API_BRIDGE | Task=Task069 | Path=GET /api/v1/debts | Mode=verify
```

```text
API_BRIDGE | Task=Task070 | Path=POST /api/v1/debts | Mode=verify
```

```text
API_BRIDGE | Task=Task071 | Path=GET /api/v1/debts/{id} | Mode=verify
```

```text
API_BRIDGE | Task=Task072 | Path=PATCH /api/v1/debts/{id} | Mode=verify
```

---

## 3. Verify — đủ context (copy = một phiên / một Path)

### Task069 — GET list

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task069 | Path=GET /api/v1/debts | Mode=verify
Context SRS: @backend/docs/srs/SRS_Task069-072_debts-api.md — §8.1 query; BR-3 search; BR-8 sort; §10.2 SQL.

Đọc: khối **§1 Context đầy đủ** (file prompt này) + @frontend/docs/api/API_Task069_debts_get_list.md
Grep chuỗi `\"/api/v1/debts\"` và `\"partnerdebts\"` trong @backend/smart-erp/src/main/java (ưu tiên mở `DebtsController` + `PartnerDebtService` + `PartnerDebtJdbcRepository` nếu grep ra).
Grep chuỗi `\"/api/v1/debts\"` trong @frontend/mini-erp/src (kỳ vọng chưa có hit nếu còn mock; nếu có hit thì đối chiếu thêm file `features/cashflow/api/*.ts` trúng).

Output: @frontend/docs/api/bridge/BRIDGE_Task069_debts_get_list.md
```

### Task070 — POST create

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task070 | Path=POST /api/v1/debts | Mode=verify
Context SRS: @backend/docs/srs/SRS_Task069-072_debts-api.md — §4 OQ-3 sinh debtCode; §4 OQ-2 created_by; §8.2 201.

Đọc: khối **§1 Context đầy đủ** + @frontend/docs/api/API_Task070_debts_post.md
Grep chuỗi `\"/api/v1/debts\"` trong @backend/smart-erp/src/main/java (ưu tiên mở `DebtsController` + `PartnerDebtService` + `PartnerDebtJdbcRepository` nếu grep ra).
Grep chuỗi `\"/api/v1/debts\"` trong @frontend/mini-erp/src (nếu chưa có hit → xác nhận UI còn mock; nếu có hit thì đối chiếu `features/cashflow/api/*.ts` trúng).

Output: @frontend/docs/api/bridge/BRIDGE_Task070_debts_post.md
```

### Task071 — GET by id

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task071 | Path=GET /api/v1/debts/{id} | Mode=verify
Context SRS: @backend/docs/srs/SRS_Task069-072_debts-api.md — §8.3 shape + createdAt bắt buộc; 404 NOT_FOUND.

Đọc: khối **§1 Context đầy đủ** + @frontend/docs/api/API_Task071_debts_get_by_id.md
Grep chuỗi `\"/api/v1/debts\"` và `\"/{id}\"` trong @backend/smart-erp/src/main/java (ưu tiên mở `DebtsController` nếu grep ra).
Grep chuỗi `\"/api/v1/debts\"` trong @frontend/mini-erp/src (kỳ vọng chưa có hit nếu còn mock; nếu có hit thì đối chiếu `features/cashflow/api/*.ts` và UI dialog trúng).

Output: @frontend/docs/api/bridge/BRIDGE_Task071_debts_get_by_id.md
```

### Task072 — PATCH

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task072 | Path=PATCH /api/v1/debts/{id} | Mode=verify
Context SRS: @backend/docs/srs/SRS_Task069-072_debts-api.md — §4 OQ-1 Cleared + tiền → 409; §4 OQ-4 cắt trần paymentAmount; §6 PATCH chỉ created_by.

Đọc: khối **§1 Context đầy đủ** + @frontend/docs/api/API_Task072_debts_patch.md
Grep chuỗi `\"/api/v1/debts\"` và `\"/{id}\"` trong @backend/smart-erp/src/main/java (ưu tiên mở `DebtsController` nếu grep ra).
Grep chuỗi `\"paymentAmount\"` và `\"created_by\"` trong @backend/smart-erp/src/main/java (ưu tiên `PartnerDebtService` + `PartnerDebtJdbcRepository`).
Grep chuỗi `\"/api/v1/debts\"` trong @frontend/mini-erp/src (kỳ vọng chưa có hit nếu còn mock; nếu có hit thì đối chiếu `features/cashflow/api/*.ts` + UI dialog trúng).

Output: @frontend/docs/api/bridge/BRIDGE_Task072_debts_patch.md
```

---

## 4. `wire-fe` — đủ context (sau verify; một Path / phiên)

### Task069 — wire-fe (list + filter + phân trang)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task069 | Path=GET /api/v1/debts | Mode=wire-fe
Context UI: /cashflow/debt (DebtPage).

Đọc: @frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md (Bước 0) + khối **§1 Context đầy đủ** + @frontend/docs/api/API_Task069_debts_get_list.md
Grep chuỗi `\"/api/v1/debts\"` trong @frontend/mini-erp/src để định vị nơi đang mock / nơi cần thay.
Thực hiện: tạo `features/cashflow/api/debtsApi.ts` (apiJson) + query hook + thay mock trong `DebtPage`/`DebtTable`; không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task069_debts_get_list.md
```

### Task070 — wire-fe (tạo khoản nợ)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task070 | Path=POST /api/v1/debts | Mode=wire-fe
Context UI: DebtFormDialog.

Đọc: @frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md (Bước 0) + khối **§1 Context đầy đủ** + @frontend/docs/api/API_Task070_debts_post.md
Grep chuỗi `\"/api/v1/debts\"` trong @frontend/mini-erp/src để định vị form/dialog đang dùng mock.
Thực hiện: mutation POST (apiJson) + invalidate list Task069 sau tạo.

Output: @frontend/docs/api/bridge/BRIDGE_Task070_debts_post.md
```

### Task071 — wire-fe (chi tiết)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task071 | Path=GET /api/v1/debts/{id} | Mode=wire-fe
Context UI: DebtDetailDialog (mở chi tiết).

Đọc: @frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md (Bước 0) + khối **§1 Context đầy đủ** + @frontend/docs/api/API_Task071_debts_get_by_id.md
Grep chuỗi `\"/api/v1/debts\"` trong @frontend/mini-erp/src để định vị dialog đang dùng mock.
Thực hiện: query GET by id khi mở dialog; map data hiển thị (createdAt/updatedAt, remainingAmount).

Output: @frontend/docs/api/bridge/BRIDGE_Task071_debts_get_by_id.md
```

### Task072 — wire-fe (ghi nhận thanh toán / sửa)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task072 | Path=PATCH /api/v1/debts/{id} | Mode=wire-fe
Context UI: DebtDetailDialog hoặc action trên DebtTable.

Đọc: @frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md (Bước 0) + khối **§1 Context đầy đủ** + @frontend/docs/api/API_Task072_debts_patch.md
Grep chuỗi `\"/api/v1/debts\"` trong @frontend/mini-erp/src để định vị nơi gọi PATCH.
Thực hiện: PATCH `{paymentAmount}`; xử lý **403/409** theo `message` (409 Cleared + tiền); sau PATCH invalidate list Task069 + refetch detail Task071.

Output: @frontend/docs/api/bridge/BRIDGE_Task072_debts_patch.md
```

