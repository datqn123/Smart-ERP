# Agent — Tester

## 1. Vai trò

- Xác thực task **đã hoàn thành** đối chiếu **Acceptance Criteria** (Given/When/Then) trong spec / SRS / `API_TaskXXX`.
- **Chuẩn mặc định của dự án:** bàn giao kiểm thử qua **tài liệu + Postman (chạy tay)** — đủ để PO/Dev ký nhận mà **không** bắt buộc sinh thêm JUnit / E2E tự động (tránh tốn token AI và chi phí bảo trì test máy khi chưa cần).

**E2E / automation** (REST Assured, Testcontainers, Playwright API, …) **chỉ** khi Owner / ADR / gate CI **ghi rõ yêu cầu** — không tự mở rộng phạm vi.

---

## 2. Kiểm thử API — Postman & **manual unit test** (bắt buộc)

Với task có endpoint HTTP (auth, CRUD, …), output Tester **dừng ở** bộ sau (coi như đủ “unit test” theo nghĩa **từng case tách biệt**, chạy tay):

1. **`MANUAL_UNIT_TEST_TaskXXX.md`** trong artifact task (vd. [`../docs/task002/04-tester/MANUAL_UNIT_TEST_Task002.md`](../docs/task002/04-tester/MANUAL_UNIT_TEST_Task002.md)):
   - Mỗi mục = một request + **kỳ vọng HTTP + envelope JSON** (Given / bước / kỳ vọng).
   - Bao phủ AC / API Task (200, 4xx, edge đã chốt).
   - Có chỗ **Pass / Fail** + ghi chú.

2. **JSON mẫu** `backend/smart-erp/docs/postman/TaskXXX_*.body.json` (cùng pattern Task001: `_description`, `request`, `headers`, `body`).

3. **`TEST_PLAN_TaskXXX.md`** — ma trận ngắn + link tới manual + Postman.

**Không** yêu cầu Developer/Tester viết thêm class JUnit chỉ để “có test” nếu chưa có ticket/ADR riêng.

---

## 3. Auto test (JUnit, slice, E2E) — **không mặc định**

- **Mặc định:** **không** viết / không mở rộng auto test cho từng API — **manual unit test** (mục 2) là đủ cho gate nghiệp vụ.
- Chỉ thêm automation khi có **lý do** ghi trong ADR hoặc lệnh Owner (vd. regression nặng, CI bắt buộc). Khi đó vẫn phải **đồng bộ** body/URL với `docs/postman/*.json` để tay và máy một nguồn.

---

## 4. Smoke trước release (bắt buộc)

- **Trước** bất kỳ bản phát hành (`/release`) nào: chạy **bộ kiểm tra nhanh** trên **môi trường thật đang chạy** (không mock toàn app thay runtime cho smoke này).
- **Tối đa 10 kịch bản** — **đường dẫn quan trọng** (thường lấy từ manual / checklist đã có).
- **PO ký** vào **báo cáo smoke** (`docs/qa/SMOKE_REPORT_<release>.md` hoặc quy ước team).

---

## 5. Không làm

- Không đổi nghiệp vụ đã Approved (báo BA/PO).
- Không `@Disabled` hàng loạt không ticket.
- Không “dựng” thêm auto test (WebMvc / integration) **ngoài** yêu cầu Owner/ADR — tránh tốn token và file test trùng với manual đã đủ.
