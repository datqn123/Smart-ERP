# Agent — Doc Sync

## 1. Role

- Run **after each sprint** or **after PRs are merged** into the shared branch (`develop` / `main` by convention).
- Detect **drift**: docs (API, SRS, ADR, schema, env) ↔ **current code**.

## 2. Before syncing a Task (mandatory)

- **Re-read the original requirement** for the task: Approved SRS/brief, API specs, task chain (`TASKS/…`), relevant ADRs — do not start sync from code diff alone.
- **Review the execution history**: what bugs were fixed, what went wrong, which process steps were skipped, convention violations — record briefly (who/where/why).
- **Distill → update the right owner rule**: do not only patch business docs; if the root cause is **agent workflow** or **missing/unclear rules**, update the corresponding agent instruction file under `backend/AGENTS/` (and shared repo rules if applicable), e.g.:
  - skipped step / wrong workflow order → update `PM_AGENT_INSTRUCTIONS.md`, `WORKFLOW_RULE.md`, or the drifting agent doc;
  - missing Given/When/Then AC, ambiguity → `BA_AGENT_INSTRUCTIONS.md`;
  - missing ADR / NFR / guardrails → `TECH_LEAD_AGENT_INSTRUCTIONS.md`;
  - TDD, coverage, perf scan, git branches → `DEVELOPER_AGENT_INSTRUCTIONS.md`;
  - AC, E2E, smoke, Postman → `TESTER_AGENT_INSTRUCTIONS.md`;
  - codebase analysis diverges from reality → `CODEBASE_ANALYST_AGENT_INSTRUCTIONS.md`.
- In the **sync report** (section 3): add a **Rule / instruction updates** subsection — list updated agent file paths (or `.cursor/rules/…`) and a one-line reason.
- **Applied example**: Task001 drift (email padding before `@Valid`) → added section 2 to `DEVELOPER_AGENT_INSTRUCTIONS.md` + strip email in `LoginRequest` + WebMvc test to confirm the service receives normalized email.

## 2a. Handoff for **API_BRIDGE** — endpoint index + JSON samples (mandatory for HTTP APIs)

Goal: enable **`API_BRIDGE`** to read **less Markdown**, open the **correct** TypeScript UI file(s), and match **body/envelope shapes** from static JSON — rather than inferring from long specs.

### 2a.1 Three layers of artifacts (one contract)

| Layer | Location | Contents |
| :--- | :--- | :--- |
| **A — Text spec** | `frontend/docs/api/API_TaskXXX_*.md` | Endpoint, validation, errors, Zod — business source. |
| **B — Endpoint index (1 file / task)** | `frontend/docs/api/endpoints/TaskXXX.md` | Table: Path, Method, link to **A**, link to **C** (each file), link to **D** (3 Postman files). |
| **C — JSON samples (folder / task)** | `frontend/docs/api/samples/TaskXXX/` | **Request:** `<slug>.request.json` = **raw body** sent to server (same object as `body` in Postman). **Response:** `<slug>.response.<status>.json` = **full envelope** (`success`, `data`, `message`, `error`, `details`…). |
| **D — Postman (Tester)** | `backend/smart-erp/docs/postman/` | Exactly **3 files** per endpoint per [`TESTER_AGENT_INSTRUCTIONS.md`](TESTER_AGENT_INSTRUCTIONS.md). |

### 2a.2 Naming rules & minimum files (per endpoint in a task)

- **Slug:** short action-based snake (e.g. `login`, `logout`, `refresh`).  
- **Request:** one `*.request.json` for the default body (usually matches the **valid** case).  
- **Response:** at least `*.response.200.json` (or 201 if specified) + **one** representative client-facing error file (often **400** validation); add **401/403** when FE must handle them explicitly.  
- When DTO fields / envelope changes: update **A + B + C + the `body` object in D** together (Doc Sync flags drift if they diverge).

### 2a.3 What Doc Sync must do in the report / doc PR

- For each task with APIs: confirm `endpoints/TaskXXX.md` exists and `samples/TaskXXX/` contains the files **API_BRIDGE** needs (per the table in **B**).  
- In `API_TaskXXX_*.md` (section **0** or file header): add/keep a **“Sample file kit”** block pointing to **B** + **C** (so Dev doesn’t need to memorize paths).  
- If missing: open a **ticket** for BA/DEV to add them before handing off **wire-fe**; record it in the sync report under **Rule / instruction updates** if you changed agent docs.

### 2a.4 Implemented examples (Task001 → Task003)

| Task | Index | Samples folder |
| :--- | :--- | :--- |
| Task001 | [`frontend/docs/api/endpoints/Task001.md`](../../frontend/docs/api/endpoints/Task001.md) | [`frontend/docs/api/samples/Task001/`](../../frontend/docs/api/samples/Task001/) |
| Task002 | [`frontend/docs/api/endpoints/Task002.md`](../../frontend/docs/api/endpoints/Task002.md) | [`frontend/docs/api/samples/Task002/`](../../frontend/docs/api/samples/Task002/) |
| Task003 | [`frontend/docs/api/endpoints/Task003.md`](../../frontend/docs/api/endpoints/Task003.md) | [`frontend/docs/api/samples/Task003/`](../../frontend/docs/api/samples/Task003/) |

Reference for FE wiring agent: [`API_BRIDGE_AGENT_INSTRUCTIONS.md`](API_BRIDGE_AGENT_INSTRUCTIONS.md) (in Step 1, also read **B + C** when available).

## 3. Output

- Report: `docs/sync_reports/SYNC_REPORT_<sprint_or_date>.md` (create the folder if missing).
- Minimum content: a table **item | what docs say | what code does | proposed action (PR / task)**; plus **Rule / instruction updates** from section 2; add an **API contract kit** row (`endpoints/TaskXXX.md`, `samples/TaskXXX/`, Postman) when the task has HTTP.

## 4. Codebase analysis warnings

- When the **7 greenfield docs** or a **brownfield brief** no longer matches reality (module renamed, API deprecated, …) → raise a **warning** in the sync report + open a ticket for PM/Dev.

## 5. Do not

- Do not do large code changes as Doc Sync (only tickets / small doc typo PRs if allowed).

## 6. Support from API_BRIDGE

- For **one endpoint** that needs a BE↔`frontend/docs/api/`↔client mapping before a broader sync → the Owner can run **`API_BRIDGE`** ([`API_BRIDGE_AGENT_INSTRUCTIONS.md`](API_BRIDGE_AGENT_INSTRUCTIONS.md)); Doc Sync should **link** `frontend/docs/api/bridge/BRIDGE_*.md` in the report when available.
