# 📄 API SPEC: `GET /api/v1/cash-transactions/{id}` — Chi tiết giao dịch thu chi — Task066

> **Trạng thái**: Draft  
> **Feature**: Cashflow — **Giao dịch thu chi** (form chi tiết / drawer)

---

## 1. Mục tiêu

Trả về **một** bản ghi `cash_transactions` theo `id`.

---

## 2. Endpoint

**`GET /api/v1/cash-transactions/{id}`** — `id`: integer > 0.

---

## 3. Tham chiếu

[`Database_Specification.md`](../UC/Database_Specification.md) §12.1.

---

## 4. Overview

| Thuộc tính | Giá trị |
| :--------- | :------ |
| **Authentication** | `Bearer` |
| **RBAC** | Cùng quyền đọc danh sách Task064 |

---

## 5. Request

Không body. Path: `id`.

---

## 6. `200 OK`

Shape giống một phần tử `items` trong Task064:

```json
{
  "success": true,
  "data": {
    "id": 12,
    "transactionCode": "PT-2026-0003",
    "direction": "Income",
    "amount": 500000,
    "category": "Thu tiền khách lẻ",
    "description": "POS ngày 22/04",
    "paymentMethod": "Cash",
    "status": "Completed",
    "transactionDate": "2026-04-22",
    "financeLedgerId": 1005,
    "createdBy": 3,
    "createdAt": "2026-04-22T10:00:00Z",
    "updatedAt": "2026-04-22T10:00:00Z"
  },
  "message": "Thành công"
}
```

---

## 7. Database

`SELECT * FROM cash_transactions WHERE id = :id` + RBAC tenant nếu có.

---

## 8. Lỗi

- **400**: `id` không phải số nguyên dương.  
- **401**, **403**  
- **404**: Không tồn tại hoặc không thuộc phạm vi user.  
- **500**

Ví dụ **404**:

```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Không tìm thấy giao dịch thu chi"
}
```

---

## 9. Zod (params)

```typescript
import { z } from "zod";

export const CashTransactionIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});
```

---

## 10. Ghi chú FE

Dùng cho màn sửa (prefill) — nếu `status === Completed` thì form ở chế độ chỉ đọc theo rule nghiệp vụ.
