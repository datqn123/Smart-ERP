# SRS — Đăng nhập hệ thống (Task001 / Authentication)

> **File**: `frontend/docs/srs/SRS_Task001_login-authentication.md`  
> **API**: [`../api/API_Task001_login.md`](../api/API_Task001_login.md)  
> **Envelope**: [`../api/API_RESPONSE_ENVELOPE.md`](../api/API_RESPONSE_ENVELOPE.md)  
> **Ngày cập nhật**: 23/04/2026  
> **Phiên bản**: 1.0  
> **Trạng thái**: **Approved** (đã chốt Owner 23/04/2026)

---

## 1. Tóm tắt

Đăng nhập bằng **email + mật khẩu**; validation 400 theo **từng field** (`details`). Sau count user Active = 1, kiểm tra **phiên đồng thời** (HashMap tạm, sau Redis chỉ lưu access token); **chặn** phiên thứ hai (403). Access JWT **5 phút**, refresh **30 ngày** (DB). **5 lần** sai mật khẩu → `status = Locked`. Message validate chỉ trên DTO; `GlobalExceptionHandler` chỉ đóng envelope, không map trùng message.

---

## 2. Phạm vi

| In | Out (task khác) |
| :--- | :--- |
| `POST /api/v1/auth/login`, JWT HS256 + iss/aud tuỳ cấu hình | Đăng xuất, refresh rotation |
| Concurrent session (HashMap → Redis) | MFA, OAuth |
| Brute-force 5 → Locked | CAPTCHA |

---

## 3. Quy tắc đã chốt (Owner)

1. Định danh: **email** (`Users.email`, so khớp không phân biệt hoa thường).  
2. **400**: lỗi theo field trong `details`; `message` tổng envelope chung.  
3. Mật khẩu **chỉ khoảng trắng** = thiếu (NotBlank / refine).  
4. **403**: ngay sau count Active = 1, nếu đã có session trong **ConcurrentHashMap** → 403; chưa Redis.  
5. **Không** đá phiên — **chặn**.  
6. Refresh **DB**; Redis (sau này) **chỉ** access token.  
7. JWT HS256 đủ; **iss** = issuer, **aud** = audience (giải thích trong API §4).  
8. TTL: access **5 phút**, refresh **30 ngày**.  
9. **500**: `INTERNAL_SERVER_ERROR` chung dự án.  
10. Truy vấn: **JPQL/HQL/entity** được; tối ưu theo ADR.  
11. Ưu tiên **performance** (có thể gộp bước nếu đo được).  
12. **5** lần sai mật khẩu → `Locked`.

---

## 4. Luồng server (rút gọn)

1. Bean Validation → 400 + `details`.  
2. `COUNT` / tương đương user Active theo email; 0 → 401.  
3. Có user: kiểm tra HashMap session; có → **403** (trước bcrypt).  
4. Load user + role, bcrypt; sai → tăng counter, =5 → `Locked` + 401.  
5. Đúng: phát JWT (5p, iss/aud nếu cấu hình), refresh 30d → DB, `last_login`, insert log, đăng ký session map.

---

## 5. Dữ liệu test (Flyway seed)

| Email | Username (hiển thị) | Mật khẩu dev (V2) | Ghi chú |
| :--- | :--- | :--- | :--- |
| `admin@smartinventory.vn` | `admin` | `Admin@123` | Owner seed `V1` + bcrypt `V2` |

Chi tiết bảng: `Users`, `Roles` — xem `backend/smart-erp/src/main/resources/db/migration/V1__*.sql`, `V2__task001_dev_admin_bcrypt.sql`.

---

## 6. Acceptance (rút gọn)

- 400: có `details.email` / `details.password` đúng constraint.  
- 401: email không tồn tại Active / sai pass / Locked — cùng message.  
- 403: user Active, session map đã có entry.  
- 200: envelope + `last_login` + log + session map có entry mới.

---

## 7. Handoff

- **DEV**: `LoginRequest` (`email` + messages), xóa handler validate trùng; `AuthService` + registry + brute-force; insert log đúng tên bảng PG.  
- **TESTER**: Postman + WebMvc assert `details.*`; ghi fixture email ở `AuthTask001Fixtures` (test).
