# Registry — Agent `backend/smart-erp`

> **Workflow**: [`WORKFLOW_RULE.md`](WORKFLOW_RULE.md) — đọc trước khi điều phối.

| Mã gọi | Vai trò | Hướng dẫn |
| :--- | :--- | :--- |
| `BA` | Business Analyst | [`BA_AGENT_INSTRUCTIONS.md`](BA_AGENT_INSTRUCTIONS.md) |
| `SQL` | SQL / dữ liệu (schema, hiệu năng, toàn vẹn, Spring DB) | [`SQL_AGENT_INSTRUCTIONS.md`](SQL_AGENT_INSTRUCTIONS.md) |
| `PM` | Project Manager | [`PM_AGENT_INSTRUCTIONS.md`](PM_AGENT_INSTRUCTIONS.md) |
| `TECH_LEAD` | Tech Lead | [`TECH_LEAD_AGENT_INSTRUCTIONS.md`](TECH_LEAD_AGENT_INSTRUCTIONS.md) |
| `DEVELOPER` | Developer | [`DEVELOPER_AGENT_INSTRUCTIONS.md`](DEVELOPER_AGENT_INSTRUCTIONS.md) |
| `TESTER` | Tester / QA automation | [`TESTER_AGENT_INSTRUCTIONS.md`](TESTER_AGENT_INSTRUCTIONS.md) |
| `CODEBASE_ANALYST` | Codebase Analyst (brownfield) | [`CODEBASE_ANALYST_AGENT_INSTRUCTIONS.md`](CODEBASE_ANALYST_AGENT_INSTRUCTIONS.md) |
| `DOC_SYNC` | Doc Sync | [`DOC_SYNC_AGENT_INSTRUCTIONS.md`](DOC_SYNC_AGENT_INSTRUCTIONS.md) |
| `API_BRIDGE` | API Bridge (BE ↔ FE) | [`API_BRIDGE_AGENT_INSTRUCTIONS.md`](API_BRIDGE_AGENT_INSTRUCTIONS.md) |

### Output chính (tham chiếu repo)

| Agent | Artifact |
| :--- | :--- |
| BA | SRS / spec kỹ thuật — **Spring (`smart-erp`)**: [`../docs/srs/README.md`](../docs/srs/README.md); **UI Mini-ERP**: [`../../frontend/docs/srs/README.md`](../../frontend/docs/srs/README.md) |
| SQL | Mục **Dữ liệu & SQL tham chiếu** trong SRS (đồng soạn với BA); không thay BA làm owner file |
| PM | `TASKS/Task*.md` + nhánh `develop` |
| Tech Lead | `docs/adr/ADR-*.md` |
| Developer | `backend/smart-erp/src/**` + test |
| Tester | `MANUAL_UNIT_TEST` + `TEST_PLAN` trong `docs/taskXXX/04-tester/`, **`docs/postman/TaskXXX_*` — đúng 3 file envelope** (mẫu [`smart-erp/docs/postman/Task001_login.valid.body.json`](../smart-erp/docs/postman/Task001_login.valid.body.json)), contract `*PostmanBodyContractTest` khi áp dụng, smoke checklist |
| Codebase Analyst | `backend/AGENTS/briefs/CODEBASE_ANALYST_*.md` (+ 7 deliverable greenfield) |
| Doc Sync | `docs/sync_reports/SYNC_REPORT_*.md` |
| API Bridge | Đọc [`frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md`](../../frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md) trước; `frontend/docs/api/bridge/BRIDGE_Task*_*.md` + code `mini-erp/src` khi `wire-fe` |
