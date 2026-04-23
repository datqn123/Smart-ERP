# PM_FIX - Triển khai Standalone Table Header

> **Agent**: PM
> **Workflow**: `TECH_LEAD → DEV → CODEBASE_ANALYST → DOC_SYNC`
> **Trạng thái**: 🔵 In Progress

---

## 1. Input
- **Design Proposal**: `BUG/Bug_Task025_03_StandaloneHeader.md`

## 2. Quy trình sửa lỗi

### 🔵 Bước 1 — TECH_LEAD: Định nghĩa cột (Column Definition)
- [ ] Trích xuất các class width cột thành hằng số hoặc đảm bảo tính đồng nhất giữa 2 file.

### 🔵 Bước 2 — DEV: Implement Standalone Header
- [ ] Sửa `ReceiptTable.tsx` để xóa `TableHeader`.
- [ ] Cập nhật `InboundPage.tsx` để render thanh Header ngay phía trên khung cuộn.
- [ ] Đảm bảo border và rounded-corners được xử lý tinh tế để 2 phần trông như 1 bảng duy nhất.

### 🔵 Bước 3 — CODEBASE_ANALYST: Hậu kiểm
- [ ] Kiểm tra độ thẳng hàng của cột trên các màn hình.

### 🔵 Bước 4 — DOC_SYNC: Cập nhật quy tắc
- [ ] Ghi lại quy trình "Tách Header khi Sticky thất bại" vào cẩm nang.

---
**Agent PM trigger flow.**
