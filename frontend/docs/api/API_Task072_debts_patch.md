# 📄 API SPEC: `PATCH /api/v1/debts/{id}` — Cập nhật / trả nợ — Task072

> **Trạng thái**: Draft  
> **Feature**: Cashflow — **Sổ nợ**

---

## 1. Mục tiêu

- Cập nhật `dueDate`, `notes`, `totalAmount` (khi chưa thanh toán nhiều — theo policy).  
- **Ghi nhận trả nợ**: tăng `paidAmount` (hoặc gửi `paymentAmount` cộng dồn server-side).  
- Tự cập nhật **`status = Cleared`** khi `paidAmount >= totalAmount`.

**Out of scope (backlog)**: Đồng bộ `INSERT finance_ledger` khi trả nợ — ghi trong policy riêng nếu BA yêu cầu.

---

## 2. Endpoint

**`PATCH /api/v1/debts/{id}`**

---

## 3. Tham chiếu

[`Database_Specification.md`](../UC/Database_Specification.md) §12.2 — `chk_paid_le_total`.

---

## 4. Overview

| Thuộc tính | Giá trị |
| :--------- | :------ |
| **Authentication** | `Bearer` |
| **RBAC** | Quyền sửa sổ nợ |

---

## 5. Request body (partial)

| Trường | Kiểu | Mô tả |
| :----- | :--- | :---- |
| `totalAmount` | number ≥ 0 | Optional; không giảm dưới `paidAmount` hiện tại |
| `paidAmount` | number ≥ 0 | Set tuyệt đối **hoặc** dùng `paymentAmount` (xem dưới) |
| `paymentAmount` | number > 0 | Cộng vào `paidAmount` hiện có (mutually exclusive với set trực tiếp `paidAmount` — chọn một chuẩn trong BE) |
| `dueDate` | date \| null | |
| `notes` | string \| null | |

**Gợi ý API đơn giản cho UI “Trả một phần”**: chỉ hỗ trợ `paymentAmount` — server:  
`newPaid = LEAST(paid_amount + paymentAmount, total_amount)`.

---

## 6. `200 OK`

Trả về bản ghi đầy đủ sau cập nhật (shape Task071).

---

## 7. Logic & Database

1. `SELECT … FOR UPDATE` từ `partner_debts`.  
2. Validate `newPaid <= total_amount` → nếu vi phạm **400**.  
3. `UPDATE partner_debts SET …, updated_at = now()`.  
4. Nếu `newPaid >= total_amount` → `status = Cleared`, else `InDebt`.

---

## 8. Lỗi

| Mã | Tình huống |
| :--- | :----------- |
| 400 | Validation; `totalAmount` < `paidAmount` |
| 401 | |
| 403 | |
| 404 | |
| 409 | Nghiệp vụ không cho sửa khoản đã đóng (nếu policy) |
| 500 | |

---

## 9. Zod

```typescript
import { z } from "zod";

export const DebtPatchBodySchema = z
  .object({
    totalAmount: z.number().min(0).optional(),
    paidAmount: z.number().min(0).optional(),
    paymentAmount: z.number().positive().optional(),
    dueDate: z.string().date().optional().nullable(),
    notes: z.string().max(5000).optional().nullable(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: "Cần ít nhất một trường" })
  .refine((o) => !(o.paidAmount != null && o.paymentAmount != null), {
    message: "Chỉ dùng paidAmount hoặc paymentAmount, không dùng cả hai",
  });
```

---

## 10. Ghi chú FE

Nút “Ghi nhận thanh toán” → `PATCH` với `{ "paymentAmount": value }`; hiển thị `remainingAmount` từ response.
