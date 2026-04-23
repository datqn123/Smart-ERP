# 📄 API SPEC: `DELETE /api/v1/cash-transactions/{id}` — Xóa giao dịch thu chi — Task068

> **Trạng thái**: Draft  
> **Feature**: Cashflow — **Giao dịch thu chi**

---

## 1. Mục tiêu

Xóa cứng bản ghi **`cash_transactions`** chỉ khi **`Pending`** hoặc **`Cancelled`** và **`finance_ledger_id IS NULL`**.

---

## 2. Endpoint

**`DELETE /api/v1/cash-transactions/{id}`**

---

## 3. Tham chiếu

[`Database_Specification.md`](../UC/Database_Specification.md) §12.1 — không xóa khi đã ghi sổ.

---

## 4. Overview

| Thuộc tính | Giá trị |
| :--------- | :------ |
| **Authentication** | `Bearer` |
| **RBAC** | Quyền xóa thu chi (thường Owner hoặc Staff theo policy) |

---

## 5. Request

Không body.

---

## 6. `204 No Content`

Hoặc `200 OK` với envelope:

```json
{
  "success": true,
  "data": null,
  "message": "Đã xóa giao dịch"
}
```

_(Chọn một chuẩn trong codebase backend; tài liệu chấp nhận cả hai nếu FE đã chuẩn hóa.)_

---

## 7. Logic & Database

1. Load row theo `id`.  
2. **404** nếu không tồn tại.  
3. Nếu `status = Completed` **hoặc** `finance_ledger_id IS NOT NULL` → **409**  
   `"Không thể xóa giao dịch đã ghi nhận vào sổ cái"`.  
4. `DELETE FROM cash_transactions WHERE id = :id`.

---

## 8. Lỗi

- **401**, **403**, **404**, **409**, **500**

Ví dụ **409**:

```json
{
  "success": false,
  "error": "CONFLICT",
  "message": "Không thể xóa giao dịch đã hoàn tất hoặc đã liên kết sổ cái"
}
```

---

## 9. Zod

Dùng chung `CashTransactionIdParamsSchema` (Task066).

---

## 10. Ghi chú FE

Ẩn nút xóa khi `status === Completed` để giảm round-trip.
