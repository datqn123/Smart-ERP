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

**Admin** (hoặc Owner có flag đặc biệt) và tuân theo policy tuân thủ (có thể cấm xóa log).

> **GAP (đồng bộ codebase):** Backend hiện chưa có key quyền cho “xem/xóa system logs” trong JWT claim `mp` (`MenuPermissionClaims.MENU_KEYS`).

---

## 4. `204` / `200`

> **[CẦN CHỐT]** Dự án thường dùng envelope JSON; nếu cần đồng nhất, chọn `200` với body theo `API_RESPONSE_ENVELOPE.md`.  
> Nếu muốn “chuẩn REST” có thể dùng `204 No Content`.

---

## 5. Lỗi

**404**, **401**, **403**, **500**.
