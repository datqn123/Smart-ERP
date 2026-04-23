# 📄 API SPEC: `PATCH /api/v1/categories/{id}` — Cập nhật danh mục - Task032

> **Trạng thái**: Draft  
> **Feature**: UC8 — `CategoryForm` (sửa)  
> **Tags**: RESTful, Categories, Update

---

## 1. Mục tiêu Task

- Cập nhật **một phần** hoặc toàn bộ các trường nghiệp vụ của `Categories` (trừ `id`).
- **Chặn** đặt `parentId` tạo **chu trình** trong cây (A → B → A).

---

## 2. Endpoint

**`PATCH /api/v1/categories/{id}`**

---

## 3. Overview

| Thuộc tính | Giá trị |
| :--------- | :------ |
| **API Design Ref** | [`API_PROJECT_DESIGN.md`](API_PROJECT_DESIGN.md) **§4.9** |
| **Endpoint** | `/api/v1/categories/{id}` |
| **Method** | `PATCH` |
| **Authentication** | `Bearer` |
| **RBAC** | Owner, Staff (UC8 ghi) |
| **Use Case Ref** | UC8 |

---

## 4. Path parameters

| Tham số | Kiểu | Mô tả |
| :------ | :--- | :---- |
| `id` | int > 0 | `Categories.id` |

---

## 5. Request body (partial)

Ít nhất một trường.

```json
{
  "name": "Đồ khô cao cấp",
  "categoryCode": "CAT001-01A",
  "description": "Mô tả mới",
  "parentId": 1,
  "sortOrder": 2,
  "status": "Inactive"
}
```

| Trường | Kiểu | Mô tả |
| :----- | :--- | :---- |
| `categoryCode` | string | UNIQUE |
| `name` | string | |
| `description` | string \| null | |
| `parentId` | number \| null | Không được trỏ **chính** `id`; không được trỏ vào **bất kỳ hậu duệ** của `id` (DFS/BFS từ `id`). |
| `sortOrder` | number | |
| `status` | `Active` \| `Inactive` | |

---

## 6. Thành công — `200 OK`

Trả object danh mục đầy đủ (giống Task031, có thể bỏ `breadcrumb` nếu không cần).

---

## 7. Logic DB (Step-by-Step)

1. **JWT** → **401** / **403**.
2. **`SELECT … FROM Categories WHERE id = ? FOR UPDATE`** — không có → **404**.
3. Merge patch; validate → **400**.
4. Nếu đổi `parentId`: kiểm tra FK tồn tại; kiểm tra **không** tạo cycle (tập con của `id` không được chứa `parentId` mới) → vi phạm → **409** `CATEGORY_CYCLE`.
5. **`UPDATE Categories SET …, updated_at = NOW()`** `WHERE id = ?`.
6. (Tuỳ chọn) **SystemLogs**.

```sql
UPDATE Categories
SET name = COALESCE($2, name),
    category_code = COALESCE($3, category_code),
    description = COALESCE($4, description),
    parent_id = COALESCE($5, parent_id),
    sort_order = COALESCE($6, sort_order),
    status = COALESCE($7, status),
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1;
```

---

## 8. Lỗi

- **400**: body rỗng / validation.
- **404**: không tìm thấy.
- **409**: trùng `category_code`; **chu trình** `parent_id`.
- **401** / **403** / **500**.

Ví dụ **409**:

```json
{
  "success": false,
  "error": "CONFLICT",
  "message": "Không thể đặt danh mục cha vì tạo vòng lặp phân cấp"
}
```

---

## 9. Zod (body — FE)

```typescript
import { z } from "zod";

export const CategoryPatchBodySchema = z
  .object({
    categoryCode: z.string().min(1).max(50).optional(),
    name: z.string().min(1).max(255).optional(),
    description: z.string().nullable().optional(),
    parentId: z.union([z.number().int().positive(), z.null()]).optional(),
    sortOrder: z.number().int().optional(),
    status: z.enum(["Active", "Inactive"]).optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: "Cần ít nhất một trường cập nhật" });
```
