# 📄 API SPEC: `PATCH /api/v1/store-profile` — Cập nhật thông tin cửa hàng — Task074

> **Trạng thái**: Draft  
> **Feature**: `StoreInfoPage` — lưu meta (không gồm file logo → Task075)

---

## 1. Endpoint

**`PATCH /api/v1/store-profile`**

---

## 2. RBAC

**Owner** (hoặc Admin có `can_manage_staff` / quyền cấu hình cửa hàng). Staff thường → **403**.

---

## 3. Request body (partial, camelCase)

| Trường | Kiểu | Mô tả |
| :----- | :--- | :---- |
| `name` | string | |
| `businessCategory` | string | |
| `address` | string | |
| `phone` | string | |
| `email` | string | email format |
| `website` | string | URL |
| `taxCode` | string | |
| `footerNote` | string | |
| `facebookUrl` | string | |
| `instagramHandle` | string | |
| `logoUrl` | string | Chỉ khi client đã có URL (upload qua Task075); không gửi file raw |

---

## 4. Logic DB

1. `INSERT … ON CONFLICT (owner_id) DO UPDATE` hoặc `UPDATE` nếu đã tồn tại.  
2. `updated_at = now()`.

---

## 5. `200 OK`

Trả về object đầy đủ như Task073.

---

## 6. Lỗi

**400** (validation), **401**, **403**, **500**.

---

## 7. Zod (body)

```typescript
import { z } from "zod";

export const StoreProfilePatchBodySchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    businessCategory: z.string().max(255).optional().nullable(),
    address: z.string().max(2000).optional().nullable(),
    phone: z.string().max(30).optional().nullable(),
    email: z.string().email().optional().nullable(),
    website: z.string().url().or(z.literal("")).optional().nullable(),
    taxCode: z.string().max(50).optional().nullable(),
    footerNote: z.string().max(5000).optional().nullable(),
    logoUrl: z.string().url().optional().nullable(),
    facebookUrl: z.string().max(500).optional().nullable(),
    instagramHandle: z.string().max(255).optional().nullable(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: "Cần ít nhất một trường" });
```
