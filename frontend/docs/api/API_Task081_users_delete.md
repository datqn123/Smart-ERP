# 📄 API SPEC: `DELETE /api/v1/users/{userId}` — Xóa / vô hiệu nhân viên — Task081

> **Trạng thái**: Draft  
> **Feature**: UC3 — xóa nhân viên (`EmployeesPage`)

---

## 1. Endpoint

**`DELETE /api/v1/users/{userId}`**

---

## 2. Chiến lược

- **Hard delete**: chỉ khi không còn FK (hiếm).  
- **Khuyến nghị**: `PATCH status = Locked` (soft) và trả **204** / **200** — nếu vẫn dùng DELETE path thì implement như “vô hiệu hóa”.

---

## 3. RBAC

Owner / Admin. **Cấm** xóa chính mình; **cấm** xóa user đang là chủ sở hữu tenant duy nhất (policy).

---

## 4. Lỗi

**404**, **409** (còn phiếu/đơn liên quan — RESTRICT), **401**, **403**, **500**.

---

## 5. Zod

Dùng `UserIdParamsSchema` (Task079).
