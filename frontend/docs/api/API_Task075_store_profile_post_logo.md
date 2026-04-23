# 📄 API SPEC: `POST /api/v1/store-profile/logo` — Upload logo cửa hàng — Task075

> **Trạng thái**: Draft  
> **Feature**: `StoreInfoPage` — thay logo (multipart)

---

## 1. Endpoint

**`POST /api/v1/store-profile/logo`**

---

## 2. Request

- **Content-Type**: `multipart/form-data`  
- **Field**: `file` (image/png, image/jpeg) — tối đa **2MB** (theo gợi ý UI).

---

## 3. RBAC

Giống Task074 (**Owner** / Admin được phép).

---

## 4. Logic

1. Validate MIME + kích thước → **400** nếu sai.  
2. Upload lên object storage / CDN → nhận `publicUrl`.  
3. `UPDATE store_profiles SET logo_url = :publicUrl, updated_at = now() WHERE owner_id = :id`.

---

## 5. `200 OK`

```json
{
  "success": true,
  "data": {
    "logoUrl": "https://cdn.example.com/stores/7/logo-v3.png",
    "updatedAt": "2026-04-23T09:00:00Z"
  },
  "message": "Đã cập nhật logo"
}
```

---

## 6. Lỗi

**400** (file không hợp lệ), **401**, **403**, **413** (payload quá lớn), **500**.

---

## 7. Ghi chú FE

Sau khi thành công, gán `logoUrl` vào form; có thể gọi lại Task073 để đồng bộ toàn bộ.
