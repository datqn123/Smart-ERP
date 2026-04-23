# PM_RUN - Điều phối workflow từ SRS đã duyệt

> **Agent**: PM
> **Workflow bắt buộc**: `PM → TECH_LEAD → DEV → CODEBASE_ANALYST → DOC_SYNC`
> **Trạng thái**: ✅ Done
> **Hướng dẫn đầy đủ**: `AGENTS/FLOW_GUIDE.md`

---

## ✅ XÁC NHẬN OWNER APPROVAL (THỰC HIỆN)

- [x] **Owner đã đọc và APPROVE** file SRS tại: `docs/srs/SRS_Task025_inbound-table-layout.md`
- **Ngày Owner duyệt**: 16/04/2026
- **Ghi chú của Owner**: Thực thi theo flow chuẩn.

---

---

## 1. Input

- **Source SRS (bắt buộc)**: `docs/srs/SRS_Task025_inbound-table-layout.md`
- **Task code (bắt buộc)**: `Task025`
- **Gợi ý scope code**: `mini-erp/src/features/inventory/pages/InboundPage.tsx`, `components/ReceiptTable.tsx` (mới), `components/ReceiptDetailPanel.tsx` (mới), `mockData.ts`

---

## 2. Mục tiêu

- Tách SRS thành 3 Task liên tiếp (UNIT → FEATURE → E2E).
- PM gọi lần lượt từng Agent theo đúng thứ tự.

---

## 3. Quy trình PM thực hiện (Checklist tuần tự)

### ✅ Bước 1 — PM: Tạo Task

- [x] Quét `TASKS/Task*.md` để tìm `max(TaskID)` hiện có.
- [x] Cấp 3 ID liên tiếp: UNIT, FEATURE, E2E.
- [x] Tạo 3 file Task theo đúng format.

### ✅ Bước 2 — TECH_LEAD: Review kiến trúc

- [x] Review scope — có ảnh hưởng kiến trúc không?
- [x] Tạo ADR nếu cần (thêm Shadcn Sheet component là thay đổi nhỏ, có thể không cần ADR).

### ✅ Bước 3 — DEV: Implement theo TDD

- [x] Task UNIT: Viết tests FAIL trước.
- [x] Task FEATURE: Implement ReceiptTable + ReceiptDetailPanel.
- [x] Task E2E: Playwright tests theo AC.
- [x] Coverage ≥ 80%, Build pass, Lint pass.

### ✅ Bước 4 — CODEBASE_ANALYST

- [x] 10-phase discovery cho phạm vi thay đổi.

### ✅ Bước 5 — DOC_SYNC

- [x] Drift detection + `docs/sync_reports/SYNC_REPORT_Task025.md`.

### ✅ Bước 6 — PM Đóng Task

- [x] Cập nhật SRS → Completed.
- [x] Cập nhật file này → Done.

---

## 4. Inputs & Outputs

| Mục | Giá trị |
| :--- | :--- |
| SRS path | `docs/srs/SRS_Task025_inbound-table-layout.md` |
| Task code | `Task025` |
| Scope code | `InboundPage.tsx`, `ReceiptTable.tsx` (mới), `ReceiptDetailPanel.tsx` (mới), `mockData.ts` |
| Task UNIT | `TASKS/Task025.md` |
| Task FEATURE | `TASKS/Task026.md` |
| Task E2E | `TASKS/Task027.md` |
| DOC_SYNC Report | `docs/sync_reports/SYNC_REPORT_Task025.md` |
