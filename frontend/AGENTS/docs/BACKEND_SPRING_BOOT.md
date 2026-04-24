# Đồng bộ Backend Spring Boot với tài liệu hiện có

> **Mục đích**: Một nguồn chân lý cho nhánh backend (sau này) và cho Agent API_SPEC / DEV — tránh lệch contract với FE.

## 1. Nguồn chân lý (đọc theo thứ tự)

1. **Hợp đồng API (REST)**: [`docs/api/API_PROJECT_DESIGN.md`](../../docs/api/API_PROJECT_DESIGN.md) — prefix `/api/v1`, nhóm endpoint; **envelope & lỗi**: [`docs/api/API_RESPONSE_ENVELOPE.md`](../../docs/api/API_RESPONSE_ENVELOPE.md) (bắt buộc đồng bộ với `ApiSuccessResponse` / `ApiErrorResponse` / `GlobalExceptionHandler` trong `smart-erp`).
2. **Chi tiết từng endpoint**: `docs/api/API_TaskXXX_<slug>.md` — request/response, logic DB, Zod tham chiếu FE.
3. **Schema & nghiệp vụ**: [`docs/UC/schema.sql`](../../docs/UC/schema.sql), `Database_Specification*.md`, `Entity_Relationships.md`.
4. **Template khi viết spec mới**: [`templates/api/RESTFUL_API_TEMPLATE.md`](templates/api/RESTFUL_API_TEMPLATE.md) (output file vẫn lưu dưới `docs/api/`).
5. **Auth bổ sung**: [`API_Task003_auth_refresh.md`](../../docs/api/API_Task003_auth_refresh.md), [`API_Task004_staff_owner_password_reset.md`](../../docs/api/API_Task004_staff_owner_password_reset.md) (Staff → Owner → email; bảng `staff_password_reset_requests` trong spec Task004).
6. **Tồn kho (UC6 / màn Stock)** — REST 005–010: [`API_Task005_inventory_get_list.md`](../../docs/api/API_Task005_inventory_get_list.md) … [`API_Task010_inventory_post_adjustments.md`](../../docs/api/API_Task010_inventory_post_adjustments.md); **hậu kiểm & Owner**: [`API_Task011_inventory_mutation_audit_logs.md`](../../docs/api/API_Task011_inventory_mutation_audit_logs.md), [`API_Task012_inventory_staff_change_notify_owner.md`](../../docs/api/API_Task012_inventory_staff_change_notify_owner.md). `GET /inventory/logs` — spec khi có màn tra cứu (catalog §4.7).

## 2. Quy ước gợi ý cho Spring Boot

- **Base path**: `/api/v1` (khớp master design).
- **JSON**: camelCase request/response (khớp `Entity_Relationships` / spec API).
- **Auth**: JWT Bearer như mô tả các file `API_Task001`–`003` và §4.1 master.
- **Entity**: map 1–1 với bảng PostgreSQL trong `schema.sql` (đặt tên class Java theo convention dự án; cột map snake_case ↔ camelCase rõ ràng).

## 3. Vai trò Agent sau khi có repo backend

- **API_SPEC**: tiếp tục sở hữu `docs/api/*.md` + cập nhật `API_PROJECT_DESIGN.md` catalog khi thêm nhóm endpoint.
- **Planner / BA**: không đổi đường output BA/SRS (`docs/ba/`, `docs/srs/`).
- **DEV (Java)**: khi thêm repo Spring Boot, bổ sung một hàng trong [`CONTEXT_INDEX.md`](CONTEXT_INDEX.md) trỏ tới module backend + file README backend.

## 4. Kiểm tra không lệch (checklist ngắn)

- [ ] Endpoint + method khớp §4 `API_PROJECT_DESIGN.md`.
- [ ] Status code và shape lỗi khớp template RESTful.
- [ ] Trường DB khớp `schema.sql` (kiểu, NOT NULL, FK).
