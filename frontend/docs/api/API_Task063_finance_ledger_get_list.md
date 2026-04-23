# 📄 API SPEC: `GET /api/v1/finance-ledger` — Sổ cái tài chính (read-only) — Task063

> **Trạng thái**: Draft  
> **Feature**: Cashflow / UC1, UC4 — màn **Sổ cái tài chính** (`LedgerPage`, route `/cashflow/ledger`)  
> **Tags**: RESTful, Finance, Read-only, Pagination, RBAC

---

## 1. Mục tiêu Task

- **Nghiệp vụ**: Đọc **`FinanceLedger`** theo thứ tự thời gian, kèm **số dư lũy kế** (`balance`) sau mỗi dòng — thay thế mock `LedgerEntry` trong `mini-erp`.
- **Ai được lợi**: Owner / kế toán có quyền xem tài chính; không cho phép sửa/xóa qua API này (immutable theo DB).
- **Phạm vi**: **Chỉ** `GET /finance-ledger` (danh sách phân trang + `meta`).
- **Out of scope**: Ghi sổ tự động từ phiếu/đơn (nghiệp vụ khác); chỉnh sửa dòng sổ cái (không hỗ trợ).

---

## 2. Mục đích Endpoint

**`GET /api/v1/finance-ledger`** trả về các bút toán đã ghi nhận, map sang cột **Nợ / Có / Số dư** theo quy ước đơn giản cho UI:

- `amount > 0` → **thu** → `credit = amount`, `debit = 0`.
- `amount < 0` → **chi** → `debit = |amount|`, `credit = 0`.
- `balance` = tổng lũy kế **có dấu** của `amount` theo thứ tự `transaction_date ASC`, `id ASC` (trên **toàn tập** thỏa bộ lọc, rồi cắt trang).

**Khi nào gọi**: mở `LedgerPage`; đổi bộ lọc ngày / loại / tìm kiếm; đổi trang.

---

## 3. Tham chiếu

**Khung**: [`API_PROJECT_DESIGN.md`](API_PROJECT_DESIGN.md) §2–§3, **§4.14**.  
**DB**: [`Database_Specification.md`](../UC/Database_Specification.md) §12 `FinanceLedger`.

---

## 4. Thông tin chung (Overview)

| Thuộc tính | Giá trị |
| :--------- | :------ |
| **Endpoint** | `/api/v1/finance-ledger` |
| **Method** | `GET` |
| **Authentication** | `Bearer` (bắt buộc) |
| **RBAC** | Quyền **`can_view_finance`** (hoặc Owner); thiếu quyền → **403** |

---

## 5. Đặc tả Request

### 5.1 Headers

```http
Authorization: Bearer <access_token>
```

### 5.2 Query parameters

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
| :------ | :--- | :------- | :------- | :---- |
| `dateFrom` | `date` (ISO) | Không | — | `transaction_date >= dateFrom` |
| `dateTo` | `date` (ISO) | Không | — | `transaction_date <= dateTo` |
| `transactionType` | string | Không | — | Một trong: `SalesRevenue`, `PurchaseCost`, `OperatingExpense`, `Refund` |
| `referenceType` | string | Không | — | Lọc `reference_type` (VD: `SalesOrder`, `CashTransaction`) |
| `search` | string | Không | — | `ILIKE` trên `description` |
| `page` | int ≥ 1 | Không | `1` | |
| `limit` | int 1–100 | Không | `20` | |

### 5.3 Request body

_Không có_

---

## 6. Ánh xạ UI → endpoint

| UI `LedgerPage` | API |
| :---------------- | :-- |
| Cột ngày / mã / diễn giải / nợ / có / số dư | `data.items[]` |
| Lọc theo khoảng ngày | `dateFrom`, `dateTo` |
| Ô tìm kiếm | `search` |

**Mã hiển thị (`transactionCode`)**: chuỗi gợi ý: kết hợp `reference_type` + `reference_id` (VD `SO-123`) sau khi join read-model; nếu không join được thì fallback `FL-{id}`.

---

## 7. Thành công — `200 OK`

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1001,
        "date": "2026-04-20",
        "transactionCode": "SO-88",
        "description": "Bán hàng đơn #88",
        "transactionType": "SalesRevenue",
        "referenceType": "SalesOrder",
        "referenceId": 88,
        "amount": 1500000,
        "debit": 0,
        "credit": 1500000,
        "balance": 1500000
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 350
  },
  "message": "Thành công"
}
```

---

## 8. Logic nghiệp vụ & Database

1. Xác thực JWT → **401** nếu sai/hết hạn.  
2. Kiểm tra **`can_view_finance`** (hoặc policy tương đương) → **403**.  
3. Validate query (Zod §10) → **400**.  
4. CTE / subquery: tập `filtered` từ `finance_ledger` với `WHERE` theo query.  
5. Window: `SUM(amount) OVER (ORDER BY transaction_date ASC, id ASC) AS balance` trên `filtered`.  
6. Đếm `total`, `LIMIT/OFFSET` theo `page`/`limit`.  
7. Map `debit`/`credit` từ `amount` như mục 2.

**Lưu ý**: Không `UPDATE`/`DELETE` `finance_ledger` trong endpoint này.

---

## 9. Lỗi (Error Responses)

- **400**: tham số không hợp lệ (`transactionType` sai enum, `limit` > 100, …).  
- **401**: thiếu token / token hết hạn.  
- **403**: không có quyền xem tài chính.  
- **500**: lỗi máy chủ.

(Ví dụ JSON giống pattern [`API_Task005_inventory_get_list.md`](API_Task005_inventory_get_list.md) §9.)

---

## 10. Zod (query — FE)

```typescript
import { z } from "zod";

const TransactionTypeEnum = z.enum([
  "SalesRevenue",
  "PurchaseCost",
  "OperatingExpense",
  "Refund",
]);

export const FinanceLedgerListQuerySchema = z.object({
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
  transactionType: TransactionTypeEnum.optional(),
  referenceType: z.string().max(50).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
```

---

## 11. Ghi chú FE

Thay mock `ledgerEntries` bằng `data.items`; giữ định dạng `date` ISO; `balance` đã là lũy kế — không cần tính lại trên client trừ khi merge nhiều nguồn.
