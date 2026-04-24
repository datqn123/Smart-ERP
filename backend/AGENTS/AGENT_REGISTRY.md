# Registry — Agent `backend/smart-erp`

> **Workflow**: [`WORKFLOW_RULE.md`](WORKFLOW_RULE.md) — đọc trước khi điều phối.

| Mã gọi | Vai trò | Hướng dẫn |
| :--- | :--- | :--- |
| `BA` | Business Analyst | [`BA_AGENT_INSTRUCTIONS.md`](BA_AGENT_INSTRUCTIONS.md) |
| `PM` | Project Manager | [`PM_AGENT_INSTRUCTIONS.md`](PM_AGENT_INSTRUCTIONS.md) |
| `TECH_LEAD` | Tech Lead | [`TECH_LEAD_AGENT_INSTRUCTIONS.md`](TECH_LEAD_AGENT_INSTRUCTIONS.md) |
| `DEVELOPER` | Developer | [`DEVELOPER_AGENT_INSTRUCTIONS.md`](DEVELOPER_AGENT_INSTRUCTIONS.md) |
| `TESTER` | Tester / QA automation | [`TESTER_AGENT_INSTRUCTIONS.md`](TESTER_AGENT_INSTRUCTIONS.md) |
| `CODEBASE_ANALYST` | Codebase Analyst (brownfield) | [`CODEBASE_ANALYST_AGENT_INSTRUCTIONS.md`](CODEBASE_ANALYST_AGENT_INSTRUCTIONS.md) |
| `DOC_SYNC` | Doc Sync | [`DOC_SYNC_AGENT_INSTRUCTIONS.md`](DOC_SYNC_AGENT_INSTRUCTIONS.md) |

### Output chính (tham chiếu repo)

| Agent | Artifact |
| :--- | :--- |
| BA | SRS / spec kỹ thuật (`frontend/docs/srs/`, `docs/srs/` — thống nhất team) |
| PM | `TASKS/Task*.md` + nhánh `develop` |
| Tech Lead | `docs/adr/ADR-*.md` |
| Developer | `backend/smart-erp/src/**` + test |
| Tester | `src/test/**`, `backend/smart-erp/docs/postman/*.json`, smoke checklist |
| Codebase Analyst | `backend/AGENTS/briefs/CODEBASE_ANALYST_*.md` (+ 7 deliverable greenfield) |
| Doc Sync | `docs/sync_reports/SYNC_REPORT_*.md` |
