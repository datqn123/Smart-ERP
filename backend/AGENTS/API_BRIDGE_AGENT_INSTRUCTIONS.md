# Agent — API Bridge (Backend ↔ Frontend)

> **Mã gọi:** `API_BRIDGE`  
> **Mục tiêu:** Một phiên = **một Task / một endpoint** — đọc **một** tài liệu hướng dẫn nối FE, rồi làm việc dưới **`frontend/mini-erp/`** (nối client ↔ spec ↔ BE khi cần).  
> **Thiết kế phi:** bắt buộc **đọc guide FE trước** + **ít file sau đó** + bảng **`BRIDGE_*`** → **đốt ít token**.

---

## 1. Prompt vào (Owner / điều phối — copy một khối)

```text
API_BRIDGE | Task=<TaskXXX> | Path=/api/v1/... | Mode=verify|wire-fe|fix-doc|fix-fe|fix-be
```

**Prompt đầy đủ (Cursor + `@`):** xem **mục 7**.

| Mode | Hành vi |
| :--- | :--- |
| **`verify`** | Đối chiếu doc ↔ BE ↔ file FE đã có; xuất / cập nhật `BRIDGE_*.md` — **không** sửa code nếu Owner không yêu cầu. |
| **`wire-fe`** | Giống `verify` + **sửa/tạo code** chỉ dưới `frontend/mini-erp/src/**` theo **Bước 0** + **Định vị UI** + **Luồng nối dây** (tuân `FE_API_CONNECTION_GUIDE.md`). |
| `fix-doc` / `fix-fe` / `fix-be` | Sửa **tối thiểu** loại file đã chỉ ra trong bảng `BRIDGE_*` hoặc ticket. |

---

## 2. Bước 0 — **Một** tài liệu Frontend (bắt buộc trước khi vào `frontend/`)

**Luôn đọc đầu tiên (mọi Mode có chạm FE):**

[`frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md`](../../frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md)

- File này quy định: `VITE_API_BASE_URL`, layout `src/lib/api/`, `apiJson`, `features/*/api`, envelope, Bearer — **không** tự đặt quy ước khác trong phiên.  
- Sau khi đọc xong mới `Grep` / `Read` thêm trong `frontend/mini-erp/src`.

---

## 2b. Định vị file giao diện (trước `wire-fe` / khi bảng `BRIDGE_*` thiếu cột FE)

**Một file index (ưu tiên đọc thay vì `Glob` cả `features/`):**

[`frontend/mini-erp/src/features/FEATURES_UI_INDEX.md`](../../frontend/mini-erp/src/features/FEATURES_UI_INDEX.md)

| Cách biết màn cần sửa | Làm gì |
| :--- | :--- |
| Owner / ticket ghi **URL** (vd. `/inventory/stock`) | Tra **bảng 1** trong index → `.../pages/*.tsx` |
| Chỉ ghi **tên menu** tiếng Việt | Mở **một** file [`frontend/mini-erp/src/components/shared/layout/Sidebar.tsx`](../../frontend/mini-erp/src/components/shared/layout/Sidebar.tsx) — `label` → `path` → lại **bảng 1** |
| Cần **dialog / bảng** (không phải cả page) | Tra **bảng 2** theo feature trong index → `Read` đúng `components/*.tsx` |
| Đã biết **path API** (`/api/v1/...`) | `Grep` chuỗi path (hoặc slug) trong `frontend/mini-erp/src` — nếu **chưa** có hit, map prefix → feature (bảng dưới) rồi chỉ mở `features/<feature>/api/*.ts` + page/component từ index |

**Map nhanh prefix → thư mục feature** (khi doc/task không nói rõ màn hình):

| Prefix / nhóm (ví dụ) | Thư mục `features/` |
| :--- | :--- |
| `/api/v1/auth/...` | `auth/` |
| Tồn kho, nhập/xuất, kiểm kê, vị trí kho | `inventory/` |
| Danh mục / sản phẩm / NCC / khách hàng | `product-management/` |
| Đơn bán lẻ / sỉ / trả hàng | `orders/` |
| Duyệt | `approvals/` |
| Thu chi / nợ / sổ | `cashflow/` |
| Báo cáo doanh thu / top SP | `analytics/` |
| AI chat | `ai/` |
| Cửa hàng, nhân viên, cảnh báo, log | `settings/` |

---

## 2c. Luồng nối endpoint vào UI (thứ tự bắt buộc)

1. **`features/<domain>/api/<name>.ts`** — hàm gọi `apiJson` (path đúng spec, method, body/query). **Không** gọi `fetch` trực tiếp trong component.  
2. **Page hoặc component** đã định vị (bảng 1/2 index hoặc grep) — `import` hàm API, gọi trong handler (`onSubmit`, `useMutation`, v.v.), xử lý lỗi theo `FE_API_CONNECTION_GUIDE.md`.  
3. Nếu nhiều màn dùng chung một API — giữ hàm trong **một** file `api/*.ts`, component chỉ import.

**Sau `wire-fe`:** cột *Frontend* trong `BRIDGE_*.md` phải ghi **đủ** `api/*.ts` **và** file UI đã móc (page hoặc component).

---

## 3. Bước 1–3 — Luồng ngắn (sau guide)

