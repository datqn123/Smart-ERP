# 📄 API SPEC: `DELETE /api/v1/suppliers/{id}` — Xóa nhà cung cấp - Task046

> **Trạng thái**: Draft  
> **Feature**: UC8 — `SuppliersPage` / `ConfirmDialog` xóa một NCC  
> **Tags**: RESTful, Suppliers, Delete

---

## 1. Mục tiêu Task

- Xóa NCC khi **không còn** phiếu nhập liên quan — khớp quy tắc DB §3: **RESTRICT** từ `StockReceipts`.

---

## 2. Endpoint

**`DELETE /api/v1/suppliers/{id}`**

---

## 3. Overview

| Thuộc tính | Giá trị |
| :--------- | :------ |
| **Endpoint** | `/api/v1/suppliers/{id}` |
| **Method** | `DELETE` |
| **Authentication** | `Bearer` |
| **RBAC** | Owner (khuyến nghị) |
| **Use Case Ref** | UC8 |

---

## 4. Thành công — `200 OK`

```json
{
  "success": true,
  "data": { "id": 3, "deleted": true },
  "message": "Đã xóa nhà cung cấp"
}
```

---

## 5. Logic DB

1. **`SELECT id FROM Suppliers WHERE id = ? FOR UPDATE`** → **404**.
2. **`SELECT 1 FROM StockReceipts WHERE supplier_id = ? LIMIT 1`** → có → **409** "Đã có phiếu nhập kho liên quan".
3. **`DELETE FROM Suppliers WHERE id = ?`**.

---

## 6. Lỗi

#### 409 Conflict

```json
{
  "success": false,
  "error": "CONFLICT",
  "message": "Không thể xóa nhà cung cấp đã có phiếu nhập kho"
}
```

**404** / **401** / **403** / **500**.

---

## 7. Zod (params)

```typescript
import { z } from "zod";
export const SupplierIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});
```
