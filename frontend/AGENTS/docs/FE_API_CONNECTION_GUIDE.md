# Hướng dẫn Frontend kết nối API Backend (`mini-erp`)

> **Đối tượng:** Agent **`API_BRIDGE`**, Dev FE — đọc **file này trước** mỗi phiên nối dây API.  
> **Chân lý hợp đồng:** [`../../docs/api/API_RESPONSE_ENVELOPE.md`](../../docs/api/API_RESPONSE_ENVELOPE.md) + từng [`../../docs/api/API_TaskXXX_*.md`](../../docs/api/).

---

## 1. Phạm vi repo

| Mục | Giá trị |
| :--- | :--- |
| App | `frontend/mini-erp/` (Vite + React) |
| Base URL | Biến môi trường **`VITE_API_BASE_URL`** (vd. `http://localhost:8080`) — **không** có slash cuối. |
| Prefix API | `/api/v1` — nằm trong path từng call (đã ghi trong spec). |

---

## 2. Cấu trúc thư mục (bắt buộc tuân theo)

| Vị trí | Nội dung |
| :--- | :--- |
| `mini-erp/src/lib/api/config.ts` | `getApiBaseUrl()` — đọc `import.meta.env.VITE_API_BASE_URL`, fallback dev `http://localhost:8080`. |
| `mini-erp/src/lib/api/http.ts` | `apiJson<T>(path, init?)` — `fetch` JSON, parse envelope `{ success, data, message }` / lỗi; ném `ApiRequestError`. |
| `mini-erp/src/features/<domain>/api/*.ts` | Hàm theo endpoint (vd. `postLogin`, `postRefresh`) — **chỉ** gọi `apiJson`, không nhân đôi logic fetch. |

**Không** scatter `fetch("http://localhost:8080/...")` trong component — luôn qua `apiJson` + `getApiBaseUrl`.

---

## 3. Envelope (parse & lỗi)

- **2xx + body `success: true`:** trả về `data` (generic `T`).  
- **`success: false`** hoặc HTTP không 2xx có JSON lỗi: ném `ApiRequestError` với `status`, `body` (`error`, `message`, `details?`).  
- **401 / 403:** component hoặc router có thể `clearSession()` và redirect `/login` (bổ sung từng feature).

**400 + `details`:** map key → field form (`react-hook-form` `setError(field, { message })`).

---

## 4. Auth & header Bearer

| Endpoint | Bearer |
| :--- | :--- |
| `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh` | Không |
| `POST /api/v1/auth/logout`, các API khác | `Authorization: Bearer <accessToken>` |

Lưu token (tối thiểu MVP): `sessionStorage` keys `accessToken`, `refreshToken` — hoặc module `authSession` nếu đã tách.

**Helper (gợi ý):** trong `http.ts`, nếu `init.withCredentials` / option `auth: true` thì gắn header Bearer từ `sessionStorage`.

---

## 5. Checklist sau khi nối một endpoint

1. Path + method khớp `API_TaskXXX_*.md`.  
2. Request body camelCase khớp DTO BE.  
3. Xử lý `details` cho form (400).  
4. `npm run build` (hoặc `npm test` nếu có test feature).  
5. Ghi một dòng vào `frontend/docs/api/bridge/BRIDGE_TaskXXX_*.md` (agent **API_BRIDGE**).

---

## 6. Mẫu gọi (tham chiếu code)

- HTTP layer: `src/lib/api/http.ts`  
- Auth API: `src/features/auth/api/authApi.ts`  
- Form login: `src/features/auth/components/LoginForm.tsx` gọi `postLogin`.

---

## 7. Tiết kiệm token (Agent)

Chỉ đọc **file này** + **một** `API_TaskXXX_*.md` liên quan + file code đang sửa; không đọc toàn bộ `docs/api/`.

**Tìm đúng màn / component trước khi móc API:** [`mini-erp/src/features/FEATURES_UI_INDEX.md`](../../mini-erp/src/features/FEATURES_UI_INDEX.md) (route → page; bảng 2 → `components/`). **Shape request/response tĩnh:** [`docs/api/endpoints/`](../../docs/api/endpoints/) + [`docs/api/samples/`](../../docs/api/samples/) (Doc Sync tạo / duy trì theo [`backend/AGENTS/DOC_SYNC_AGENT_INSTRUCTIONS.md`](../../../backend/AGENTS/DOC_SYNC_AGENT_INSTRUCTIONS.md) mục **2a**). Agent **`API_BRIDGE`** tuân [`backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md`](../../../backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md) mục **2b–2c** và **Bước 1** (đọc thêm index + JSON khi có).
