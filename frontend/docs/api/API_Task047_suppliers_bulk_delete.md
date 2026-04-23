# 📄 API SPEC: `POST /api/v1/suppliers/bulk-delete` — Xóa nhiều nhà cung cấp - Task047

> **Trạng thái**: Draft  
> **Feature**: UC8 — `SuppliersPage` xóa hàng loạt  
> **Tags**: RESTful, Suppliers, Bulk, Delete

---

## 1. Mục tiêu Task

- Xóa nhiều NCC; áp dụng **cùng ràng buộc** như [`API_Task046_suppliers_delete.md`](API_Task046_suppliers_delete.md).

---

## 2. Endpoint

**`POST /api/v1/suppliers/bulk-delete`**

---

## 3. Request body

```json
{
  "ids": [3, 4, 5]
}
```

| Trường | Mô tả |
| :----- | :---- |
| `ids` | `Suppliers.id`, max **50** (gợi ý). |

---

## 4. Thành công

Giống tinh thần [`API_Task041_products_bulk_delete.md`](API_Task041_products_bulk_delete.md): **all-or-nothing** hoặc **partial** — chọn một policy và ghi rõ trong triển khai.

---

## 5. Logic DB

Transaction: với mỗi `id`, kiểm tra `StockReceipts`; nếu all-or-nothing và một id lỗi → rollback toàn bộ → **409** kèm `failedIds`.

---

## 6. Zod (body)

```typescript
import { z } from "zod";
export const SuppliersBulkDeleteBodySchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(50),
});
```
