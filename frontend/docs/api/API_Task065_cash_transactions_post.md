# 📄 API SPEC: `POST /api/v1/cash-transactions` — Tạo giao dịch thu chi — Task065

> **Trạng thái**: Draft  
> **Feature**: Cashflow — **Giao dịch thu chi**  
> **Tags**: RESTful, Finance, Create

---

## 1. Mục tiêu Task

- **Nghiệp vụ**: Tạo bản ghi **`cash_transactions`** mới (thường `Pending`); tùy policy có thể tạo thẳng `Completed` và **đồng thời** ghi `FinanceLedger` (xem §8).
- **Out of scope**: Sửa/xóa → Task067, 068.

---

## 2. Endpoint

**`POST /api/v1/cash-transactions`**

---

## 3. Tham chiếu

[`Database_Specification.md`](../UC/Database_Specification.md) §12.1 — rule hoàn tất & `FinanceLedger`.

---

## 4. Overview

| Thuộc tính | Giá trị |
| :--------- | :------ |
| **Authentication** | `Bearer` |
| **RBAC** | Staff/Owner có quyền tạo thu chi |

---

## 5. Request body (JSON, camelCase)

| Trường | Kiểu | Bắt buộc | Mô tả |
| :----- | :--- | :------- | :---- |
| `direction` | `Income` \| `Expense` | Có | |
| `amount` | number > 0 | Có | |
| `category` | string 1–100 | Có | |
| `description` | string | Không | |
| `paymentMethod` | string | Không | Mặc định `Cash` |
| `transactionDate` | date ISO | Có | |
| `status` | enum | Không | Mặc định `Pending`; cho phép `Completed` nếu policy “ghi sổ ngay” |

**Sinh `transaction_code`**: server-side (unique), ví dụ `PT-2026-{seq}` / `PC-2026-{seq}` theo `direction`.

---

## 6. Thành công — `201 Created`

Trả về bản ghi đầy đủ như Task066 (cùng shape `data`).

```json
{
  "success": true,
  "data": {
    "id": 13,
    "transactionCode": "PC-2026-0002",
    "direction": "Expense",
    "amount": 120000,
    "category": "Chi phí vận hành",
    "description": "Mua văn phòng phẩm",
    "paymentMethod": "Cash",
    "status": "Pending",
    "transactionDate": "2026-04-23",
    "financeLedgerId": null,
    "createdAt": "2026-04-23T08:00:00Z",
    "updatedAt": "2026-04-23T08:00:00Z"
  },
  "message": "Đã tạo giao dịch"
}
```

---

## 7. Logic & Database

1. Validate body → **400**.  
2. `INSERT INTO cash_transactions (...)` với `created_by = current_user_id`.  
3. Nếu `status = Completed` **ngay tại POST** (nếu cho phép): trong **một transaction DB**:  
   - `INSERT INTO finance_ledger` (`transaction_date`, `transaction_type`, `reference_type`, `reference_id`, `amount`, `description`, `created_by`)  
     - `reference_type = 'CashTransaction'`, `reference_id = cash_transactions.id`  
     - `amount` dương nếu `Income`, âm nếu `Expense`  
     - `transaction_type`: `SalesRevenue` (Income) hoặc `OperatingExpense` (Expense) — thống nhất với BA  
   - `UPDATE cash_transactions SET finance_ledger_id = …`  
4. Nếu chỉ `Pending`: không đụng `finance_ledger`.

---

## 8. Lỗi

| Mã | Tình huống |
| :--- | :----------- |
| 400 | `amount <= 0`, thiếu trường bắt buộc, `status` không hợp lệ |
| 401 | Chưa đăng nhập |
| 403 | Không quyền |
| 409 | Trùng `transaction_code` (hiếm nếu retry race — xử lý idempotent theo policy) |
| 500 | Lỗi server |

---

## 9. Zod (body)

```typescript
import { z } from "zod";

export const CashTransactionCreateBodySchema = z.object({
  direction: z.enum(["Income", "Expense"]),
  amount: z.number().positive(),
  category: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  paymentMethod: z.string().max(30).optional().default("Cash"),
  transactionDate: z.string().date(),
  status: z.enum(["Pending", "Completed", "Cancelled"]).optional().default("Pending"),
});
```

---

## 10. Ghi chú FE

Sau khi tạo, refresh danh sách Task064; nếu `Completed`, có thể gọi thêm Task063 để cập nhật sổ cái.
