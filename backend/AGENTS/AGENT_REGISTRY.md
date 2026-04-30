# Registry — `backend/smart-erp` agents

> **Workflow**: [`WORKFLOW_RULE.md`](WORKFLOW_RULE.md) — read this first before orchestrating.

| Call code | Role | Instructions |
| :--- | :--- | :--- |
| `AI_PLANNER` | Requirement Analyst & Architect (Fullstack, PRD-first) | [`../../AGENTS/AI_PLANNER_AGENT_INSTRUCTIONS.md`](../../AGENTS/AI_PLANNER_AGENT_INSTRUCTIONS.md) |
| `BA` | Business Analyst | [`BA_AGENT_INSTRUCTIONS.md`](BA_AGENT_INSTRUCTIONS.md) |
| `SQL` | SQL / Data (schema, performance, integrity, Spring DB) | [`SQL_AGENT_INSTRUCTIONS.md`](SQL_AGENT_INSTRUCTIONS.md) |
| `PM` | Project Manager | [`PM_AGENT_INSTRUCTIONS.md`](PM_AGENT_INSTRUCTIONS.md) |
| `TECH_LEAD` | Tech Lead | [`TECH_LEAD_AGENT_INSTRUCTIONS.md`](TECH_LEAD_AGENT_INSTRUCTIONS.md) |
| `DEVELOPER` | Developer | [`DEVELOPER_AGENT_INSTRUCTIONS.md`](DEVELOPER_AGENT_INSTRUCTIONS.md) |
| `TESTER` | Tester / QA automation | [`TESTER_AGENT_INSTRUCTIONS.md`](TESTER_AGENT_INSTRUCTIONS.md) |
| `CODEBASE_ANALYST` | Codebase Analyst (brownfield) | [`CODEBASE_ANALYST_AGENT_INSTRUCTIONS.md`](CODEBASE_ANALYST_AGENT_INSTRUCTIONS.md) |
| `DOC_SYNC` | Doc Sync | [`DOC_SYNC_AGENT_INSTRUCTIONS.md`](DOC_SYNC_AGENT_INSTRUCTIONS.md) |
| `API_BRIDGE` | API Bridge (BE ↔ FE) — after **G-DEV** when there is REST for mini-erp: [`WORKFLOW_RULE.md`](WORKFLOW_RULE.md) §0.3 §3.1; SRS with multiple paths: [`API_BRIDGE_AGENT_INSTRUCTIONS.md`](API_BRIDGE_AGENT_INSTRUCTIONS.md) §1.1–§1.2 |
| `BUG_INVESTIGATOR` | Bug Investigator (RCA + `Bug_Task*.md`, no code changes) | [`BUG_INVESTIGATOR_AGENT_INSTRUCTIONS.md`](BUG_INVESTIGATOR_AGENT_INSTRUCTIONS.md) |

### Context7 (MCP — library docs, role-dependent)

- General orchestration: [`WORKFLOW_RULE.md`](WORKFLOW_RULE.md) §1.1.  
- Details: `DEVELOPER_AGENT_INSTRUCTIONS.md` §9; `TECH_LEAD_AGENT_INSTRUCTIONS.md` §6; `TESTER_AGENT_INSTRUCTIONS.md` §3; `SQL_AGENT_INSTRUCTIONS.md` §4; `API_BRIDGE_AGENT_INSTRUCTIONS.md` (section 1.1 workflow handoff + section 2, after Step 0).

### Primary outputs (repo references)

| Agent | Artifact |
| :--- | :--- |
| BA | SRS / technical spec — **Spring (`smart-erp`)**: [`../docs/srs/README.md`](../docs/srs/README.md) + template [`../docs/srs/SRS_TEMPLATE.md`](../docs/srs/SRS_TEMPLATE.md); **UI Mini-ERP**: [`../../frontend/docs/srs/README.md`](../../frontend/docs/srs/README.md) |
| SQL | The **Data & reference SQL** section in SRS (co-authored with BA); do not replace BA as the file owner |
| PM | `TASKS/Task*.md` + the `develop` branch |
| Tech Lead | `docs/adr/ADR-*.md` |
| Developer | `backend/smart-erp/src/**` + test |
| Tester | `MANUAL_UNIT_TEST` + `TEST_PLAN` under `docs/taskXXX/04-tester/`, **`docs/postman/TaskXXX_*` — exactly 3 envelope files** (sample: [`smart-erp/docs/postman/Task001_login.valid.body.json`](../smart-erp/docs/postman/Task001_login.valid.body.json)), `*PostmanBodyContractTest` when applicable, smoke checklist |
| Codebase Analyst | `backend/AGENTS/briefs/CODEBASE_ANALYST_*.md` (+ 7 greenfield deliverables) |
| Doc Sync | `docs/sync_reports/SYNC_REPORT_*.md` |
| API Bridge | Read [`frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md`](../../frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md) first; `frontend/docs/api/bridge/BRIDGE_Task*_*.md` + code under `mini-erp/src` when `wire-fe` |
| Bug Investigator | [`../docs/bugs/Bug_Task*.md`](../docs/bugs/Bug_Task*.md) (one file per investigation session, unless the Owner overrides / requests a revision) |
