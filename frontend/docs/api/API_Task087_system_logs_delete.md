# 📄 API SPEC: `DELETE /api/v1/system-logs/{id}` — Xóa một nhật ký — Task087

> **Trạng thái**: Draft  
> **Feature**: `LogsPage` — xóa đơn (tuỳ chính sách tuân thủ; mặc định **chỉ Admin**)

---

## 1. Endpoint

**`DELETE /api/v1/system-logs/{id}`**

---

## 2. Cảnh báo nghiệp vụ

Nhiều hệ thống **cấm xóa** log bảo mật — nếu policy vậy, endpoint trả **403** + thông báo, và UI ẩn nút xóa. Task này mô tả khi **cho phép** purge (ví dụ lỗi nhập tay, GDPR test).

---

## 3. RBAC

**Admin** (hoặc Owner có flag đặc biệt).

---

## 4. `204` / `200`

---

## 5. Lỗi

**404**, **401**, **403**, **500**.
