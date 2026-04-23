# 📄 API SPEC: `DELETE /api/v1/customers/{id}` — Xóa khách hàng - Task052

> **Trạng thái**: Draft  
> **Feature**: UC9 — `CustomersPage` / `ConfirmDialog` (UI hiện có xóa; backend phải khớp **RESTRICT** đơn hàng)  
> **Tags**: RESTful, Customers, Delete

---

## 1. Mục tiêu Task

- Xóa cứng khách hàng **chỉ khi** không còn đơn hàng tham chiếu — theo [`Database_Specification.md`](../UC/Database_Specification.md) **§4** quan hệ tới `SalesOrders` (**RESTRICT**).

> **Ghi chú thiết kế gốc**: [`API_PROJECT_DESIGN.md`](API_PROJECT_DESIGN.md) **§4.10** trước đây chỉ liệt kê `GET/PATCH` cho `/{id}`; Task này **bổ sung** endpoint xóa để đồng bộ UI — có thể thay bằng **soft delete** (`PATCH status = Inactive`) nếu BA không muốn `DELETE`.

---

## 2. Endpoint

**`DELETE /api/v1/customers/{id}`**

---

## 3. Overview

| Thuộc tính | Giá trị |
| :--------- | :------ |
| **Endpoint** | `/api/v1/customers/{id}` |
| **Method** | `DELETE` |
| **Authentication** | `Bearer` |
| **RBAC** | Owner (khuyến nghị) |
| **Use Case Ref** | UC9 |

---

## 4. Thành công — `200 OK`

```json
{
  "success": true,
  "data": { "id": 10, "deleted": true },
  "message": "Đã xóa khách hàng"
}
```

---

## 5. Logic DB

1. **`SELECT id FROM Customers WHERE id = ? FOR UPDATE`** → **404**.
2. **`SELECT 1 FROM SalesOrders WHERE customer_id = ? LIMIT 1`** → có → **409** "Không thể xóa khách hàng đã có đơn hàng".
3. **`DELETE FROM Customers WHERE id = ?`**.

---

## 6. Lỗi

#### 409 Conflict

```json
{
  "success": false,
  "error": "CONFLICT",
  "message": "Không thể xóa khách hàng đã phát sinh đơn bán hàng"
}
```

**404** / **401** / **403** / **500**.

---

## 7. Zod (params)

```typescript
import { z } from "zod";
export const CustomerIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});
```
