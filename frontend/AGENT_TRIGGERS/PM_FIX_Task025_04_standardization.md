# PM_RUN - Chuẩn hóa Table Layout (Standardization)

> **Agent**: PM  
> **Workflow bắt buộc**: `PM -> TECH_LEAD -> DEV -> CODEBASE_ANALYST -> DOC_SYNC`  
> **Trạng thái**: 🔵 In Progress

---

## 1. Input
- **Standardization Design**: `BUG/Bug_Task025_04_Standardization.md`

## 2. Quy trình sửa lỗi

### 🔵 Bước 1 — TECH_LEAD: Định nghĩa thiết kế bảng chuẩn
- [ ] Xác định các hằng số UI (colors, fonts, padding).
- [ ] Phê duyệt việc áp dụng Avatar đồng nhất cho Inbound và Dispatch.

### 🔵 Bước 2 — DEV: Implement Standardization
- [ ] Cập nhật `DispatchTable.tsx` để khớp 100% style của Inbound.
- [ ] Cập nhật `ReceiptTable.tsx` (Inbound) để thêm Avatar cho nhân viên (để 2 bảng giống nhau).
- [ ] Đảm bảo spacing và text size trùng khớp.

### 🔵 Bước 3 — CODEBASE_ANALYST: Hậu kiểm
- [ ] Mở đồng thời 2 trang để so sánh side-by-side (mental check).

### 🔵 Bước 4 — DOC_SYNC: Cập nhật quy tắc Thiết kế
- [ ] Tạo/Cập nhật `RULES_UI_TABLE.md`.

---
**Agent PM trigger flow.**
