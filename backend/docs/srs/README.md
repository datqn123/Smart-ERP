# backend/docs/srs — SRS cho Spring Boot (`smart-erp`)

Tài liệu **SRS gắn triển khai backend** (API `smart-erp`, persistence, mail, transaction, …) phải nằm dưới **`backend/docs/`** — thư mục con **`srs/`** (file tổng hợp) hoặc **`taskNNN/00-ba/`** (theo workflow từng task). **Không** đặt SRS loại này trong `frontend/docs/srs/`.

**Hợp đồng API** (OpenAPI-style markdown) có thể vẫn ở [`../../../frontend/docs/api/`](../../../frontend/docs/api/) để FE / **API_BRIDGE** đọc — SRS backend mô tả *cách triển khai* và AC server-side, traceability link ngược về file API đó.

**SRS chỉ UI Mini-ERP** (bảng, layout, không phải luồng auth server) — [`../../../frontend/docs/srs/README.md`](../../../frontend/docs/srs/README.md).

## Quy ước

- Đặt tên: `SRS_TaskXXX_<slug>.md` trong **`backend/docs/srs/`** (hoặc `backend/docs/taskXXX/00-ba/` nếu team tách theo task).
- `BA_SQL | Task=… | Doc=API_…` → file SRS output: **`backend/docs/srs/SRS_TaskNNN_<slug-kebab>.md`** — xem [`../../AGENTS/BA_AGENT_INSTRUCTIONS.md`](../../AGENTS/BA_AGENT_INSTRUCTIONS.md) mục 8.
- **Template SRS backend / API (mặc định):** [`SRS_TEMPLATE.md`](SRS_TEMPLATE.md) — bóc tách nghiệp vụ, OQ cho PO, scope tệp, actor + mermaid, JSON request/response đầy đủ, SQL.
- Template **UI Mini-ERP** (bảng, breakpoint, component): [`../../../frontend/docs/srs/SRS_TEMPLATE.md`](../../../frontend/docs/srs/SRS_TEMPLATE.md) — dùng khi task chủ yếu là FE hoặc phụ lục UI.

## File trong `backend/docs/srs/`

