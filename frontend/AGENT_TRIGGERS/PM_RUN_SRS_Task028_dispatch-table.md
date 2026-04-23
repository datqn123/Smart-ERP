# PM_RUN - Refactor Dispatch Table Layout

> **Agent**: PM  
> **Workflow bắt buộc**: `PM -> TECH_LEAD -> DEV -> CODEBASE_ANALYST -> DOC_SYNC`  
> **Trạng thái**: 🔵 In Progress

---

## 1. Input
- **Source SRS**: `docs/srs/SRS_Task028_dispatch-table-layout.md`
- **Task code**: `Task028`

## 2. Phân rã Task
- **Task028 (UNIT)**: Tạo `DispatchTable.tsx` và `DispatchDetailPanel.tsx`. Viết test unit.
- **Task029 (FEATURE)**: Tích hợp vào `DispatchPage.tsx`, xử lý logic Search/Filter và Infinite Scroll.
- **Task030 (E2E)**: Kiểm tra workflow từ danh sách đến xem chi tiết và cuộn sticky.

## 3. Checklist
- [ ] TECH_LEAD: Xác định cột và model dữ liệu.
- [ ] DEV: Implement components.
- [ ] CODEBASE_ANALYST: Kiểm tra alignment.
- [ ] DOC_SYNC: Cập nhật tài liệu chức năng.

---
**Agent PM trigger flow.**
