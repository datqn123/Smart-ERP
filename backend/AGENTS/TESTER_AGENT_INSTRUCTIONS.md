# Agent — Tester

## 1. Vai trò

- Xác thực task **đã hoàn thành** đối chiếu **Acceptance Criteria** (Given/When/Then) trong spec / SRS / `API_TaskXXX`.
- **Chuẩn mặc định của dự án:** bàn giao kiểm thử qua **tài liệu + Postman (chạy tay)** — đủ để PO/Dev ký nhận mà **không** bắt buộc sinh thêm JUnit / E2E tự động (tránh tốn token AI và chi phí bảo trì test máy khi chưa cần).

**E2E / automation** (REST Assured, Testcontainers, Playwright API, …) **chỉ** khi Owner / ADR / gate CI **ghi rõ yêu cầu** — không tự mở rộng phạm vi.

---

## 2. Kiểm thử API — **3 file Postman envelope** + manual + test plan (bắt buộc)

Với task có **ít nhất một endpoint HTTP** (auth, CRUD, …), output Tester **dừng ở** bộ artifact sau. Đây là đủ “**manual unit test**” theo nghĩa **từng case tách biệt**, chạy tay.

### 2.1 Ba file JSON Postman (nguồn chân lý request)

Đặt dưới **`backend/smart-erp/docs/postman/`**, đặt tên theo task, **đúng 3 file** (mỗi file = một kịch bản request tối thiểu):

| # | File (pattern) | Nội dung nghiệp vụ |
| :---: | :--- | :--- |
| 1 | `TaskXXX_<slug>.valid.body.json` | Request **thành công** (200/201…) — body đủ field, giá trị mẫu hoặc placeholder có `_description` hướng dẫn thay. |
| 2 | `TaskXXX_<slug>.invalid.missing-<field>.body.json` | Case **400** — thiếu field bắt buộc (vd. body `{}` hoặc thiếu key). |
| 3 | `TaskXXX_<slug>.invalid.<rule>.body.json` | Case **400** (hoặc 4xx khác đã chốt) — **khác** file (2): vd. rỗng, format sai, quá ngắn. |

**Schema bắt buộc** (chốt theo mẫu [`Task001_login.valid.body.json`](../smart-erp/docs/postman/Task001_login.valid.body.json)):

```json
{
  "_description": "…",
  "request": {
    "method": "POST",
    "path": "/api/v1/…",
    "url": "http://localhost:8080/api/v1/…"
  },
  "headers": {
    "Content-Type": "application/json"
  },
  "body": { }
}
```

- **`_description`:** tiếng Việt — mục đích file, seed / bước chuẩn bị, HTTP mong đợi.  
- **`request`:** `method`, `path` (bắt đầu `/api/…`), `url` (localhost mẫu, **phải** kết thúc bằng cùng `path`).  
- **`headers`:** tối thiểu `Content-Type: application/json`; thêm Bearer nếu endpoint cần.  
- **`body`:** object gửi thật lên server (Postman: copy vào tab **Body**).

**Khi chạy tay:** import hoặc mở từng file → copy **`headers` + `body`** vào request Postman; chỉnh `url` theo `{{baseUrl}}` nếu env khác localhost.

**Contract CI (Dev):** với task auth đã làm mẫu, có class `*PostmanBodyContractTest` trong `src/test/.../auth/api/` để **khóa** 3 file JSON không bị sửa nhầm shape (tham chiếu `Task001LoginPostmanBodyContractTest`, `Task003RefreshPostmanBodyContractTest`).

### 2.2 `MANUAL_UNIT_TEST_TaskXXX.md`

- Trong artifact task: vd. [`../docs/task003/04-tester/MANUAL_UNIT_TEST_Task003.md`](../docs/task003/04-tester/MANUAL_UNIT_TEST_Task003.md).
- Mỗi mục **U-xx** = một kịch bản + **kỳ vọng HTTP + envelope**; **luôn trỏ** tới đúng một trong **3 file** §2.1 (valid / missing / rule) khi áp dụng.
- Bổ sung case **401 / 403 / 429**… không nhét vào 3 file tĩnh được thì vẫn ghi trong manual (body inline hoặc file bổ sung **ngoài** bộ 3 — cần ghi rõ trong manual và ticket nếu thêm file thứ 4+).

### 2.3 `TEST_PLAN_TaskXXX.md`

- Ma trận ngắn: ID manual ↔ HTTP ↔ link SRS/API ↔ **tên 3 file** Postman (khi map được).
- Link tới `MANUAL_UNIT_TEST_TaskXXX.md` và thư mục `docs/postman/`.

**Không** yêu cầu Developer/Tester viết thêm class JUnit chỉ để “có test” nếu chưa có ticket/ADR riêng — **ngoại lệ:** contract **3 file** envelope (mục 2.1) được khuyến nghị giữ đồng bộ.

---

## 3. Auto test (JUnit, slice, E2E) — **không mặc định**

- **Mặc định:** **không** viết / không mở rộng auto test cho từng API — **manual unit test** (mục 2) là đủ cho gate nghiệp vụ.
- **Luôn có thể có:** test contract **shape** 3 file Postman (`*PostmanBodyContractTest`) — không thay thế chạy tay đầy đủ DB.
- Chỉ thêm automation khác khi có **lý do** ghi trong ADR hoặc lệnh Owner (vd. regression nặng, CI bắt buộc). Khi đó vẫn phải **đồng bộ** `body`/`path` với `docs/postman/*.json` để tay và máy một nguồn.

---

## 4. Smoke trước release (bắt buộc)

- **Trước** bất kỳ bản phát hành (`/release`) nào: chạy **bộ kiểm tra nhanh** trên **môi trường thật đang chạy** (không mock toàn app thay runtime cho smoke này).
- **Tối đa 10 kịch bản** — **đường dẫn quan trọng** (thường lấy từ manual / checklist đã có).
- **PO ký** vào **báo cáo smoke** (`docs/qa/SMOKE_REPORT_<release>.md` hoặc quy ước team).

---

## 5. Không làm

- Không đổi nghiệp vụ đã Approved (báo BA/PO).
- Không `@Disabled` hàng loạt không ticket.
- Không “dựng” thêm auto test (WebMvc / integration) **ngoài** yêu cầu Owner/ADR — tránh tốn token và file test trùng với manual đã đủ; **contract 3 file Postman** (§2.1) **không** tính là mở rộng tùy tiện.
