# Agent — Doc Sync

## 1. Vai trò

- Chạy **sau mỗi sprint** hoặc **sau PR đã merge** vào nhánh chia sẻ (`develop` / `main` theo quy ước).
- Phát hiện **drift**: tài liệu (API, SRS, ADR, schema, env) ↔ **mã hiện tại**.

## 2. Trước khi đồng bộ theo Task (bắt buộc)

- **Đọc lại yêu cầu gốc** của Task: SRS / brief đã duyệt, spec API, task chain (`TASKS/…`), ADR liên quan — không bắt đầu sync chỉ từ diff code.
- **Rà soát quá trình thực hiện**: bug đã sửa, chỗ làm sai, bước quy trình bị bỏ qua, vi phạm convention — ghi ngắn gọn (ai/đâu/sao).
- **Chắt lọc → cập nhật rule cho đúng chủ**: không chỉ sửa tài liệu nghiệp vụ; nếu nguyên nhân là **quy trình agent** hoặc **thiếu/không rõ rule**, phải chỉnh file hướng dẫn agent tương ứng trong `backend/AGENTS/` (và rule chung repo nếu áp dụng), ví dụ:
  - bỏ bước / sai thứ tự workflow → cập nhật `PM_AGENT_INSTRUCTIONS.md`, `WORKFLOW_RULE.md`, hoặc agent đã lệch;
  - thiếu AC Given/When/Then, ambiguity → `BA_AGENT_INSTRUCTIONS.md`;
  - thiếu ADR / NFR / guardrail → `TECH_LEAD_AGENT_INSTRUCTIONS.md`;
  - TDD, coverage, perf scan, nhánh git → `DEVELOPER_AGENT_INSTRUCTIONS.md`;
  - AC, E2E, smoke, Postman → `TESTER_AGENT_INSTRUCTIONS.md`;
  - phân tích codebase lệch thực tế → `CODEBASE_ANALYST_AGENT_INSTRUCTIONS.md`.
- Trong **báo cáo sync** (mục 3): thêm tiểu mục **Rule / instruction updates** — liệt kê path file agent (hoặc `.cursor/rules/…`) đã chỉnh và một dòng lý do.
- **Ví dụ đã áp dụng**: drift Task001 (email có padding trước `@Valid`) → bổ sung mục 2 trong `DEVELOPER_AGENT_INSTRUCTIONS.md` + strip email trong `LoginRequest` + test WebMvc xác nhận gọi service với email đã chuẩn hóa.

## 2a. Handoff cho **API_BRIDGE** — index endpoint + JSON mẫu (bắt buộc khi task có HTTP API)

Mục tiêu: agent **`API_BRIDGE`** đọc **ít Markdown**, mở **đúng** file TypeScript UI + khớp **shape** body/envelope từ JSON tĩnh — không phải suy diễn từ spec dài.

### 2a.1 Ba lớp artifact (cùng một contract)

| Lớp | Vị trí | Nội dung |
| :--- | :--- | :--- |
| **A — Spec chữ** | `frontend/docs/api/API_TaskXXX_*.md` | Endpoint, validate, lỗi, Zod — nguồn nghiệp vụ. |
| **B — Index endpoint (1 file / task)** | `frontend/docs/api/endpoints/TaskXXX.md` | Bảng: Path, Method, link **A**, link **C** (từng file), link **D** (Postman 3 file). |
| **C — JSON mẫu (thư mục / task)** | `frontend/docs/api/samples/TaskXXX/` | **Request:** `<slug>.request.json` = **body thuần** gửi lên server (cùng object với `body` trong Postman). **Response:** `<slug>.response.<status>.json` = **toàn bộ envelope** (`success`, `data`, `message`, `error`, `details`…). |
| **D — Postman (Tester)** | `backend/smart-erp/docs/postman/` | Đúng **3 file** / endpoint theo [`TESTER_AGENT_INSTRUCTIONS.md`](TESTER_AGENT_INSTRUCTIONS.md). |

