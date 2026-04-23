# 📄 API SPEC: `GET /api/v1/cash-transactions` — Danh sách giao dịch thu chi — Task064

> **Trạng thái**: Draft  
> **Feature**: Cashflow — màn **Giao dịch thu chi** (`TransactionsPage`, `/cashflow/transactions`)  
> **Tags**: RESTful, Finance, Pagination

---

## 1. Mục tiêu Task

- **Nghiệp vụ**: Liệt kê **`cash_transactions`** (phiếu thu/chi nhập tay), lọc theo loại, trạng thái, ngày, tìm kiếm — thay mock `Transaction[]`.
- **Phạm vi**: **Chỉ** `GET /cash-transactions`.
- **Out of scope**: Tạo/sửa/xóa → Task065–068.

---

## 2. Mục đích Endpoint

Đọc danh sách có phân trang; hỗ trợ export CSV phía FE từ cùng dữ liệu (gọi `limit` lớn hoặc endpoint export sau).

---

## 3. Tham chiếu

[`API_PROJECT_DESIGN.md`](API_PROJECT_DESIGN.md) §4.14.  
[`Database_Specification.md`](../UC/Database_Specification.md) §12.1 `CashTransactions`.

---

## 4. Overview

| Thuộc tính | Giá trị |
| :--------- | :------ |
| **Endpoint** | `/api/v1/cash-transactions` |
| **Method** | `GET` |
| **Authentication** | `Bearer` |
| **RBAC** | Owner / Staff có quyền thu chi (policy đồng nhất với PATCH); không đủ → **403** |

---

## 5. Request

### Query parameters

| Tham số | Kiểu | Mặc định | Mô tả |
| :------ | :--- | :------- | :---- |
| `type` | `Income` \| `Expense` | — | Map `direction` |
| `status` | `Pending` \| `Completed` \| `Cancelled` | — | |
| `dateFrom` | date | — | `transaction_date >=` |
| `dateTo` | date | — | `transaction_date <=` |
| `search` | string | — | `ILIKE` trên `transaction_code`, `category`, `description` |
| `page` | int | `1` | |
| `limit` | int 1–100 | `20` | |

---

## 6. Ánh xạ UI

| FE `Transaction` | JSON |
| :----------------- | :--- |
| `type` | `direction` (cùng giá trị enum) |
| `date` | `transactionDate` |
| `transactionCode` | `transactionCode` |

---

## 7. `200 OK` — ví dụ

```json
{
  "success": true,
  "data": {
    "items": [
      {
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
        "createdAt": "2026-04-22T10:00:00Z",
        "updatedAt": "2026-04-22T10:00:00Z"
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 4
  },
  "message": "Thành công"
}
```

---

## 8. Database

`SELECT` từ `cash_transactions` + `WHERE` theo filter + `ORDER BY transaction_date DESC, id DESC` + phân trang.

---

## 9. Lỗi

**400** (query), **401**, **403**, **500** — cùng envelope `success`/`error`/`message`/`details` như các Task inventory.

---

## 10. Zod

```typescript
import { z } from "zod";

export const CashTransactionsListQuerySchema = z.object({
  type: z.enum(["Income", "Expense"]).optional(),
  status: z.enum(["Pending", "Completed", "Cancelled"]).optional(),
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
```

---

## 11. Ghi chú FE

`Transaction.type` ↔ API `direction`; khi `status === Completed` và có `financeLedgerId`, dòng đã vào sổ cái.
