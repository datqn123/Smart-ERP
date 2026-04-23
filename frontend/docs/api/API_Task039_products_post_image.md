# 📄 API SPEC: `POST /api/v1/products/{id}/images` — Thêm ảnh sản phẩm - Task039

> **Trạng thái**: Draft  
> **Feature**: UC8 — gallery / ảnh đại diện (mở rộng sau `Products.image_url`)  
> **Tags**: RESTful, Products, Media, Multipart

---

## 1. Mục tiêu Task

- Upload hoặc ghi nhận **URL ảnh** cho sản phẩm; hỗ trợ cờ **`isPrimary`** (đồng bộ `Products.image_url` khi primary).

---

## 2. Lưu ý schema

`Database_Specification.md` mục lục nhắc **`ProductImages`** nhưng **chưa** có mục chi tiết cột — backend cần **migration** trước khi triển khai.

### DDL đề xuất (PostgreSQL)

```sql
CREATE TABLE product_images (
  id BIGSERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX uq_product_images_one_primary
  ON product_images (product_id)
  WHERE is_primary = TRUE;
```

---

## 3. Endpoint

**`POST /api/v1/products/{id}/images`**

**Content-Type**: `multipart/form-data` **hoặc** `application/json` nếu chỉ lưu URL đã upload sẵn (S3).

---

## 4. Overview

| Thuộc tính | Giá trị |
| :--------- | :------ |
| **API Design Ref** | [`API_PROJECT_DESIGN.md`](API_PROJECT_DESIGN.md) **§4.9** |
| **Endpoint** | `/api/v1/products/{id}/images` |
| **Method** | `POST` |
| **Authentication** | `Bearer` |
| **RBAC** | Owner, Staff |
| **Use Case Ref** | UC8 |

---

## 5. JSON body (khi không multipart)

```json
{
  "url": "https://cdn.example/p/12/b.jpg",
  "sortOrder": 1,
  "isPrimary": false
}
```

- Nếu `isPrimary: true`: **`UPDATE Products SET image_url = :url`** và **`UPDATE product_images SET is_primary = false`** các ảnh khác của cùng `product_id`, rồi insert row mới `is_primary = true`.

---

## 6. Thành công — `201 Created`

```json
{
  "success": true,
  "data": {
    "id": 9,
    "productId": 12,
    "url": "https://cdn.example/p/12/b.jpg",
    "sortOrder": 1,
    "isPrimary": false
  },
  "message": "Đã thêm ảnh"
}
```

---

## 7. Logic DB (transaction)

1. Xác nhận `Products.id` tồn tại → **404**.
2. Nếu `isPrimary`: bỏ primary cũ; cập nhật `Products.image_url`.
3. **`INSERT INTO product_images`** …

---

## 8. Lỗi

- **400**: file quá lớn / MIME không cho phép / URL không hợp lệ.
- **404**: sản phẩm không tồn tại.
- **401** / **403** / **500**.

---

## 9. Zod (JSON body)

```typescript
import { z } from "zod";

export const ProductImageCreateBodySchema = z.object({
  url: z.string().url().max(500),
  sortOrder: z.number().int().min(0).optional().default(0),
  isPrimary: z.boolean().optional().default(false),
});
```
