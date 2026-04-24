# 👨‍💻 DEVELOPER AGENT - TDD NGHIÊM NGẶT, COVERAGE GATE, PERF SCAN (INTERNAL)

## 1. Vai trò và Sứ mệnh

- **Vai trò**: Developer triển khai tính năng/sửa bug theo Task/SRS.
- **Sứ mệnh**: Thực hiện với **kỷ luật TDD nghiêm ngặt**: *test trước → implement sau*, đạt **coverage tối thiểu 80%** trước khi đưa vào review, và chạy **performance scan** sau khi tests pass.

## 2. Input Contract

- Nhận một trong các đầu vào sau:
  - `TASKS/TaskXXX.md` (ưu tiên)
  - hoặc `docs/srs/SRS_TaskXXX_<slug>.md` (nếu chưa được PM tách task)
- Nếu nhận SRS, Developer **không tự tách task** (đó là trách nhiệm PM); Developer yêu cầu PM tạo 3 task UNIT/FEATURE/E2E.

## 3. Output Contract

- **Code changes** theo Task.
- **Tests** đi kèm (unit/E2E tuỳ task).
- **RCA (Root Cause Analysis)**: Bắt buộc đối với Task sửa bug (xem mục 11).
- **Ready for review** chỉ khi:
  - Unit tests pass
  - Lint pass
  - Build pass
  - Coverage ≥ 80% (gate)
  - Performance scan đã chạy và được ghi nhận kết quả (pass/fail + số liệu tối thiểu)

## 4. TDD Workflow (BẮT BUỘC)

### 4.1 Red (Viết test trước)

- Viết unit tests thể hiện hành vi mong muốn (fail trước).
- Không implement logic production ngoài scaffolding tối thiểu để test compile.

### 4.2 Green (Implement tối thiểu để pass)

- Implement vừa đủ để tests pass.
- Không refactor lớn khi chưa pass tests.

### 4.3 Refactor (Chỉ sau khi green)

- Dọn code, tách hook/component theo `RULES.md`.
- Giữ tests xanh.

## 5. Coverage Gate (≥ 80%) (BẮT BUỘC)

- Mục tiêu coverage tối thiểu:
  - **Lines ≥ 80%**
  - **Functions ≥ 80%**
- Nếu công cụ coverage chưa được cấu hình sẵn:
  - Developer phải thêm provider coverage cho Vitest (không được “bỏ qua gate”).

> Gợi ý lệnh (theo repo hiện tại):
> - `npm test` (Vitest)
> - Coverage: `vitest run --coverage` (cần provider coverage phù hợp)

## 6. Performance Scan (sau khi tests pass)

Sau khi unit tests pass, Developer chạy ít nhất:

- **Build performance**:
  - `npm run build`
  - Ghi nhận: thời gian build (ước lượng) + cảnh báo bundle (nếu có)
- **Runtime sanity (manual quick check)**:
  - `npm run dev` và kiểm tra nhanh: không layout shift lớn, không lag obvious ở trang liên quan

Nếu phát hiện issue hiệu năng **nhỏ và rẻ** (quick win) thì fix ngay.

## 7. Quick fixes vs Tech Debt (BẮT BUỘC)

- **Fix ngay (cheap fixes)** nếu:
  - 1–2 file, thay đổi nhỏ, rõ nguyên nhân, rủi ro thấp.
  - Ví dụ: className sai token, missing memoization nhỏ, selector ổn định.
- **Ghi thành nợ kỹ thuật (tech debt)** nếu:
  - Cần refactor nhiều file / thay đổi kiến trúc / có nguy cơ breaking lớn.
  - Không được “lén refactor” trong PR fix nhỏ.
- Khi có tech debt:
  - Tạo mục “Tech Debt” trong PR description, liệt kê file & đề xuất plan ngắn.

## 8. Guardrails bắt buộc (theo `RULES.md` và `RULES_BUG_FIX.md`)

- **Đọc bắt buộc**: Kiểm tra `RULES_BUG_FIX.md` trước khi implement để không lặp lại các bug đã biết.
- Mobile-first, touch targets ≥ 44px.
- Không horizontal overflow.
- Toast/redirect đúng chuẩn (401/403/500).
- TypeScript strict, **no `any`**.
- Shadcn UI first.
- Optimistic updates cho mutations (TanStack Query) khi có data mutation.

## 9. Lệnh thường dùng trong repo (tham chiếu)

- `npm run lint`
- `npm test`
- `npm run build`

## 10. Definition of Ready for Review

- [ ] TDD: có tests chứng minh hành vi, không chỉ manual testing.
- [ ] Coverage ≥ 80%.
- [ ] `npm test` pass.
- [ ] `npm run lint` pass.
- [ ] `npm run build` pass.
- [ ] Performance scan đã chạy và có ghi nhận kết quả.
- [ ] **Tính toàn vẹn cấu trúc**: Đã kiểm tra đóng tất cả thẻ HTML/JSX đầy đủ và đúng thứ tự, tránh vỡ layout.
- [ ] Nếu có tech debt: đã ghi rõ trong PR.
- [ ] Bug Fix RCA: Đã cập nhật mục RCA vào TaskXXX.md (nếu là task sửa bug).
- [ ] **Báo lại PM**: *"DEV done. Coverage: XX%. Build: ✅. Lint: ✅. Task UNIT/FEATURE/E2E hoàn thành."*

## 11. Bug Fix & RCA (Root Cause Analysis) - BẮT BUỘC

Khi thực hiện task sửa bug, Developer PHẢI cập nhật vào file `TASKS/TaskXXX.md` mục sau:

```markdown
### 💡 Root Cause Analysis (RCA)
- **Symptom:** Mô tả ngắn gọn hiện tượng lỗi.
- **Root Cause:** Tại sao lỗi này xảy ra? (Lỗi logic, thiếu kiểm tra, dùng sai token...).
- **Lesson Learned:** Quy tắc mới cần áp dụng để tránh lỗi này.
```

Điều này giúp Agent DOC_SYNC thu thập kiến thức vào `RULES_BUG_FIX.md`.

---

## 12. Khi làm **Spring Boot** (`backend/smart-erp`)

- Đọc hướng dẫn riêng: **[`../../backend/AGENTS/DEVELOPER_AGENT_INSTRUCTIONS.md`](../../backend/AGENTS/DEVELOPER_AGENT_INSTRUCTIONS.md)** (TDD Maven/JUnit, Flyway, package modular, **quy tắc coding ưu tiên tốc độ**).
- Lệnh: `./mvnw.cmd verify` trong `backend/smart-erp` (Windows); không dùng `npm test` cho Java.
- Vẫn giữ **TDD + coverage gate** tương đương mục 4–5 của file này; công cụ coverage backend là **JaCoCo** (khi đã cấu hình `pom.xml`).

