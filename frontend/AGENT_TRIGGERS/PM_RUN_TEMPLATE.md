# PM_RUN - Điều phối workflow từ SRS đã duyệt

> **Agent**: PM
> **Workflow bắt buộc**: `PM → TECH_LEAD → DEV → CODEBASE_ANALYST → DOC_SYNC`
> **Trạng thái**: Draft | Running | Done
> **Hướng dẫn đầy đủ**: `AGENTS/FLOW_GUIDE.md`

---

## ✅ XÁC NHẬN OWNER APPROVAL (BẮT BUỘC ĐIỀN TRƯỚC)

> ⚠️ **QUAN TRỌNG**: File này CHỈ được kích hoạt sau khi Owner đã duyệt SRS.
> Nếu chưa có dấu [x] ở dòng dưới, Agent PM KHÔNG ĐƯỢC bắt đầu.

- [ ] **Owner đã đọc và APPROVE** file SRS tại: `docs/srs/SRS_TaskXXX_<slug>.md`
- **Ngày Owner duyệt**: `<DD/MM/YYYY>`
- **Ghi chú của Owner** (nếu có): `<ghi chú hoặc để trống>`

---

## 1. Input

- **Source SRS (bắt buộc)**: `docs/srs/SRS_TaskXXX_<slug>.md`
- **Task code (bắt buộc)**: `TaskXXX`
- **Gợi ý scope code**: `<folder/feature hoặc file liên quan>`

---

## 2. Mục tiêu

- Tách SRS thành 3 Task liên tiếp (UNIT → FEATURE → E2E).
- PM gọi lần lượt từng Agent theo đúng thứ tự, chờ Agent trước hoàn thành rồi mới gọi tiếp.

---

## 3. Quy trình PM thực hiện (Checklist tuần tự)

> PM phải hoàn thành từng bước theo thứ tự. Không được nhảy bước.

---

### 🔵 Bước 1 — PM: Tạo Task

PM tự thực hiện trước khi gọi bất kỳ Agent nào:

- [ ] Đọc kỹ `docs/srs/SRS_TaskXXX_<slug>.md`.
- [ ] Quét `TASKS/Task*.md` để tìm `max(TaskID)` hiện có.
- [ ] Cấp 3 ID liên tiếp:
  - [ ] **UNIT** = `Task<max+1>`
  - [ ] **FEATURE** = `Task<max+2>`
  - [ ] **E2E** = `Task<max+3>`
- [ ] Tạo 3 file Task theo đúng format trong `AGENTS/PM_AGENT_INSTRUCTIONS.md` (bao gồm **⚠️ Component Breakdown MANDATORY**).
- [ ] Ghi rõ `Depends on` đúng chuỗi (FEATURE depends on UNIT, E2E depends on FEATURE).

**Lệnh PM tự gọi:**
```
# PM tự thực hiện — không cần lệnh ngoài
```

**Sau khi xong bước 1:**
- [ ] 3 file Task đã tồn tại trong `TASKS/`
- [ ] Ghi vào mục 4 (Inputs cụ thể) danh sách Task ID vừa tạo

---

### 🔵 Bước 2 — TECH_LEAD: Review kiến trúc & Viết ADR

**⏳ Chờ**: Bước 1 (PM Tạo Task) hoàn thành.

**Lệnh PM gọi TECH_LEAD:**
```
Agent TECH_LEAD, review scope thay đổi Task<UNIT>, Task<FEATURE>, Task<E2E>.
Nguồn SRS: docs/srs/SRS_TaskXXX_<slug>.md
Nếu có ảnh hưởng kiến trúc/contract, viết ADR theo docs/adr/ADR_TEMPLATE.md.
Trả lại kết quả: ADR path (nếu có) + Guardrail checklist.
```

- [ ] TECH_LEAD đã review thay đổi.
- [ ] **Nếu cần ADR**: Tạo `docs/adr/ADR-XXXX_<slug>.md` với 5 NFR đầy đủ.
- [ ] TECH_LEAD xuất Guardrail Checklist cho DEV.