| Bước | Hành động | Giới hạn |
| :---: | :--- | :--- |
| **1** | `Read` `frontend/docs/api/API_TaskXXX_*.md` — **chỉ** phần endpoint + request/response/error liên quan `Path`. **Nếu có:** `Read` **một** trong hai — `frontend/docs/api/endpoints/TaskXXX.md` (bảng link) **hoặc** trực tiếp `frontend/docs/api/samples/TaskXXX/<slug>.request.json` + `.response.*.json` cho đúng `Path` (shape nhanh, ít token). | 1–3 file |
| **2** | (Nếu cần BE) `Grep` chuỗi `Path` trong `backend/smart-erp/src/main/java` → `Read` **1** controller (và **1** DTO nếu doc liệt kê field chi tiết). | ≤ 2 file |
| **3** | **`wire-fe`:** (1) `Read` **FEATURES_UI_INDEX** nếu chưa biết file UI; (2) `Grep` `Path` trong `frontend/mini-erp/src` (`*.ts`, `*.tsx`); (3) sửa/tạo **`features/<domain>/api/*.ts`** trước, rồi page/component — **không** `Glob` cả `features/` nếu index + grep đã đủ. | Theo grep |

**Không** đọc SRS đầy đủ, `schema.sql` full, hay toàn bộ `node_modules`.

---

## 4. Nhánh phụ (chọn khi **không** `wire-fe` — chỉ đối chiếu)

### Nhánh C — Envelope / mã lỗi

| Bước | File | Số file |
| :---: | :--- | :---: |
| 1 | `frontend/docs/api/API_RESPONSE_ENVELOPE.md` (mục liên quan) | 1 |
| 2 | `backend/smart-erp/.../ApiErrorCode.java` **hoặc** `GlobalExceptionHandler` | 1 |

---

## 5. Output bắt buộc — `BRIDGE_*.md`

**Đường dẫn:** `frontend/docs/api/bridge/BRIDGE_TaskXXX_<slug>.md`

**Nội dung tối thiểu:**

1. Dòng đầu: `Task`, `Path`, `Mode`, `Date`.  
2. Dòng: *Đã đọc `FE_API_CONNECTION_GUIDE.md` (Y/N)*.  
3. **Một bảng** | Hạng mục | API doc (mục) | Backend (file) | Frontend (`api/*.ts` + UI) | Khớp (Y/N) | Hành động |  
4. Tối đa **5 dòng** kết luận.

---

## 6. Phân ranh giới

| Agent | Khi nào |
| :--- | :--- |
| **API_BRIDGE** | Một endpoint — đọc **guide FE** → (spec + **endpoints/** + **samples/** khi có) → nối / đối chiếu + `BRIDGE_*`. |
| **DOC_SYNC** | Rà drift sau sprint; **bộ contract** mục **2a** (`endpoints/`, `samples/`, đồng bộ Postman) để API_BRIDGE không thiếu file mẫu. |
| **TESTER** | Postman 3 file + manual AC. |

---

## 7. Prompt mẫu (Cursor — copy nguyên khối)

**Nguyên tắc:** một phiên = **một** `Path`; `@` chỉ file cần thiết — tránh attach cả thư mục `docs/api/`.

### 7.1 Tối thiểu (chỉ đối chiếu + `BRIDGE_*`, không sửa code)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task003 | Path=/api/v1/auth/refresh | Mode=verify

Đọc theo thứ tự: @frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md → @frontend/docs/api/endpoints/Task003.md (hoặc @frontend/docs/api/samples/Task003/) → @frontend/docs/api/API_Task003_auth_refresh.md (chỉ mục endpoint refresh).

Output: cập nhật hoặc tạo @frontend/docs/api/bridge/BRIDGE_Task003_refresh.md đúng mục 5.
```

### 7.2 Nối dây FE (`wire-fe`) — có UI (auth / form)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task001 | Path=/api/v1/auth/login | Mode=wire-fe

Context UI: route /login (form đăng nhập).

Đọc: @frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md → @frontend/mini-erp/src/features/FEATURES_UI_INDEX.md → @frontend/docs/api/endpoints/Task001.md → @frontend/docs/api/API_Task001_login.md (phần login).

Thực hiện: apiJson + features/auth/api + móc vào component đúng index; không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task001_login.md.
```

### 7.3 Nối dây FE — ít UI (refresh / interceptor, không cần bảng route)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task003 | Path=/api/v1/auth/refresh | Mode=wire-fe

Đọc: @frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md → @frontend/docs/api/endpoints/Task003.md → @frontend/docs/api/samples/Task003/refresh.request.json và refresh.response.200.json → grep Path trong @frontend/mini-erp/src (chỉ file trúng).

Output: @frontend/docs/api/bridge/BRIDGE_Task003_refresh.md.
```

### 7.4 Một dòng lệnh (khi đã quen thứ tự trong file này)

```text
API_BRIDGE | Task=Task002 | Path=/api/v1/auth/logout | Mode=verify
```

---

## 8. Không làm

- Không bỏ qua **Bước 0** (`FE_API_CONNECTION_GUIDE.md`) khi sửa code trong `frontend/mini-erp/`.  
- Không thiết kế API mới (**API_SPEC** / BA).  
- Không refactor ngoài phạm vi `Mode` / ticket.
