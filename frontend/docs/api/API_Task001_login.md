# 📄 API SPEC: Đăng nhập hệ thống - Task001

> **Trạng thái**: Approved  
> **Feature**: Authentication  
> **Tags**: RESTful, Auth, Login

**Khung thiết kế dự án**: [`API_PROJECT_DESIGN.md`](API_PROJECT_DESIGN.md) §2–§3 (envelope, mã lỗi), §4.1 (Auth — `POST /auth/login`).

---

## 1. Thông tin chung (Overview)

| Thuộc tính           | Giá trị                                      |
| :------------------- | :------------------------------------------- |
| **API Design Ref**   | [`API_PROJECT_DESIGN.md`](API_PROJECT_DESIGN.md) **§4.1** |
| **Endpoint**         | `/api/v1/auth/login`                         |
| **Method**           | `POST`                                       |
| **Authentication**   | `None` (public)                              |
| **RBAC Roles**       | `All Roles (Owner, Staff, Admin)`            |
| **Use Case Ref**     | Phiên đăng nhập hệ thống (tiền điều kiện UC1–UC13) |

---

## 2. Đặc tả Request (Request Specification)

### 2.1 Headers

```http
Content-Type: application/json
```

### 2.2 Query Parameters

_Không có_

### 2.3 Request Body

```json
{
  "username": "admin",
  "password": "your_password_here"
}
```

---

## 3. Cấu trúc phản hồi (Response Specification)

### 3.1 Thành công (Successful Response)

**Code**: `200 OK`

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5...",
    "refreshToken": "def72b38...",
    "user": {
      "id": 1,
      "username": "admin",
      "fullName": "System Administrator",
      "email": "admin@smartinventory.vn",
      "role": "Owner"
    }
  },
  "message": "Đăng nhập thành công"
}
```

### 3.2 Lỗi (Error Responses)

#### 400 Bad Request (Thiếu thông tin)

```json
{
  "success": false,
  "error": "BAD_REQUEST",
  "message": "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu"
}
```

#### 401 Unauthorized (Sai thông tin hoặc tài khoản bị khóa)

```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Tên đăng nhập hoặc mật khẩu không chính xác hoặc tài khoản bị khóa"
}
```

#### 403 Forbidden (Đã đăng nhập nơi khác)

```json
{
  "success": false,
  "error": "FORBIDDEN",
  "message": "Tài khoản đang được đăng nhập ở một thiết bị khác. Vui lòng đăng xuất ở thiết bị đó hoặc liên hệ Admin."
}
```

_(Chi tiết nghiệp vụ lỗi có thể dùng mã nội bộ `ALREADY_LOGGED_IN` trong log; response công khai dùng `error: FORBIDDEN` cho thống nhất với [`RESTFUL_API_TEMPLATE.md`](../../AGENTS/docs/templates/api/RESTFUL_API_TEMPLATE.md).)_

#### 500 Internal Server Error

```json
{
  "success": false,
  "error": "INTERNAL_ERROR",
  "message": "Hệ thống đang gặp sự cố. Vui lòng thử lại sau."
}
```

---

## 4. Logic nghiệp vụ & Database (Business Logic)

### 4.1 Quy trình thực thi (Step-by-Step)

1.  **Nhận & Kiểm tra input**:
    - Nhận `username` và `password` từ request body.
    - Sử dụng **LoginSchema** để xác thực định dạng dữ liệu (không được trống, độ dài tối thiểu).
2.  **Truy vấn kiểm tra (Count Check)**:
    - Thực hiện: `SELECT COUNT(id) FROM Users WHERE username = ? AND status = 'Active';`
    - Nếu kết quả `= 0`: Trả về lỗi 401 (Sai thông tin hoặc tài khoản bị khóa).
3.  **Lấy dữ liệu xác thực**:
    - Thực hiện query chỉ các cột cần thiết: `Users.id`, `Users.username`, `Users.password_hash`, `Users.full_name`, `Users.email`, `Users.role_id`, `Roles.name AS role_name` (JOIN `Roles` trên `Users.role_id = Roles.id`).
    - **Không** dùng `SELECT *`.
4.  **Kiểm tra mật khẩu**:
    - Sử dụng thư viện `bcrypt` hoặc `argon2` để so sánh `password` (plaintext) với `password_hash`.
    - Nếu không khớp: Trả về lỗi 401.
5.  **Kiểm tra phiên đăng nhập (Concurrent Session Management)**:
    - Truy cập **State Management (Redis/HashMap)**: `GET current_session:user:{id}`.
    - **Logic**: Nếu Key đã tồn tại (nghĩa là user đang đăng nhập ở nơi khác):
      - Hệ thống sẽ trả về lỗi **403 Forbidden - ALREADY_LOGGED_IN**.
      - (Tùy chọn: Có thể cấu hình cơ chế "Đá phiên cũ" bằng cách xóa Key cũ và ghi đè Key mới).
6.  **Cấp phát Token**:
    - Tạo **Access Token**: JWT chứa `sub: user_id`, `name: username`, `role: role_name`, `exp: 15 minutes`.
    - Tạo **Refresh Token**: Chuỗi ngẫu nhiên (UUID v4) có thời hạn 7 ngày.
    - Lưu Refresh Token vào Database hoặc Redis để phục vụ cơ chế thu hồi (Revoke).
7.  **Ghi nhật ký & Cập nhật**:
    - Thực hiện: `UPDATE Users SET last_login = CURRENT_TIMESTAMP WHERE id = ?;`
    - Ghi Log: `INSERT INTO SystemLogs (log_level, module, action, user_id, message) VALUES ('INFO', 'AUTH', 'LOGIN', ?, 'Người dùng đăng nhập thành công');`
    - Lưu Session mới vào State Management: `SET current_session:user:{id} = { session_id, created_at }`.
8.  **Phản hồi**: Trả về `accessToken`, `refreshToken` và thông tin User cơ bản.

### 4.2 Các ràng buộc (Constraints)

- Không bao giờ trả về trường `password_hash` trong Response.
- Chỉ các User có `status = 'Active'` mới được phép đi qua bước 2.
- Token phải được ký bằng `JWT_SECRET` lưu tại biến môi trường (.env).

---

## 5. Zod Schema (Dành cho Frontend)

```typescript
import { z } from "zod";

const LoginSchema = z.object({
  username: z.string().min(1, "Tên đăng nhập là bắt buộc"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});
```
