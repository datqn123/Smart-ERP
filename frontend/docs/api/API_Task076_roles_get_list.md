# 📄 API SPEC: `GET /api/v1/roles` — Danh sách vai trò — Task076

> **Trạng thái**: Draft  
> **Feature**: UC3 — dropdown phân quyền (`EmployeeForm`, filter nội bộ)

---

## 1. Endpoint

**`GET /api/v1/roles`**

---

## 2. RBAC

**Bearer**; Owner / Admin đọc được; Staff không cần endpoint này → **403** nếu policy chặt.

---

## 3. `200 OK`

```json
{
  "success": true,
  "data": {
    "items": [
      { "id": 1, "name": "Owner", "permissions": { "can_manage_staff": true } },
      { "id": 2, "name": "Staff", "permissions": { "can_manage_inventory": true } }
    ]
  },
  "message": "Thành công"
}
```

**Lưu ý**: FE hiện map nhãn `Admin` / `Manager` / `Warehouse` / `Staff` — backend trả `Roles.name` thực tế trong DB; đồng bộ seed `Roles` với UI hoặc map ở FE.

Tham chiếu: [`Database_Specification.md`](../UC/Database_Specification.md) §1 `Roles`.

---

## 4. Zod

```typescript
import { z } from "zod";

export const RoleItemSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  permissions: z.record(z.string(), z.unknown()),
});
```
