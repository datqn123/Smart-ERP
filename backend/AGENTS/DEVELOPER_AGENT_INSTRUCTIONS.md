# Agent — Developer

## 1. Vai trò

- Triển khai **Feature** và **sửa lỗi** trên `backend/smart-erp/**` theo task PM và spec Approved.

## 2. JPA + Flyway (`ddl-auto=validate`, Postgres)

- Cột DB kiểu **`JSONB`** (vd. `Roles.permissions` trong V1): nếu map sang Java `String` / `Map`, entity **phải** dùng `@JdbcTypeCode(SqlTypes.JSON)` (Hibernate 6). Nếu chỉ `@Column` + `String` không khai báo kiểu → Hibernate coi là **VARCHAR** → `Schema-validation: wrong column type … found [jsonb] … expecting [varchar]`.
- Sau khi thêm field entity cho cột đã có trong migration: chạy app profile **postgres** (hoặc `./mvnw.cmd verify`) để bắt lỗi validate sớm.

## 3. Chuẩn hóa chuỗi từ HTTP (Doc Sync — ví dụ Task001)

- Với **định danh / text nghiệp vụ** (email, mã khách hàng, ô tìm kiếm, …): áp dụng **`String.strip()`** (hoặc quy ước tương đương) **trước** `@Valid` và **trước** so khớp DB, để khớp spec “server chuẩn hóa” và tránh 400 `@Email` oan do khoảng trắng đầu/cuối. Cách làm gọn: **compact constructor** của record DTO, `@JsonDeserialize` có `trim`, hoặc một lớp normalize tập trung — chọn một pattern nhất quán trong module.
- Với **bí mật** (mật khẩu, refresh token thô, …): **không** strip mù quáng (có thể đổi nghĩa chuỗi người dùng cố ý). Chuỗi “chỉ khoảng trắng” / rỗng → dùng `@NotBlank` hoặc rule riêng trong spec, không coi strip password là mặc định.

## 4. TDD nghiêm ngặt

1. **Test trước** — viết / bổ sung test thất bại theo task **Unit** (red).  
2. **Triển khai sau** — mã tối thiểu để xanh (green).  
3. **Refactor** — khi đã xanh, giữ test xanh.

## 5. Cổng trước Ready for review

- `./mvnw.cmd verify` (hoặc lệnh CI tương đương) **xanh**.
- **JaCoCo ≥ 80%** lines (hoặc ngưỡng team đã bật) — không gộp PR nếu gate fail.

## 6. Quét hiệu năng sau khi test xanh (bắt buộc checklist ngắn)

- **grep** / review: vòng lặp có **gọi DB bên trong** (N+1).  
- Cột **WHERE / JOIN** mới: đã có **index** (hoặc ADR “chấp nhận không index” + lý do).  
- Truy vấn **danh sách**: có **LIMIT** / phân trang (hoặc ADR).  
- Sửa rẻ (một vài dòng, rõ ràng) → **làm ngay** trong PR.  
- Cần **tái cấu trúc nhiều file** → ghi **tech debt** trong PR (mô tả + ticket follow-up), không nhét ngầm vào feature PR lớn không liên quan.

## 7. Git & nhánh

- **Không** commit/push trực tiếp lên `main` hoặc `develop`.  
- **Luôn** nhánh `feature/<slug>` tạo từ **`develop` mới nhất**.  
- PR vào `develop` (hoặc quy trình team).

## 8. Không làm

- Không bỏ test để “xanh giả”.
- Không commit secret (DB, JWT, key).
