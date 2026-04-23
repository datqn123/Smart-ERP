# 📄 API SPEC: `GET /api/v1/debts/{id}` — Chi tiết sổ nợ — Task071

> **Trạng thái**: Draft  
> **Feature**: Cashflow — **Sổ nợ**

---

## 1. Mục tiêu

Trả về một **`partner_debts`** + `partnerName` + `remainingAmount`.

---

## 2. Endpoint

**`GET /api/v1/debts/{id}`**

---

## 3. Tham chiếu

[`Database_Specification.md`](../UC/Database_Specification.md) §12.2.

---

## 4. Overview

| Thuộc tính | Giá trị |
| :--------- | :------ |
| **Authentication** | `Bearer` |
| **RBAC** | Giống Task069 |

---

## 5. `200 OK`

Cùng shape một phần tử trong `data.items` của Task069; có thể thêm `createdAt` nếu cần audit.

---

## 6. Database

`SELECT` + join tên đối tác như Task069.

---

## 7. Lỗi

**400** (id), **401**, **403**, **404**, **500**.

```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Không tìm thấy khoản nợ"
}
```

---

## 8. Zod

```typescript
import { z } from "zod";

export const DebtIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});
```

---

## 9. Ghi chú FE

Dùng cho drawer chi tiết / form chỉnh sửa trước khi gọi Task072.
