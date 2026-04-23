# 📄 API SPEC: `POST /api/v1/system-logs/bulk-delete` — Xóa nhiều nhật ký — Task088

> **Trạng thái**: Draft  
> **Feature**: `LogsPage` — xóa hàng loạt

---

## 1. Endpoint

**`POST /api/v1/system-logs/bulk-delete`**

---

## 2. Body

```json
{
  "ids": [101, 102, 103]
}
```

- Tối đa **100** id mỗi lần (cấu hình được).

---

## 3. RBAC

Giống Task087 (**Admin**).

---

## 4. `200 OK`

```json
{
  "success": true,
  "data": { "deletedCount": 3 },
  "message": "Đã xóa 3 bản ghi"
}
```

---

## 5. Lỗi

**400** (ids rỗng), **401**, **403**, **500**.

---

## 6. Zod

```typescript
import { z } from "zod";

export const SystemLogsBulkDeleteBodySchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(100),
});
```
