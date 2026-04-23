# 📄 API SPEC: `GET /api/v1/approvals/pending` — Danh sách chờ phê duyệt - Task061

> **Trạng thái**: Draft  
> **Feature**: **UC4** — màn **Chờ phê duyệt** (`PendingApprovalsPage`, `/approvals/pending`)  
> **Tags**: RESTful, Approvals, Read, Polymorphic

---

## 1. Mục tiêu Task

- Trả **danh sách giao dịch đang chờ Owner/Admin duyệt**, thống nhất nhiều loại chứng từ (Inbound / Outbound / Return / Debt — theo [`mini-erp/src/features/approvals/types.ts`](../../mini-erp/src/features/approvals/types.ts) `ApprovalType`).
- **Phiên bản tối thiểu (MVP triển khai)**: SQL đầy đủ cho **`StockReceipts`** (`status = 'Pending'`); các loại khác **UNION** hoặc read-model rỗng cho đến khi có Task endpoint nghiệp vụ tương ứng. Phiếu ở trạng thái chờ có **`reviewed_at` / `reviewed_by` / `rejection_reason` = NULL** cho đến khi Task019 hoặc Task020 chạy (cột mới — [`Database_Specification.md`](../UC/Database_Specification.md) §17).

---

## 2. Mục đích Endpoint

**`GET /api/v1/approvals/pending`** thay `useApprovalStore` mock; hỗ trợ lọc **mã**, **khoảng ngày** (theo ngày tạo / gửi duyệt), tổng hợp **`summary`** cho badge “N giao dịch cần xử lý”.

**Phê duyệt / Từ chối** từ UI: **không** dùng endpoint này — map `entityType` + `entityId` sang:

| `type` (UI) | `entityType` (API) | Duyệt | Từ chối |
| :---------- | :----------------- | :---- | :------ |
| Inbound | `stock_receipt` | [`API_Task019_stock_receipts_approve.md`](API_Task019_stock_receipts_approve.md) | [`API_Task020_stock_receipts_reject.md`](API_Task020_stock_receipts_reject.md) |
| Outbound | `stock_dispatch` | _(Task sau — `POST /stock-dispatches/{id}/approve` hoặc tương đương)_ | _(Task sau)_ |
| Return | `sales_order` / `return_request` | _(Task sau — luồng trả hàng UC9 + UC4)_ | _(Task sau)_ |
| Debt | `debt_request` / `finance_…` | _(Task sau)_ | _(Task sau)_ |

Request body Task019 (`inboundLocationId`) vẫn bắt buộc khi duyệt phiếu nhập.

---

## 3. Tham chiếu

[`API_PROJECT_DESIGN.md`](API_PROJECT_DESIGN.md) **§4.5** — [`Database_Specification.md`](../UC/Database_Specification.md) **§17** `StockReceipts`, **§11** `SystemLogs`.

---

## 4. Overview

| Thuộc tính | Giá trị |
| :--------- | :------ |
| **Endpoint** | `/api/v1/approvals/pending` |
| **Method** | `GET` |
| **Authentication** | `Bearer` |
| **RBAC** | **Owner**, **Admin** (UC4); Staff **403** (trừ policy mở rộng chỉ xem) |
| **Use Case Ref** | UC4 |

---

## 5. Query parameters

| Tham số | Kiểu | Mặc định | Mô tả |
| :------ | :--- | :------- | :---- |
| `search` | string | — | ILIKE `receipt_code` / mã chứng từ tương đương; có thể mở rộng tên `Users` (người tạo). |
| `type` | string | `all` | `all` \| `Inbound` \| `Outbound` \| `Return` \| `Debt` — lọc theo loại hiển thị UI. |
| `fromDate` | date (YYYY-MM-DD) | — | So sánh với `created_at` / `receipt_date` (policy). |
| `toDate` | date | — | Cuối ngày inclusive. |
| `page` | int ≥ 1 | `1` | |
| `limit` | int 1–100 | `50` | Danh sách chờ thường ngắn. |

---

## 6. Thành công — `200 OK`

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalPending": 2,
      "byType": { "Inbound": 1, "Outbound": 1, "Return": 0, "Debt": 0 }
    },
    "items": [
      {
        "entityType": "stock_receipt",
        "entityId": 12,
        "transactionCode": "PN-2026-0012",
        "type": "Inbound",
        "creatorName": "Nguyễn Văn Kho",
        "date": "2026-04-19T08:30:00Z",
        "totalAmount": 12500000,
        "status": "Pending",
        "notes": "Nhập hàng sữa từ Vinamilk"
      }
    ],
    "page": 1,
    "limit": 50,
    "total": 2
  },
  "message": "Thành công"
}
```

**Khóa tổng hợp cho FE**: dùng cặp **`entityType` + `entityId`** khi gọi Task019/020 (không dùng chung `id` số across bảng).

---

## 7. Logic DB (MVP — phiếu nhập)

### 7.1 Danh sách `items` (StockReceipts)

```sql
SELECT
  'stock_receipt' AS entity_type,
  sr.id AS entity_id,
  sr.receipt_code AS transaction_code,
  'Inbound' AS type_label,
  u.full_name AS creator_name,
  sr.created_at AS event_date,
  sr.total_amount,
  sr.status,
  sr.notes
FROM stock_receipts sr
JOIN users u ON u.id = sr.staff_id
WHERE sr.status = 'Pending'
  AND ( :search IS NULL OR sr.receipt_code ILIKE '%' || :search || '%' )
  AND ( :from_date IS NULL OR sr.created_at::date >= :from_date )
  AND ( :to_date IS NULL OR sr.created_at::date <= :to_date )
ORDER BY sr.created_at ASC;
```

### 7.2 `summary`

- `totalPending`: `COUNT(*)` cùng `WHERE` (sau này cộng thêm các UNION).
- `byType`: đếm theo nhánh UNION (MVP: chỉ Inbound có số > 0 nếu chưa triển khai bảng khác).

---

## 8. Lỗi

**400** (ngày không hợp lệ) / **401** / **403** / **500**.

---

## 9. Zod (query — FE)

```typescript
import { z } from "zod";

export const ApprovalsPendingQuerySchema = z.object({
  search: z.string().optional(),
  type: z.enum(["all", "Inbound", "Outbound", "Return", "Debt"]).optional().default("all"),
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});
```

---

## 10. Ghi chú FE

- Thay `displayData` map sang `OrderTable`: map `transactionCode` → `orderCode`, `creatorName` → `customerName`, `type` giữ nguyên chuỗi hiển thị badge.
- Nút **Phê duyệt**: `POST /api/v1/stock-receipts/{entityId}/approve` khi `entityType === 'stock_receipt'`.
- Nút **Từ chối**: `POST .../reject` với `{ "reason": "..." }`.
