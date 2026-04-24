# backend/docs/srs — SRS cho Spring Boot (`smart-erp`)

Thư mục này chứa **SRS gắn triển khai backend** (API auth, persistence, v.v.). SRS tập trung vào **UI Mini-ERP** vẫn nằm tại [`../../../frontend/docs/srs/README.md`](../../../frontend/docs/srs/README.md).

## Quy ước

- Đặt tên: `SRS_TaskXXX_<slug>.md` — thường đồng bộ `API_TaskXXX` ở `frontend/docs/api/`; **task ≥ 100** dùng cho nghiệp vụ **không có endpoint riêng** (chỉ SRS backend).
- Template tham chiếu (nếu cần đầy đủ UI/UX): [`../../../frontend/docs/srs/SRS_TEMPLATE.md`](../../../frontend/docs/srs/SRS_TEMPLATE.md).

## File hiện có

| File | Mô tả |
| :--- | :--- |
| [`SRS_Task001_login-authentication.md`](SRS_Task001_login-authentication.md) | Đăng nhập / JWT / refresh DB |
| [`SRS_Task002_logout.md`](SRS_Task002_logout.md) | Đăng xuất / soft revoke `delete_ymd` — artifact agent: [`../task002/README.md`](../task002/README.md) |
| [`SRS_Task003_auth_refresh.md`](SRS_Task003_auth_refresh.md) | `POST /auth/refresh` — **Approved**; access mới + session map; artifact: [`../task003/README.md`](../task003/README.md) |
| [`SRS_Task100_auth-session-registry-stale-access.md`](SRS_Task100_auth-session-registry-stale-access.md) | HashMap phiên đơn: access hết hạn + không refresh → không chặn login oan — workflow: [`../task100/README.md`](../task100/README.md) |