| File | Mô tả |
| :--- | :--- |
| [`SRS_Task003_auth_refresh.md`](SRS_Task003_auth_refresh.md) | `POST /auth/refresh` — artifact: [`../task003/README.md`](../task003/README.md) |
| [`SRS_Task004_staff-owner-password-reset.md`](SRS_Task004_staff-owner-password-reset.md) | Staff → Owner → email (Task004); API: [`../../../frontend/docs/api/API_Task004_staff_owner_password_reset.md`](../../../frontend/docs/api/API_Task004_staff_owner_password_reset.md) |
| [`SRS_Task078_users-post.md`](SRS_Task078_users-post.md) | `POST /api/v1/users` — tạo nhân viên; API: [`../../../frontend/docs/api/API_Task078_users_post.md`](../../../frontend/docs/api/API_Task078_users_post.md) |
| [`SRS_Task100_auth-session-registry-stale-access.md`](SRS_Task100_auth-session-registry-stale-access.md) | Session map — [`../task100/README.md`](../task100/README.md) |
| [`SRS_Task101_role-based-side-menu-visibility.md`](SRS_Task101_role-based-side-menu-visibility.md) | Side menu theo `Roles.permissions` (Task101); chưa có `Doc` API riêng — tham chiếu code + Flyway V1 |
| [`SRS_Task101_1_api-permission-per-request.md`](SRS_Task101_1_api-permission-per-request.md) | Task101_1 — kiểm tra quyền từng request API; phụ bản từ [SRS_Task101](SRS_Task101_role-based-side-menu-visibility.md) mục 7.1 |
| [`SRS_Task005_inventory-get-list.md`](SRS_Task005_inventory-get-list.md) | `GET /api/v1/inventory` — danh sách + KPI; API: [`../../../frontend/docs/api/API_Task005_inventory_get_list.md`](../../../frontend/docs/api/API_Task005_inventory_get_list.md) |
| [`SRS_Task006_inventory-get-by-id.md`](SRS_Task006_inventory-get-by-id.md) | `GET /api/v1/inventory/{id}` — **Approved** 25/04/2026; API: [`../../../frontend/docs/api/API_Task006_inventory_get_by_id.md`](../../../frontend/docs/api/API_Task006_inventory_get_by_id.md) |
| [`SRS_Task007_inventory-patch.md`](SRS_Task007_inventory-patch.md) | `PATCH /api/v1/inventory/{id}` — **Draft**; API: [`../../../frontend/docs/api/API_Task007_inventory_patch.md`](../../../frontend/docs/api/API_Task007_inventory_patch.md) |
| [`SRS_Task008_inventory-bulk-patch.md`](SRS_Task008_inventory-bulk-patch.md) | `PATCH /api/v1/inventory/bulk` — **Draft**; API: [`../../../frontend/docs/api/API_Task008_inventory_bulk_patch.md`](../../../frontend/docs/api/API_Task008_inventory_bulk_patch.md) |
| [`SRS_Task009_inventory-get-summary.md`](SRS_Task009_inventory-get-summary.md) | `GET /api/v1/inventory/summary` — **Draft** (đã triển khai BE); API: [`../../../frontend/docs/api/API_Task009_inventory_get_summary.md`](../../../frontend/docs/api/API_Task009_inventory_get_summary.md) |
| [`SRS_Task013_stock-receipts-get-list.md`](SRS_Task013_stock-receipts-get-list.md) | `GET /api/v1/stock-receipts` — **Draft**; API: [`../../../frontend/docs/api/API_Task013_stock_receipts_get_list.md`](../../../frontend/docs/api/API_Task013_stock_receipts_get_list.md) |
| [`SRS_Task014-020_stock-receipts-lifecycle.md`](SRS_Task014-020_stock-receipts-lifecycle.md) | **Gộp** Task014–020 — tạo/sửa/xóa/submit/approve/reject phiếu nhập; API: `API_Task014` … `API_Task020` trong [`../../../frontend/docs/api/`](../../../frontend/docs/api/) |
| [`SRS_Task021-028_inventory-audit-sessions.md`](SRS_Task021-028_inventory-audit-sessions.md) | **Gộp** Task021–028 — đợt kiểm kê kho (list/create/detail/patch/lines/complete/cancel/apply-variance); API: `API_Task021` … `API_Task028` trong [`../../../frontend/docs/api/`](../../../frontend/docs/api/) |
| [`SRS_Task029-033_categories-management.md`](SRS_Task029-033_categories-management.md) | **Gộp** Task029–033 — danh mục sản phẩm (list tree/flat, CRUD, soft-delete); **Draft** (đồng bộ Flyway **V14** trong SRS 26/04/2026); API: [`../../../frontend/docs/api/API_Task029_categories_get_list.md`](../../../frontend/docs/api/API_Task029_categories_get_list.md) … `API_Task033` |
| [`SRS_Task034-041_products-management.md`](SRS_Task034-041_products-management.md) | **Gộp** Task034–041 — sản phẩm: list, CRUD, ảnh **JSON URL + multipart Cloudinary** (tuỳ cấu hình), Flyway V15, xóa/bulk-delete; **Approved** (OQ PO + đồng bộ codebase 27/04/2026); **PM handoff:** [`../task034-041/01-pm/README.md`](../task034-041/01-pm/README.md); API: `API_Task034` … `API_Task039`, `API_Task041` |
| [`SRS_Task042-047_suppliers-management.md`](SRS_Task042-047_suppliers-management.md) | **Gộp** Task042–047 — NCC: list (`receiptCount`), CRUD, xóa/bulk-delete, **`lastReceiptAt` chi tiết (OQ-4(b))**, Owner-only xóa; **Draft** (OQ §4 chốt 27/04/2026 — chờ §13); Flyway V1; API: `API_Task042` … `API_Task047` |

## File liên quan dưới `backend/docs/taskNNN/`

| Task | SRS (đường dẫn) |
| :--- | :--- |
| Task002 | [`../task002/00-ba/SRS_Task002_logout.md`](../task002/00-ba/SRS_Task002_logout.md) |

**Ghi chú:** `SRS_Task001_login-authentication.md` được nhiều file tham chiếu — **dự kiến** tạo tại `backend/docs/srs/` khi bổ sung (hiện chưa có trong repo).
