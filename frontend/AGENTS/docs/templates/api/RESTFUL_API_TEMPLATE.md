# 📄 API SPEC: [Tên API/Tính năng] - TaskXXX

> **Trạng thái**: Draft / Approved
> **Feature**: [Tên Feature]
> **Tags**: RESTful, Token-Auth, CRUD

---

## 1. Mục tiêu Task

- **Nghiệp vụ / sản phẩm**: [Mô tả ngắn: task này phục vụ ai, UC/màn nào, kết quả kinh doanh mong muốn.]
- **Phạm vi thuộc về**: [Ví dụ: chỉ đặc tả một endpoint đọc danh sách — không bao gồm tạo phiếu nhập.]
- **Out of scope (task này)**: [Liệt kê + link `API_TaskYYY_*.md` nếu chức năng nằm ở task khác.]

---

## 2. Mục đích Endpoint

**Endpoint này dùng để:** [Một đoạn 3–6 câu: tài nguyên nào, thao tác REST nào, khi nào client gọi, sau thành công hệ thống thay đổi trạng thái gì.]

**Endpoint này KHÔNG dùng để / KHÔNG thay thế:**

- [Ví dụ: Không dùng để đăng nhập; không cập nhật số lượng tồn — dùng Task…]

---

## 3. Thông tin chung (Overview)

| Thuộc tính | Giá trị |
| :--- | :--- |
| **API Design Ref** | [`API_PROJECT_DESIGN.md`](../../../../docs/api/API_PROJECT_DESIGN.md) **§4.x** |
| **Endpoint** | `{{endpoint_url}}` |
| **Method** | `{{HTTP_METHOD}}` |
| **Authentication** | `Bearer Token (Required)` |
| **RBAC Roles** | `[Ví dụ: Admin, Owner]` |
| **Use Case Ref** | `UC-[Số]` |

---

## 4. Đặc tả Request (Request Specification)

> **Chuẩn bắt buộc** (Agent API): mỗi field trong body/query phải có kiểu, bắt buộc/tùy chọn, ràng buộc; JSON mẫu **đủ field**; mỗi mã lỗi HTTP áp dụng có ví dụ JSON đầy đủ — xem [`API_AGENT_INSTRUCTIONS.md`](../../../API_AGENT_INSTRUCTIONS.md) §4.3 và [`API_Task001_login.md`](../../../../docs/api/API_Task001_login.md).

### 4.1 Headers
```http
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### 4.2 Query Parameters (nếu có)
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `page` | Integer | No | Số trang (mặc định 1) |
| `limit` | Integer | No | Số bản ghi mỗi trang (mặc định 20) |

### 4.3 Request Body

*(GET: ghi **Không có request body** và bỏ qua JSON dưới đây.)*

```json
{
  "field_name": "value",
  "nested_object": {
    "sub_field": 123
  }
}
```

| Field | Kiểu | Bắt buộc | Ràng buộc / mô tả |
| :--- | :--- | :--- | :--- |
| `field_name` | string | Có | … |
| `nested_object.sub_field` | number | Không | … |

---

## 5. Cấu trúc phản hồi (Response Specification)

### 5.1 Thành công (Successful Response)
**Code**: `200 OK` / `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid-xxxx",
    "createdAt": "2024-04-20T10:00:00Z"
  },
  "message": "Thao tác thành công"
}
```

### 5.2 Lỗi (Error Responses)

#### 400 Bad Request (Lỗi dữ liệu)
```json
{
  "success": false,
  "error": "BAD_REQUEST",
  "message": "Dữ liệu không hợp lệ",
  "details": {
    "field": "Lỗi cụ thể của trường"
  }
}
```

#### 401 Unauthorized (Lỗi xác thực)
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Phiên đăng nhập hết hạn hoặc Token không hợp lệ"
}
```

#### 403 Forbidden (Không đủ quyền)
```json
{
  "success": false,
  "error": "FORBIDDEN",
  "message": "Bạn không có quyền thực hiện thao tác này"
}
```

#### 404 Not Found (Không tìm thấy tài nguyên)
```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Không tìm thấy tài nguyên yêu cầu"
}
```

#### 409 Conflict (Trùng / xung đột trạng thái)
```json
{
  "success": false,
  "error": "CONFLICT",
  "message": "Dữ liệu xung đột với trạng thái hiện tại (ví dụ: trùng mã, phiên bản cũ)"
}
```

#### 422 Unprocessable Entity *(chỉ dùng nếu dự án chọn mã này cho nghiệp vụ; nếu không — ghi **Không áp dụng** và bỏ mục)*
```json
{
  "success": false,
  "error": "UNPROCESSABLE_ENTITY",
  "message": "Không thể xử lý yêu cầu theo quy tắc nghiệp vụ",
  "details": {}
}
```

#### 429 Too Many Requests *(nếu có rate limit)*
```json
{
  "success": false,
  "error": "TOO_MANY_REQUESTS",
  "message": "Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "INTERNAL_SERVER_ERROR",
  "message": "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau"
}
```

*(Với mỗi endpoint: xóa các mục lỗi không áp dụng và **bổ sung** các biến thể 400/409 cụ thể nếu có nhiều lý do — mỗi biến thể một block JSON.)*

---

## 6. Logic nghiệp vụ & Database (Business Logic)

> **Bắt buộc** (Agent API §4.4): cấu trúc như [`API_Task001_login.md`](../../../../docs/api/API_Task001_login.md) §4 — **không** chỉ liệt kê tên bảng.

### 6.1 Quy trình thực thi (Step-by-Step)

1. **Xác thực & validation**: JWT / RBAC / body & query schema → **400** với `details` nếu sai định dạng.
2. **Truy vấn / cập nhật DB** (lặp cho từng bước cần thiết):
   - Ghi câu lệnh **SQL hoặc giả SQL**; **liệt kê cột**; **không** `SELECT *`.
   - Ghi điều kiện trả **401 / 403 / 404 / 409** sau từng bước khi phù hợp.
3. **Transaction** (nếu có): thứ tự `INSERT`/`UPDATE`, rollback khi lỗi; `SELECT … FOR UPDATE` nếu chống race.
4. **Phản hồi**: map cột DB → JSON `data` (camelCase).

### 6.2 Các ràng buộc (Constraints)

- **Bảng ảnh hưởng**: `[…]`
- **FK / UNIQUE / CHECK** từ `Database_Specification.md` / `schema.sql` áp dụng cho endpoint này.
- **Không trả về client**: `[cột nhạy cảm]`
- **Trigger** (nếu có): `[tên]` — hoặc ghi *Không có trigger bắt buộc*.

---

## 7. Zod Schema (Dành cho Frontend)

```typescript
const [SchemaName]Schema = z.object({
  fieldName: z.string().min(1, "Thông báo lỗi tiếng Việt"),
});
```
