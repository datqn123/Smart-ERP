# Prompt — API_BRIDGE — Task064–068 (thu chi / `cash-transactions`)

Tham chiếu: [`backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md`](../../../backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md).  
**SRS:** [`backend/docs/srs/SRS_Task064-068_cash-transactions-api.md`](../../../backend/docs/srs/SRS_Task064-068_cash-transactions-api.md) — Approved; **§4** OQ; **§6** RBAC + 403 người tạo; **§8** JSON; **§9** BR-9…BR-13; **§10** SQL; **§11** AC.

---

## 1. Context đầy đủ (mỗi phiên Task064–068: `@` **toàn bộ** khối dưới + file API của Task đang chạy)

```text
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_RESPONSE_ENVELOPE.md
@backend/docs/srs/SRS_Task064-068_cash-transactions-api.md
@frontend/docs/api/API_PROJECT_DESIGN.md
@frontend/docs/UC/Database_Specification.md
@backend/smart-erp/src/main/java/com/example/smart_erp/finance/controller/CashTransactionsController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/finance/cashtx/CashTransactionService.java
@backend/smart-erp/src/main/java/com/example/smart_erp/finance/cashtx/CashTransactionJdbcRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/finance/ledger/FinanceLedgerAccessPolicy.java
@backend/smart-erp/src/main/resources/db/migration/V25__task064_068_cash_tx_performed_by_staff_finance.sql
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/mini-erp/src/features/cashflow/pages/TransactionsPage.tsx
@frontend/mini-erp/src/features/cashflow/types.ts
@frontend/mini-erp/src/features/cashflow/mockData.ts
```

- **API Task (chọn đúng Task đang bridge):** `API_Task064` … `API_Task068` trong [`frontend/docs/api/`](../../docs/api/).

---

## 0. Master (outline)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, §2b–2c, §3, §5, §7).

Bối cảnh: @backend/docs/srs/SRS_Task064-068_cash-transactions-api.md — §1.1 UI; §4 OQ; §6–§11 nghiệp vụ.

Bước 1: Đọc khối **§1 Context đầy đủ** + đúng một `API_Task0NN_*cash_transactions*.md`.
Bước 2: Chạy từng phiên **một Path** (verify → wire-fe khi PM yêu cầu).
Output: `frontend/docs/api/bridge/BRIDGE_Task0NN_*.md` tương ứng.
```

---

## 2. Một dòng (`Mode=verify`)

```text
API_BRIDGE | Task=Task064 | Path=GET /api/v1/cash-transactions | Mode=verify
```

```text
API_BRIDGE | Task=Task065 | Path=POST /api/v1/cash-transactions | Mode=verify
```

```text
API_BRIDGE | Task=Task066 | Path=GET /api/v1/cash-transactions/{id} | Mode=verify
```

```text
API_BRIDGE | Task=Task067 | Path=PATCH /api/v1/cash-transactions/{id} | Mode=verify
```

```text
API_BRIDGE | Task=Task068 | Path=DELETE /api/v1/cash-transactions/{id} | Mode=verify
```

---

## 3. Verify — đủ context (copy = một phiên / một Path)

### Task064 — GET list

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task064 | Path=GET /api/v1/cash-transactions | Mode=verify
Context SRS: @backend/docs/srs/SRS_Task064-068_cash-transactions-api.md — §8.2 query; BR-11 sort; OQ-5; OQ-4 search + createdByName/performedByName.

Đọc: khối **§1 Context đầy đủ** (file prompt này) + @frontend/docs/api/API_Task064_cash_transactions_get_list.md
Grep "cash-transactions" trong @backend/smart-erp/src/main/java/com/example/smart_erp/finance
Grep cash-transactions|/api/v1/cash trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task064_cash_transactions_get_list.md
```

### Task065 — POST create

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task065 | Path=POST /api/v1/cash-transactions | Mode=verify
Context SRS: @backend/docs/srs/SRS_Task064-068_cash-transactions-api.md — OQ-2 POST chỉ Pending; BR-12/13; §8.3; 201 envelope.

Đọc: khối **§1 Context đầy đủ** + @frontend/docs/api/API_Task065_cash_transactions_post.md
Grep "cash-transactions" trong @backend/smart-erp/src/main/java/com/example/smart_erp/finance
Grep cash-transactions trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task065_cash_transactions_post.md
```

### Task066 — GET by id

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task066 | Path=GET /api/v1/cash-transactions/{id} | Mode=verify
Context SRS: @backend/docs/srs/SRS_Task064-068_cash-transactions-api.md — §6 đọc toàn bộ; BR-9 (GET không chặn người tạo); §8.8 404.

Đọc: khối **§1 Context đầy đủ** + @frontend/docs/api/API_Task066_cash_transactions_get_by_id.md
Grep "cash-transactions" trong @backend/smart-erp/src/main/java/com/example/smart_erp/finance
Grep cash-transactions trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task066_cash_transactions_get_by_id.md
```

