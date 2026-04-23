# PM_RUN - Điều phối workflow từ SRS đã duyệt

> **Agent**: PM  
> **Workflow bắt buộc**: `PM -> TECH_LEAD -> DEV -> CODEBASE_ANALYST -> DOC_SYNC`  
> **Trạng thái**: Completed

## 1. Input

- **Source SRS (bắt buộc)**: `docs/srs/SRS_Task017_stock-interface-functional-implementation.md`
- **Task code (bắt buộc)**: `Task017`

## 2. Mục tiêu

- Tách SRS thành 3 task liên tiếp (UNIT → FEATURE → E2E).
- Điều phối TECH_LEAD/DEV/CODEBASE_ANALYST/DOC_SYNC theo đúng thứ tự.

## 3. Quy trình PM phải thực hiện (Checklist)

### 3.1 PM: Tạo task

- [x] Quét `TASKS/Task*.md` để tìm `max(TaskID)` hiện có.
- [x] Cấp 3 ID liên tiếp:
  - [x] UNIT = `Task019`
  - [x] FEATURE = `Task020`
  - [x] E2E = `Task021`
- [x] Tạo 3 file task theo `AGENTS/PM_AGENT_INSTRUCTIONS.md` (đúng format + Component Breakdown).

### 3.2 TECH_LEAD: ADR + guardrails (nếu cần)

- [x] Nếu thay đổi ảnh hưởng kiến trúc/contract/dependency:
  - [x] Tạo ADR tại `docs/adr/ADR-XXXX_<slug>.md` theo `docs/adr/ADR_TEMPLATE.md`
  - [x] Điền NFR bắt buộc (Performance/Scalability/Security/Reliability/Observability) **không để trống**

### 3.3 DEV: Implement theo TDD + coverage gate

- [x] DEV thực hiện theo chuỗi task (UNIT → FEATURE → E2E) với TDD nghiêm ngặt.
- [x] Coverage gate ≥ 80% trước khi “ready for review”.
- [x] Sau khi tests pass: chạy perf scan tối thiểu (build + runtime sanity).
- [x] Quick fix rẻ: làm ngay; refactor nhiều file: ghi tech debt trong PR.

### 3.4 CODEBASE_ANALYST: Brownfield discovery 10 phase

- [x] Chạy phân tích 10 phase cho phạm vi thay đổi (tối thiểu các file trong 3 task).
- [x] Xuất report: module map, business logic extraction, brittle zones, coverage gaps, risks.

### 3.5 DOC_SYNC: Drift detection

- [x] Kiểm drift docs vs code cho phạm vi thay đổi.
- [x] Báo cáo cảnh báo (High/Med/Low) + đề xuất cập nhật docs.

## 4. Inputs cụ thể cho lần chạy này

- **SRS path**: `<điền vào đây>`
- **Task code**: `TaskXXX`
- **Gợi ý scope code**: `<folder/feature>`
