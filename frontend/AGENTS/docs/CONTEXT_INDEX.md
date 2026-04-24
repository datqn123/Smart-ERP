# CONTEXT INDEX — Đọc tối thiểu theo loại task

> **Vị trí**: `AGENTS/docs/CONTEXT_INDEX.md` — bộ nhớ ngoài cửa sổ cho Agent / dev (tiết kiệm token).  
> **Tài liệu sản phẩm** (UC, DB, SRS, hợp đồng API): vẫn nằm dưới [`docs/`](../docs/README.md).

**Tham chiếu triết lý**: write / select (context engineering) — đồng bộ với kế hoạch context/token của dự án.

---

## 1. Bảng ánh xạ: loại task → tài liệu tối thiểu

| Loại task | Đọc bắt buộc (thứ tự gợi ý) | Chỉ đọc thêm khi… |
| :---------- | :---------------------------- | :---------------- |
| **Sửa UI / feature trong app** | [`RULES.md`](../../RULES.md), [`RULES_BUG_FIX.md`](../../RULES_BUG_FIX.md), file component/route liên quan (`@file` / grep) | Layout hệ thống lạ → [`FUNCTIONAL_SUMMARY.md`](../../FUNCTIONAL_SUMMARY.md) hoặc `mini-erp` README nếu có |
| **Task DEV theo `TASKS/TaskXXX.md`** | File `TASKS/TaskXXX.md`, RULES + RULES_BUG_FIX | Task trỏ tới SRS/PRD → mở đúng path trong task |
| **Thiết kế / sửa tài liệu API** | [`../API_AGENT_INSTRUCTIONS.md`](../API_AGENT_INSTRUCTIONS.md), [`../../docs/api/API_PROJECT_DESIGN.md`](../../docs/api/API_PROJECT_DESIGN.md), `docs/api/API_TaskXXX_*.md` liên quan | Trường DB/constraint → **chỉ** mục bảng liên quan trong [`../../docs/UC/schema.sql`](../../docs/UC/schema.sql) hoặc `Database_Specification` (không đọc full nếu không cần) |
| **Agent Planner — brief mới** | [`../PLANNER_AGENT_INSTRUCTIONS.md`](../PLANNER_AGENT_INSTRUCTIONS.md), [`templates/planner/PLANNER_BRIEF_TEMPLATE.md`](templates/planner/PLANNER_BRIEF_TEMPLATE.md) | Map UC → [`../../docs/api/API_PROJECT_DESIGN.md`](../../docs/api/API_PROJECT_DESIGN.md) §5 |
| **Agent BA (không qua Planner)** | [`../BA_AGENT_INSTRUCTIONS.md`](../BA_AGENT_INSTRUCTIONS.md), [`../WORKFLOW_RULE.md`](../WORKFLOW_RULE.md) | Trụ tương ứng + template trong [`templates/ba/`](templates/ba/) |
| **Agent BA từ Planner Approved** | `AGENTS/docs/planner/PLANNER_BRIEF_TaskXXX_*.md` + cột “DEV/UI” tùy trụ | Như trên |
| **Backend Spring Boot** | [`BACKEND_SPRING_BOOT.md`](BACKEND_SPRING_BOOT.md) + `docs/api/` + `docs/UC/schema.sql` + [`backend/AGENTS/WORKFLOW_RULE.md`](../../../backend/AGENTS/WORKFLOW_RULE.md) + [`backend/AGENTS/AGENT_REGISTRY.md`](../../../backend/AGENTS/AGENT_REGISTRY.md) | Hướng dẫn từng vai: `backend/AGENTS/*_AGENT_INSTRUCTIONS.md` |
| **PM / PM_RUN** | [`../PM_AGENT_INSTRUCTIONS.md`](../PM_AGENT_INSTRUCTIONS.md), `docs/srs/SRS_TaskXXX_*.md` đã Approved | — |
| **Điều phối agent (meta)** | [`../AGENT_REGISTRY.md`](../AGENT_REGISTRY.md) | Chi tiết → [`../FLOW_GUIDE.md`](../FLOW_GUIDE.md) |

---

## 2. Thói quen tiết kiệm token (áp dụng mỗi phiên)

1. **Một phiên — một mục tiêu**; milestone xong → thread mới + handoff (mục 6 trong [`templates/planner/PLANNER_BRIEF_TEMPLATE.md`](templates/planner/PLANNER_BRIEF_TEMPLATE.md) hoặc [`templates/tasks/TASK_SESSION_HANDOFF.md`](templates/tasks/TASK_SESSION_HANDOFF.md)).
2. **Ưu tiên `@file` / `@folder` / symbol**; log chỉ phần lỗi liên quan.
3. **Tắt MCP / skill không dùng** cho task hiện tại.
4. **Plan trước khi implement** (thay đổi lớn).
5. **Không đọc full** `Database_Specification` / `schema.sql` nếu chỉ cần vài cột — grep hoặc offset/limit.

---

## 3. Liên kết nhanh

| Tài liệu | Vai trò |
| :------- | :------ |
| [API_PROJECT_DESIGN.md](../../docs/api/API_PROJECT_DESIGN.md) | Catalog endpoint `/api/v1` (hợp đồng FE + BE) |
| [WORKFLOW_RULE.md](../WORKFLOW_RULE.md) | Gate BA → PM → … |
| [PLANNER_AGENT_INSTRUCTIONS.md](../PLANNER_AGENT_INSTRUCTIONS.md) | Intake + Q&A + brief |

---

## 4. Ghi chú cho Agent tự động

Khi bắt đầu task, in một dòng: *“Theo `AGENTS/docs/CONTEXT_INDEX.md`, loại task = …; chỉ đọc: …”* rồi tuân thủ; chỉ mở rộng khi thiếu dữ liệu.
