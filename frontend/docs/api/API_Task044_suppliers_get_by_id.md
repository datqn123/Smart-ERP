# 📄 API SPEC: `GET /api/v1/suppliers/{id}` — Chi tiết nhà cung cấp - Task044

> **Trạng thái**: Draft  
> **Feature**: UC8 — `SupplierDetailDialog`  
> **Tags**: RESTful, Suppliers, Read

---

## 1. Mục tiêu Task

- Trả **một** NCC đầy đủ cột + **`receiptCount`** (và có thể `lastReceiptAt` nếu PM cần — optional).

---

## 2. Endpoint

**`GET /api/v1/suppliers/{id}`**

---

## 3. Overview

| Thuộc tính | Giá trị |
| :--------- | :------ |
| **Endpoint** | `/api/v1/suppliers/{id}` |
| **Method** | `GET` |
| **Authentication** | `Bearer` |
| **RBAC** | Owner, Staff, Admin |
| **Use Case Ref** | UC7, UC8 |

---

## 4. Thành công — `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 3,
    "supplierCode": "NCC0001",
    "name": "Công ty ABC",
    "contactPerson": "Nguyễn A",
    "phone": "0909123456",
    "email": "a@abc.com",
    "address": "Hà Nội",
    "taxCode": "0101234567",
    "status": "Active",
    "receiptCount": 8,
    "createdAt": "2026-01-05T08:00:00Z",
    "updatedAt": "2026-04-01T10:00:00Z"
  },
  "message": "Thành công"
}
```

---

## 5. Logic DB

```sql
SELECT s.*, COUNT(sr.id)::int AS receipt_count
FROM Suppliers s
LEFT JOIN StockReceipts sr ON sr.supplier_id = s.id
WHERE s.id = $1
GROUP BY s.id;
```

---

## 6. Lỗi

**404** / **401** / **403** / **500**.

---

## 7. Zod (params)

```typescript
import { z } from "zod";
export const SupplierIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});
```
