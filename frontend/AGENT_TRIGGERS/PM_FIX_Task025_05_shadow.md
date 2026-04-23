# PM_RUN - Visual Harmony (Shadow & Rules)

> **Agent**: PM  
> **Workflow bắt buộc**: `PM -> TECH_LEAD -> DEV -> CODEBASE_ANALYST -> DOC_SYNC`  
> **Trạng thái**: 🔵 In Progress

---

## 1. Input
- **Standardization Design**: `BUG/Bug_Task025_05_Visual_Shadow.md`

## 2. Quy trình sửa visual

### 🔵 Bước 1 — TECH_LEAD: Phê duyệt Shadow mức MD
- [ ] Xác nhận dùng `shadow-md` cho toàn bộ container dữ liệu chính.

### 🔵 Bước 2 — DEV: Implement Shadow Fix
- [ ] Cập nhật `InboundPage.tsx`: Table wrapper -> `shadow-md`.
- [ ] Cập nhật `DispatchPage.tsx`: Table wrapper -> `shadow-md`.
- [ ] Kiểm tra lại mã nguồn: Header Đã tách riêng 100%.

### 🔵 Bước 3 — DOC_SYNC: Cập nhật quy tắc MANDATORY Standalone Header
- [ ] Cập nhật `RULES_UI_TABLE.md`.
- [ ] Cập nhật `RULES_BUG_FIX.md`.

---
**Agent PM trigger flow.**
