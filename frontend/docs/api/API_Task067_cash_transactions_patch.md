# 📄 API SPEC: `PATCH /api/v1/cash-transactions/{id}` — Cập nhật / hoàn tất thu chi — Task067

> **Trạng thái**: Draft  
> **Feature**: Cashflow — **Giao dịch thu chi**

---

## 1. Mục tiêu

- Cập nhật các trường cho phép khi **`Pending`** (hoặc `Cancelled` nếu cho phép đổi ghi chú).  
- Khi chuyển **`status` → `Completed`**: **một transaction** — insert `finance_ledger` + cập nhật `finance_ledger_id` (một lần duy nhất — idempotent).

---

## 2. Endpoint

**`PATCH /api/v1/cash-transactions/{id}`**

---

## 3. Tham chiếu

[`Database_Specification.md`](../UC/Database_Specification.md) §12.1 Business Rules.

---

## 4. Overview

| Thuộc tính | Giá trị |
| :--------- | :------ |
| **Authentication** | `Bearer` |
| **RBAC** | Quyền sửa thu chi |

---

## 5. Request body (partial JSON)

Tất cả trường **optional**; chỉ cập nhật field được gửi.

| Trường | Kiểu | Ghi chú |
| :----- | :--- | :------ |
| `amount` | number > 0 | Chỉ khi `Pending` |
| `category` | string | |
| `description` | string | |
| `paymentMethod` | string | |
| `transactionDate` | date | |
| `status` | enum | `Pending` → `Completed` hoặc `Cancelled` |

**Cấm**: Sửa `direction`, `transactionCode`, hoặc bất kỳ field nào khi **`Completed`** (trừ có quyền admin đặc biệt — mặc định **409**).

---

## 6. `200 OK`

Trả về bản ghi sau cập nhật (cùng shape Task066).

---

## 7. Logic & Database

1. `SELECT … FOR UPDATE` row `cash_transactions`.  
2. Nếu không tồn tại → **404**.  
3. Nếu `status = Completed` và body có thay đổi nghiệp vụ → **409** `"Không thể sửa giao dịch đã hoàn tất"`.  
4. Nếu `PATCH` set `status = Completed`:  
   - Nếu đã có `finance_ledger_id` → **200** idempotent (không double-insert).  
   - Ngược lại: `INSERT finance_ledger` (như Task065) + `UPDATE cash_transactions SET finance_ledger_id = …, status = Completed, updated_at = now()`.  
5. Nếu `status = Cancelled`: không tạo ledger; có thể yêu cầu `finance_ledger_id IS NULL`.

---

## 8. Lỗi

| Mã | Tình huống |
| :--- | :----------- |
| 400 | Validation partial fail |
| 401 | |
| 403 | |
| 404 | Không có `id` |
| 409 | Conflict: đã Completed, hoặc chuyển trạng thái không hợp lệ |
| 500 | |

---

## 9. Zod

```typescript
import { z } from "zod";

export const CashTransactionPatchBodySchema = z
  .object({
    amount: z.number().positive().optional(),
    category: z.string().min(1).max(100).optional(),
    description: z.string().max(2000).optional().nullable(),
    paymentMethod: z.string().max(30).optional(),
    transactionDate: z.string().date().optional(),
    status: z.enum(["Pending", "Completed", "Cancelled"]).optional(),
  })
  .refine((o) => Object.keys(o).length > 0, {
    message: "Cần ít nhất một trường cập nhật",
  });
```

---

## 10. Ghi chú FE

Luồng “Duyệt / Hoàn tất”: gửi `{ "status": "Completed" }`; hiển thị lỗi 409 nếu user cố sửa tiền sau khi đã vào sổ.