**ADR path** (nếu có): `<điền hoặc N/A>`

---

### 🔵 Bước 3 — DEV: Implement theo TDD

**⏳ Chờ**: Bước 2 (TECH_LEAD) hoàn thành. Nếu cần ADR mà chưa có → KHÔNG GỌI DEV.

**Lệnh PM gọi DEV:**
```
Agent DEV, thực hiện chuỗi Task theo TDD:
  1. Task<UNIT>   — [UNIT] Viết unit tests FAIL trước (Red)
  2. Task<FEATURE>— [FEATURE] Implement cho đến khi tests PASS (Green)
  3. Task<E2E>    — [E2E] Playwright tests theo Acceptance Criteria

Guardrail checklist của TECH_LEAD: <paste hoặc reference path>
Coverage gate: ≥ 80%. Build phải pass trước khi báo hoàn thành.
```

- [ ] Task UNIT: Unit tests đã viết và FAIL (Red) ✅
- [ ] Task FEATURE: Implementation pass unit tests (Green) ✅
- [ ] Task E2E: Playwright tests theo Acceptance Criteria ✅
- [ ] `npm test --coverage` → Coverage ≥ 80% ✅
- [ ] `npm run build` → Pass ✅
- [ ] `npm run lint` → Pass ✅

---

### 🔵 Bước 4 — CODEBASE_ANALYST: Brownfield Discovery

**⏳ Chờ**: Bước 3 (DEV) hoàn thành + Build pass.

**Lệnh PM gọi CODEBASE_ANALYST:**
```
Agent CODEBASE_ANALYST, chạy 10-phase Brownfield Discovery cho phạm vi thay đổi TaskXXX.
Scope: Task<UNIT>, Task<FEATURE>, Task<E2E>.
Xuất report: module map, business logic, brittle zones, coverage gaps, risk register.
```

- [ ] 10-phase discovery hoàn thành.
- [ ] Xác định brittle zones và risks chính.

**Kết quả CODEBASE_ANALYST**: `<tóm tắt ngắn hoặc link report>`

---

### 🔵 Bước 5 — DOC_SYNC: Drift Detection

**⏳ Chờ**: Bước 4 (CODEBASE_ANALYST) hoàn thành.

**Lệnh PM gọi DOC_SYNC:**
```
Agent DOC_SYNC, kiểm tra drift giữa docs và code cho phạm vi TaskXXX.
Lưu báo cáo bắt buộc tại: docs/sync_reports/SYNC_REPORT_TaskXXX.md
Phân loại severity: High / Medium / Low.
```

- [ ] Drift detection hoàn thành.
- [ ] Báo cáo đã lưu: `docs/sync_reports/SYNC_REPORT_TaskXXX.md` ✅

---

### 🔵 Bước 6 — PM: Đóng Task (Kết thúc)

**⏳ Chờ**: Tất cả bước 1–5 hoàn thành.

- [ ] Cập nhật `docs/srs/SRS_TaskXXX_<slug>.md` → Dòng Trạng thái: `✅ Completed`
- [ ] Cập nhật file PM_RUN này → Trạng thái (đầu file): `✅ Done`
- [ ] Thông báo cho Owner: *"TaskXXX hoàn thành. Tóm tắt: [summary ngắn]"*

---

## 4. Inputs & Outputs cụ thể cho lần chạy này

| Mục | Giá trị |
| :--- | :--- |
| SRS path | `<điền vào đây>` |
| Task code | `TaskXXX` |
| Scope code | `<gợi ý folder/feature>` |
| Task UNIT | `Task<N>` — *(điền sau khi tạo)* |
| Task FEATURE | `Task<N+1>` — *(điền sau khi tạo)* |
| Task E2E | `Task<N+2>` — *(điền sau khi tạo)* |
| ADR (nếu có) | `docs/adr/ADR-XXXX_<slug>.md` hoặc `N/A` |
| DOC_SYNC Report | `docs/sync_reports/SYNC_REPORT_TaskXXX.md` |