### Task067 — PATCH

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task067 | Path=PATCH /api/v1/cash-transactions/{id} | Mode=verify
Context SRS: @backend/docs/srs/SRS_Task064-068_cash-transactions-api.md — BR-9 creator; BR-2/3 Completed + financeledger; BR-4 Cancelled; BR-10 Cancelled chỉ description; §7.3.

Đọc: khối **§1 Context đầy đủ** + @frontend/docs/api/API_Task067_cash_transactions_patch.md
Grep "cash-transactions" trong @backend/smart-erp/src/main/java/com/example/smart_erp/finance
Grep cash-transactions trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task067_cash_transactions_patch.md
```

### Task068 — DELETE

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task068 | Path=DELETE /api/v1/cash-transactions/{id} | Mode=verify
Context SRS: @backend/docs/srs/SRS_Task064-068_cash-transactions-api.md — BR-5/9; §8.7 200 + data null; 409 xóa khi Completed/ledger.

Đọc: khối **§1 Context đầy đủ** + @frontend/docs/api/API_Task068_cash_transactions_delete.md
Grep "cash-transactions" trong @backend/smart-erp/src/main/java/com/example/smart_erp/finance
Grep cash-transactions trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task068_cash_transactions_delete.md
```

---

## 4. `wire-fe` — đủ context (sau verify; một Path / phiên)

### Task064 — wire-fe (danh sách + filter + sort BR-11)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task064 | Path=GET /api/v1/cash-transactions | Mode=wire-fe
Context SRS: @backend/docs/srs/SRS_Task064-068_cash-transactions-api.md — §1.1 TransactionsPage; BR-11; OQ-4/5.

Đọc: khối **§1 Context đầy đủ** + @frontend/docs/api/API_Task064_cash_transactions_get_list.md
Thực hiện: `features/cashflow/api/*.ts` + `TransactionsPage.tsx` (TanStack Query); bỏ mock list khi đủ; không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task064_cash_transactions_get_list.md
```

### Task065 — wire-fe (tạo phiếu)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task065 | Path=POST /api/v1/cash-transactions | Mode=wire-fe
Context SRS: @backend/docs/srs/SRS_Task064-068_cash-transactions-api.md — OQ-2; BR-12; 201.

Đọc: khối **§1 Context đầy đủ** + @frontend/docs/api/API_Task065_cash_transactions_post.md
Thực hiện: cùng `cashflow/api`; invalidate query list Task064 sau tạo.

Output: @frontend/docs/api/bridge/BRIDGE_Task065_cash_transactions_post.md
```

### Task066 — wire-fe (chi tiết / prefill)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task066 | Path=GET /api/v1/cash-transactions/{id} | Mode=wire-fe
Context SRS: @backend/docs/srs/SRS_Task064-068_cash-transactions-api.md — §8; OQ-4 tên người tạo/thực hiện.

Đọc: khối **§1 Context đầy đủ** + @frontend/docs/api/API_Task066_cash_transactions_get_by_id.md
Thực hiện: gọi GET khi mở dialog/sửa; map type `CashTransaction`.

Output: @frontend/docs/api/bridge/BRIDGE_Task066_cash_transactions_get_by_id.md
```

### Task067 — wire-fe (sửa / hoàn tất / huỷ)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task067 | Path=PATCH /api/v1/cash-transactions/{id} | Mode=wire-fe
Context SRS: @backend/docs/srs/SRS_Task064-068_cash-transactions-api.md — BR-2..BR-4, BR-10; 403 người tạo.

Đọc: khối **§1 Context đầy đủ** + @frontend/docs/api/API_Task067_cash_transactions_patch.md
Thực hiện: PATCH từ form; sau Completed invalidate @frontend/docs/api/API_Task063_finance_ledger_get_list.md (sổ cái) nếu UI đang dùng Task063.

Output: @frontend/docs/api/bridge/BRIDGE_Task067_cash_transactions_patch.md
```

### Task068 — wire-fe (xóa)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task068 | Path=DELETE /api/v1/cash-transactions/{id} | Mode=wire-fe
Context SRS: @backend/docs/srs/SRS_Task064-068_cash-transactions-api.md — BR-5; §8.7; 403 người tạo.

Đọc: khối **§1 Context đầy đủ** + @frontend/docs/api/API_Task068_cash_transactions_delete.md
Thực hiện: DELETE + invalidate list/detail.

Output: @frontend/docs/api/bridge/BRIDGE_Task068_cash_transactions_delete.md
```