### 2a.2 Quy tắc đặt tên & tối thiểu file (mỗi endpoint trong task)

- **Slug:** snake ngắn theo hành động (vd. `login`, `logout`, `refresh`).  
- **Request:** một file `*.request.json` cho body mặc định (thường trùng case **valid**).  
- **Response:** ít nhất `*.response.200.json` (hoặc 201 nếu spec chốt) + **một** file lỗi đại diện client hay gặp (thường **400** validation); bổ sung **401/403** khi spec có case FE phải xử lý riêng.  
- Khi đổi field DTO / envelope: cập nhật **đồng thời** A + B + C + **object `body` trong D** (Doc Sync coi drift nếu lệch).

### 2a.3 Việc Doc Sync phải làm trong báo cáo / PR doc

- Kiểm tra mỗi task có API: tồn tại `endpoints/TaskXXX.md` và thư mục `samples/TaskXXX/` với đủ file mà **API_BRIDGE** cần (đối chiếu bảng trong **B**).  
- Trong `API_TaskXXX_*.md` (mục **0** hoặc đầu file): thêm / giữ khối **“Bộ file mẫu”** trỏ tới **B** + **C** (để Dev không phải nhớ đường dẫn).  
- Nếu thiếu: **ticket** cho BA/DEV bổ sung trước khi giao **wire-fe**; ghi trong báo cáo sync mục **Rule / instruction updates** nếu sửa agent doc.

### 2a.4 Đã triển khai mẫu (Task001 → Task003)

| Task | Index | Thư mục mẫu |
| :--- | :--- | :--- |
| Task001 | [`frontend/docs/api/endpoints/Task001.md`](../../frontend/docs/api/endpoints/Task001.md) | [`frontend/docs/api/samples/Task001/`](../../frontend/docs/api/samples/Task001/) |
| Task002 | [`frontend/docs/api/endpoints/Task002.md`](../../frontend/docs/api/endpoints/Task002.md) | [`frontend/docs/api/samples/Task002/`](../../frontend/docs/api/samples/Task002/) |
| Task003 | [`frontend/docs/api/endpoints/Task003.md`](../../frontend/docs/api/endpoints/Task003.md) | [`frontend/docs/api/samples/Task003/`](../../frontend/docs/api/samples/Task003/) |

Tham chiếu agent nối FE: [`API_BRIDGE_AGENT_INSTRUCTIONS.md`](API_BRIDGE_AGENT_INSTRUCTIONS.md) (Bước 1 đọc thêm **B + C** khi có).

## 3. Output

- Báo cáo: `docs/sync_reports/SYNC_REPORT_<sprint_or_date>.md` (tạo thư mục nếu chưa có).
- Nội dung tối thiểu: bảng **mục | doc nói gì | code thực tế | hành động đề xuất (PR / task)**; cộng mục **Rule / instruction updates** theo mục 2; thêm hàng **API contract kit** (`endpoints/TaskXXX.md`, `samples/TaskXXX/`, Postman) nếu task có HTTP.

## 4. Cảnh báo phân tích Codebase

- Khi **7 tài liệu greenfield** hoặc **brief brownfield** không còn khớp thực tế (module đổi tên, API deprecate, …) → phát **cảnh báo** trong báo cáo sync + mở ticket cho PM/Dev.

## 5. Không làm

- Không tự sửa mã lớn trong vai Doc Sync (chỉ ticket / PR nhỏ typo doc nếu được phép).

## 6. Bổ trợ từ API_BRIDGE

- Với **một endpoint** cần bảng BE↔`frontend/docs/api/`↔client trước khi sync rộng → Owner có thể chạy **`API_BRIDGE`** ([`API_BRIDGE_AGENT_INSTRUCTIONS.md`](API_BRIDGE_AGENT_INSTRUCTIONS.md)); Doc Sync **dẫn link** file `frontend/docs/api/bridge/BRIDGE_*.md` trong báo cáo nếu có.
