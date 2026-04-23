# PM_FIX - Sửa lỗi Sticky Header (Triệt để)

> **Agent**: PM
> **Workflow**: `TECH_LEAD → DEV → CODEBASE_ANALYST → DOC_SYNC`
> **Trạng thái**: 🔵 In Progress

---

## 1. Input
- **Deep Dive Report**: `BUG/Bug_Task025_02_StickyDeepDive.md`

## 2. Quy trình sửa lỗi

### 🔵 Bước 1 — TECH_LEAD: Kiểm tra giải pháp `sticky` trên `th`
- [ ] Xác nhận việc áp dụng `sticky` lên `TableHead` giải quyết được vấn đề wrapper của Shadcn.

### 🔵 Bước 2 — DEV: Implement
- [ ] Cập nhật `ReceiptTable.tsx` để apply `sticky` vào từng `TableHead`.
- [ ] Kiểm tra lại `InboundPage.tsx` container (đảm bảo không có padding-top làm hốc header).

### 🔵 Bước 3 — CODEBASE_ANALYST: Hậu kiểm
- [ ] Kiểm tra trên Mobile (Scroll ngang).

### 🔵 Bước 4 — DOC_SYNC: Thu hoạch kiến thức
- [ ] Cập nhật `RULES_BUG_FIX.md` với bài học: "Sticky Table Header in Shadcn requires sticky TH".

---
**Agent PM trigger flow.**
