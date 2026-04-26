# Agent — Developer

## 1. Vai trò

- Triển khai **Feature** và **sửa lỗi** trên `backend/smart-erp/**` theo task PM và spec Approved.
- Khi sửa theo phiên **BUG_INVESTIGATOR**: đọc `backend/docs/bugs/Bug_Task<NNN>.md`, thực hiện **phương án Owner đã chốt**, giữ TDD và gate §5 như mọi PR sửa lỗi.

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

### 5.1 Handoff **API_BRIDGE** (khi task có REST cho mini-erp)

Nếu task có file **`frontend/docs/api/API_TaskXXX_*.md`** (endpoint gọi từ `mini-erp`) và SRS/API đã **Approved**:

1. Trong **mô tả PR** (hoặc comment cuối ticket), dán khối prompt **HANDOFF_API_BRIDGE** từ [`WORKFLOW_RULE.md`](WORKFLOW_RULE.md) **§3.1** (phiên `Mode=verify` — tối thiểu).  
2. Đánh dấu DoD: **API_BRIDGE verify** đã chạy / `BRIDGE_*.md` đã có link (Owner có thể chạy phiên agent sau merge).

Không gộp bước này vào `mvn verify` — đây là phiên Cursor/agent theo [`API_BRIDGE_AGENT_INSTRUCTIONS.md`](API_BRIDGE_AGENT_INSTRUCTIONS.md).

**SRS một file, nhiều endpoint** (vd. `SRS_Task014-020_stock-receipts-lifecycle.md` → API Task014…020): trong PR liệt kê **danh sách Path** cần verify và nhắc Owner chạy **API_BRIDGE** lần lượt (một Path một phiên — xem `WORKFLOW_RULE.md` **§0.3** và `API_BRIDGE_AGENT_INSTRUCTIONS.md` **§1.2**). Developer **không** coi việc đã đọc SRS khi code là đủ thay cho API_BRIDGE.

### 5.2 Phiếu nhập kho — `SRS_Task014-020_stock-receipts-lifecycle.md` (RBAC)

- **Đọc** (`GET` list Task013, `GET /stock-receipts/{id}` Task015): user có `can_manage_inventory` (controller) xem **mọi** phiếu — **không** lọc theo `staff_id` trong service đọc chi tiết.
- **Sửa / gửi duyệt** (`PATCH` Task016, `POST …/submit` Task018): chỉ người tạo — so khớp `stockreceipts.staff_id` với `Integer.parseInt(jwt.getSubject())` (policy `assertReceiptCreator`).
- **Xóa** (`DELETE` Task017 khi `Draft` hoặc `Pending`), **phê duyệt / từ chối** (Task019/020): chỉ JWT claim `role` = Owner (trim, không phân biệt hoa thường) — `StockReceiptAccessPolicy.assertOwnerOnly`; Task019/020 vẫn kiểm `can_approve` trước đó trong service như SRS §6.

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

## 9. Context7 (MCP — tài liệu thư viện, giảm token / giảm API bịa)

- **Khi nào:** cần xác nhận **API hoặc cấu hình** của framework / thư viện (Spring Boot, Spring Security OAuth2 Resource Server, Hibernate 6, Flyway, JUnit 5, Mockito, JDBC…) theo **phiên bản** BOM dự án — sau khi đã đọc **task / SRS / ADR / mã repo** tối thiểu; **không** dùng Context7 để “đoán” nghiệp vụ hay schema DB (Flyway + SRS là chuẩn).
- **Cách gọi (prompt):** thêm `use context7` và **một** câu hỏi hẹp (một API / một property / một annotation). Nếu đã biết ID thư viện trên Context7: `use library /<id>` để bỏ bước match — giảm vòng MCP.
- **Phiên bản:** ghi rõ trong prompt (vd. Spring Boot 3.x) để doc trả về khớp BOM `smart-erp`.
- **Cài đặt:** theo [Context7](https://github.com/upstash/context7) / `npx ctx7 setup` — ngoài phạm vi file AGENTS này.
