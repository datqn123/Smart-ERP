# 📄 API SPEC: `DELETE /api/v1/categories/{id}` — Xóa danh mục - Task033

> **Trạng thái**: Draft  
> **Feature**: UC8 — xóa một dòng / xác nhận xóa (`CategoriesPage`, `ConfirmDialog`)  
> **Tags**: RESTful, Categories, Delete

---

## 1. Mục tiêu Task

- Xóa **một** danh mục khi **an toàn nghiệp vụ**: không còn **danh mục con** và không còn **sản phẩm** gán trực tiếp (policy nghiêm hơn so với ON DELETE SET NULL trong DB — tránh “mồ côi” dữ liệu không chủ đích).

---

## 2. Endpoint

**`DELETE /api/v1/categories/{id}`** — không body.

---

## 3. Overview

| Thuộc tính | Giá trị |
| :--------- | :------ |
| **API Design Ref** | [`API_PROJECT_DESIGN.md`](API_PROJECT_DESIGN.md) **§4.9** |
| **Endpoint** | `/api/v1/categories/{id}` |
| **Method** | `DELETE` |
| **Authentication** | `Bearer` |
| **RBAC** | Owner (khuyến nghị) hoặc Staff có quyền xóa UC8 |
| **Use Case Ref** | UC8 |

---

## 4. Path parameters

| Tham số | Kiểu | Mô tả |
| :------ | :--- | :---- |
| `id` | int > 0 | `Categories.id` |

---

## 5. Thành công — `200 OK`

Chốt **`200 OK`** + envelope [`API_RESPONSE_ENVELOPE.md`](../../../frontend/docs/api/API_RESPONSE_ENVELOPE.md) (không dùng `204 No Content` để tránh lệch `ApiSuccessResponse`).

```json
{
  "success": true,
  "data": { "id": 15, "deleted": true },
  "message": "Đã xóa danh mục"
}
```

---

## 6. Logic DB (Step-by-Step)

1. **JWT** → **401** / **403**.
2. **`SELECT id FROM Categories WHERE id = ? FOR UPDATE`** — không có → **404**.
3. **`SELECT 1 FROM Categories WHERE parent_id = ? LIMIT 1`** — có → **409** ("Còn danh mục con").
4. **`SELECT 1 FROM Products WHERE category_id = ? LIMIT 1`** — có → **409** ("Còn sản phẩm thuộc danh mục").
5. **`DELETE FROM Categories WHERE id = ?`**.
6. (Tuỳ chọn) **SystemLogs**.

```sql
DELETE FROM Categories WHERE id = $1;
```

_Nếu PM muốn khớp FK DB (cho phép xóa và `Products.category_id` → NULL): bỏ bước 4 và cập nhật `Products` trước `DELETE` — phải ghi rõ trong backlog._

---

## 7. Lỗi

#### 404 Not Found

```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Không tìm thấy danh mục"
}
```

#### 409 Conflict

```json
{
  "success": false,
  "error": "CONFLICT",
  "message": "Không thể xóa: còn danh mục con hoặc còn sản phẩm gán vào danh mục này"
}
```

#### 401 / 403 / 500

Theo chuẩn dự án.

---

## 8. Ghi chú FE

Xóa nhiều ID (toolbar): có thể gọi lần lượt **DELETE** hoặc thêm Task sau **`POST /categories/bulk-delete`** nếu cần transaction một lần.
