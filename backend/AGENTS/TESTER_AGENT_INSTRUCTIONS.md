# Agent — Tester

## 1. Role

- Validate that the task is **done** against **Acceptance Criteria** (Given/When/Then) in the spec / SRS / `API_TaskXXX`.
- **Project default:** hand off testing via **docs + Postman (manual runs)** — sufficient for PO/Dev sign-off and **does not** require additional JUnit / automated E2E by default (avoids AI token burn and test maintenance costs when not needed).

**E2E / automation** (REST Assured, Testcontainers, Playwright API, …) only when the Owner / ADR / CI gate **explicitly requires** it — do not expand scope by default.

---

## 2. API testing — **3 Postman envelope files** + manual + test plan (mandatory)

For any task with **at least one HTTP endpoint** (auth, CRUD, …), the Tester output must stop at the artifact set below. This is sufficient “**manual unit testing**” in the sense of **separate cases**, run manually.

### 2.1 Three Postman JSON files (request source of truth)

Place under **`backend/smart-erp/docs/postman/`**, name by task, **exactly 3 files** (each file = one minimal request scenario):

| # | File (pattern) | Business meaning |
| :---: | :--- | :--- |
| 1 | `TaskXXX_<slug>.valid.body.json` | **Success** request (200/201…) — body contains all fields, with sample values or placeholders; `_description` explains what to change. |
| 2 | `TaskXXX_<slug>.invalid.missing-<field>.body.json` | **400** case — missing required field (e.g. `{}` or missing key). |
| 3 | `TaskXXX_<slug>.invalid.<rule>.body.json` | **400** (or another agreed 4xx) — different from (2): e.g. blank, wrong format, too short. |

**Required schema** (fixed by sample [`Task001_login.valid.body.json`](../smart-erp/docs/postman/Task001_login.valid.body.json); endpoints with JWT: [`Task078_users_post.valid.body.json`](../smart-erp/docs/postman/Task078_users_post.valid.body.json)):

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

- **`_description`:** English — must be **enough for a manual runner to not guess**: task code + case slug; expected HTTP/status; **prerequisites** (profile, `APP_SECURITY_MODE`, Flyway seed, which request must run first — e.g. Task001 login to get token); **manual edits needed** (change `username`/`email`/`staffCode` to avoid 409, timezone if relevant); suggested `roleId` based on seeds for user/role CRUD. Multi-line strings via `\n` are OK for readability.  
- **`request`:** `method`, `path` (starts with `/api/…`), `url` (localhost sample, **must** end with the same `path`).  
- **`headers`:** at minimum `Content-Type: application/json`. Endpoints requiring Bearer JWT (Resource Server): must declare `Authorization` in the file (placeholder like `Bearer <paste-accessToken-from-Task001-login-response.data.accessToken>` or equivalent — name the JSON source field), **not** just mention the token in `_description` while omitting the header.  
- **`body`:** the actual object sent to the server (Postman: paste into **Body** tab — only the `body` object, do not copy `_description`/`request`).

**Manual run:** import/open each file → copy **`headers` + `body`** into a Postman request (or use `request.url`); replace the host via `{{baseUrl}}` if not localhost.

**CI contract (Dev):** for auth tasks with an existing pattern, there is a `*PostmanBodyContractTest` class under `src/test/.../auth/api/` to **lock** the shape of the 3 JSON files (see `Task001LoginPostmanBodyContractTest`, `Task003RefreshPostmanBodyContractTest`).

### 2.2 `MANUAL_UNIT_TEST_TaskXXX.md`

- In the task artifacts: e.g. [`../docs/task003/04-tester/MANUAL_UNIT_TEST_Task003.md`](../docs/task003/04-tester/MANUAL_UNIT_TEST_Task003.md).
- Each **U-xx** item = one scenario + **expected HTTP + envelope**; always reference exactly one of the **3 files** in §2.1 (valid / missing / rule) when applicable — use the **full Postman filename** (e.g. `Task078_users_post.valid.body.json`), not “the valid file”.
- For each manual item: include **prep steps** consistent with the Postman `_description` (token, seed, change fields to avoid 409) so manual and JSON are a **single source of truth**; avoid copying long payloads — reference the file and note only differences (if any).
- Add cases like **401 / 403 / 429**… that cannot fit into the 3 static files into the manual anyway (inline body or extra file **outside** the 3-file set — must be explicitly noted in the manual and ticket if adding a 4th+ file).

### 2.3 `TEST_PLAN_TaskXXX.md`

- A short matrix: manual ID ↔ HTTP ↔ SRS/API link ↔ **3 Postman file names** (when mappable).
- Link to `MANUAL_UNIT_TEST_TaskXXX.md` and the `docs/postman/` folder.

Do **not** require Developer/Tester to add JUnit classes just to “have tests” unless there is a specific ticket/ADR — **exception:** the 3-file envelope **contract** (section 2.1) is recommended to keep synced.

---

## 3. Automated tests (JUnit, slice, E2E) — **not the default**

- **Default:** do **not** write/expand automated tests per API — **manual unit tests** (section 2) are enough for the business gate.
- **Always acceptable:** a contract test that validates the **shape** of the 3 Postman files (`*PostmanBodyContractTest`) — does not replace full manual runs against a real DB.
- Add other automation only with a **reason** recorded in an ADR or an explicit Owner directive (e.g. heavy regression risk, CI requirement). Even then, keep `body`/`path` in sync with `docs/postman/*.json` so manual and automated are a single source.
- **Context7 (only after automation is enabled):** one narrow question for the test library docs (REST Assured, Testcontainers, JUnit 5, …) — `use context7` + version; do not call it for every manual Postman case.

---

## 4. Pre-release smoke (mandatory)

- **Before** any release (`/release`): run a **quick smoke suite** against a **real running environment** (do not fully mock the app for this smoke).
- **Max 10 scenarios** — **critical paths** (usually taken from the manual/checklists).
- PO signs off on the **smoke report** (`docs/qa/SMOKE_REPORT_<release>.md` or team convention).

---

## 5. Do not

- Do not change Approved business rules (escalate to BA/PO).
- Do not mass `@Disabled` without a ticket.
- Do not “spin up” extra automated tests (WebMvc / integration) **unless** required by Owner/ADR — avoid token waste and duplicate test files when the manual set is sufficient; the **3 Postman file contract** (§2.1) does not count as arbitrary expansion.
