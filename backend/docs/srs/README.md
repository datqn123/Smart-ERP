# backend/docs/srs — SRS cho Spring Boot (`smart-erp`)

Tài liệu **SRS gắn triển khai backend** (API `smart-erp`, persistence, mail, transaction, …) phải nằm dưới **`backend/docs/`** — thư mục con **`srs/`** (file tổng hợp) hoặc **`taskNNN/00-ba/`** (theo workflow từng task). **Không** đặt SRS loại này trong `frontend/docs/srs/`.

**Hợp đồng API** (OpenAPI-style markdown) có thể vẫn ở [`../../../frontend/docs/api/`](../../../frontend/docs/api/) để FE / **API_BRIDGE** đọc — SRS backend mô tả *cách triển khai* và AC server-side, traceability link ngược về file API đó.

**SRS chỉ UI Mini-ERP** (bảng, layout, không phải luồng auth server) — [`../../../frontend/docs/srs/README.md`](../../../frontend/docs/srs/README.md).

## Quy ước

- Đặt tên: `SRS_TaskXXX_<slug>.md` trong **`backend/docs/srs/`** (hoặc `backend/docs/taskXXX/00-ba/` nếu team tách theo task).
- `BA_SQL | Task=… | Doc=API_…` → file SRS output: **`backend/docs/srs/SRS_TaskNNN_<slug-kebab>.md`** — xem [`../../AGENTS/BA_AGENT_INSTRUCTIONS.md`](../../AGENTS/BA_AGENT_INSTRUCTIONS.md) mục 6.
- Template đầy đủ UI/UX (nếu cần): [`../../../frontend/docs/srs/SRS_TEMPLATE.md`](../../../frontend/docs/srs/SRS_TEMPLATE.md).

## File trong `backend/docs/srs/`

| File | Mô tả |
| :--- | :--- |
| [`SRS_Task003_auth_refresh.md`](SRS_Task003_auth_refresh.md) | `POST /auth/refresh` — artifact: [`../task003/README.md`](../task003/README.md) |
| [`SRS_Task004_staff-owner-password-reset.md`](SRS_Task004_staff-owner-password-reset.md) | Staff → Owner → email (Task004); API: [`../../../frontend/docs/api/API_Task004_staff_owner_password_reset.md`](../../../frontend/docs/api/API_Task004_staff_owner_password_reset.md) |
| [`SRS_Task078_users-post.md`](SRS_Task078_users-post.md) | `POST /api/v1/users` — tạo nhân viên; API: [`../../../frontend/docs/api/API_Task078_users_post.md`](../../../frontend/docs/api/API_Task078_users_post.md) |
| [`SRS_Task100_auth-session-registry-stale-access.md`](SRS_Task100_auth-session-registry-stale-access.md) | Session map — [`../task100/README.md`](../task100/README.md) |
| [`SRS_Task101_role-based-side-menu-visibility.md`](SRS_Task101_role-based-side-menu-visibility.md) | Side menu theo `Roles.permissions` (Task101); chưa có `Doc` API riêng — tham chiếu code + Flyway V1 |

## File liên quan dưới `backend/docs/taskNNN/`

| Task | SRS (đường dẫn) |
| :--- | :--- |
| Task002 | [`../task002/00-ba/SRS_Task002_logout.md`](../task002/00-ba/SRS_Task002_logout.md) |

**Ghi chú:** `SRS_Task001_login-authentication.md` được nhiều file tham chiếu — **dự kiến** tạo tại `backend/docs/srs/` khi bổ sung (hiện chưa có trong repo).
