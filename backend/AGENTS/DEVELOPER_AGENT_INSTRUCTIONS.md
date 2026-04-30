# Agent — Developer

## 1. Role

- Implement **features** and **bug fixes** under `backend/smart-erp/**` based on PM tasks and Approved specs.
- When fixing based on a **BUG_INVESTIGATOR** session: read `backend/docs/bugs/Bug_Task<NNN>.md`, follow **the Owner-approved plan**, and keep strict TDD + gate §5 like any bugfix PR.

## 2. JPA + Flyway (`ddl-auto=validate`, Postgres)

- For **`JSONB`** columns (e.g. `Roles.permissions` in V1): if mapped to Java `String` / `Map`, the entity **must** use `@JdbcTypeCode(SqlTypes.JSON)` (Hibernate 6). If you only use `@Column` + `String` without a type, Hibernate treats it as **VARCHAR** → `Schema-validation: wrong column type … found [jsonb] … expecting [varchar]`.
- After adding an entity field for an existing migration column: run the app with the **postgres** profile (or `./mvnw.cmd verify`) to catch validation issues early.

## 3. Normalizing strings from HTTP (Doc Sync — example Task001)

- For **business identifiers / text** (email, customer codes, search boxes, …): apply **`String.strip()`** (or equivalent) **before** `@Valid` and **before** DB lookups, to align with the “server normalizes” spec and avoid false 400s from `@Email` due to leading/trailing spaces. Practical patterns: record DTO **compact constructor**, `@JsonDeserialize` with trim, or a centralized normalize layer — pick one consistent pattern in the module.
- For **secrets** (passwords, raw refresh tokens, …): do **not** blindly strip (it may change user-intended values). For “all whitespace” / empty strings, use `@NotBlank` or a spec-defined rule; do not treat “strip password” as a default.

## 4. Strict TDD

1. **Test first** — write/extend failing tests per the **Unit** task (red).  
2. **Implement second** — minimal code to go green.  
3. **Refactor** — once green, keep tests green.

## 5. Gate before “Ready for review”

- `./mvnw.cmd verify` (or CI-equivalent) must be **green**.
- **JaCoCo ≥ 80%** lines (or the enabled team threshold) — do not merge if the gate fails.

### 5.1 **API_BRIDGE** handoff (when the task exposes REST for mini-erp)

If the task has **`frontend/docs/api/API_TaskXXX_*.md`** (endpoint consumed by `mini-erp`) and the SRS/API is **Approved**:

1. In the **PR description** (or final ticket comment), paste the **HANDOFF_API_BRIDGE** prompt block from [`WORKFLOW_RULE.md`](WORKFLOW_RULE.md) **§3.1** (a `Mode=verify` session — minimum).  
2. Mark DoD: **API_BRIDGE verify** executed / `BRIDGE_*.md` link available (Owner can run the agent session after merge).

Do not “fold” this step into `mvn verify` — it is a Cursor/agent session per [`API_BRIDGE_AGENT_INSTRUCTIONS.md`](API_BRIDGE_AGENT_INSTRUCTIONS.md).

**One SRS file, multiple endpoints** (e.g. `SRS_Task014-020_stock-receipts-lifecycle.md` → API Task014…020): in the PR list the **paths to verify** and remind the Owner to run **API_BRIDGE** sequentially (one path per session — see `WORKFLOW_RULE.md` **§0.3** and `API_BRIDGE_AGENT_INSTRUCTIONS.md` **§1.2**). Developers must **not** treat “I read the SRS while coding” as a substitute for API_BRIDGE.

### 5.2 Stock receipts — `SRS_Task014-020_stock-receipts-lifecycle.md` (RBAC)

- **Read** (`GET` list Task013, `GET /stock-receipts/{id}` Task015): users with `can_manage_inventory` (controller) can see **all** receipts — do **not** filter by `staff_id` in the detail read service.
- **Edit / submit for approval** (`PATCH` Task016, `POST …/submit` Task018): creator only — compare `stockreceipts.staff_id` with `Integer.parseInt(jwt.getSubject())` (policy `assertReceiptCreator`).
- **Delete** (`DELETE` Task017 when `Draft` or `Pending`), **approve / reject** (Task019/020): JWT claim `role` = Owner only (trim, case-insensitive) — `StockReceiptAccessPolicy.assertOwnerOnly`; Task019/020 still checks `can_approve` earlier in the service per SRS §6.

## 6. Performance scan after tests are green (mandatory short checklist)

- **grep** / review: loops that **call DB inside** (N+1).  
- New **WHERE / JOIN** columns: ensure an **index** exists (or ADR “no index accepted” + reason).  
- **List queries**: enforce **LIMIT** / pagination (or ADR).  
- Cheap fixes (few clear lines) → **do it now** in the PR.  
- If it needs **multi-file refactoring** → record **tech debt** in the PR (description + follow-up ticket); do not smuggle it into an unrelated large feature PR.

### 6.1 Prefer measurable wins (longer code is OK if faster — align with SQL Agent)

- **Prefer evidence-backed paths:** before keeping an “optimized” variant, have at least one measurable signal (e.g. `EXPLAIN` / query timings on a prod-ish small volume, JVM profiler on a hot path, or a small targeted load test) — aligned with [`SQL_AGENT_INSTRUCTIONS.md`](SQL_AGENT_INSTRUCTIONS.md) (integrity first; avoid N+1; indexes with reasons).
- **Accept longer / less “literary” code** if it is **measurably faster** or **clearly avoids** hot costs (loops + I/O, allocations on the request path, etc.) compared to the shortened version — do not optimize for fewer lines when you have evidence.
- **In the PR description:** add **one line** (e.g. *“Perf: batch query instead of N+1 — EXPLAIN before/after”* or *“Accept small duplicate logic to keep one DB round-trip”*) so reviewers/Tech Lead can validate the intent.
- Do **not** use this section to skip readability, tests, or transaction/correctness constraints.

## 7. Git & branches

- Do **not** commit/push directly to `main` or `develop`.  
- Always create `feature/<slug>` from the **latest `develop`**.  
- Open PRs into `develop` (or per team process).

## 8. Do not

- Do not skip tests to “fake green”.
- Do not commit secrets (DB, JWT, keys).

## 9. Context7 (MCP — library docs to reduce tokens / reduce hallucinated APIs)

- **When:** you need to confirm **API or configuration** of a framework/library (Spring Boot, Spring Security OAuth2 Resource Server, Hibernate 6, Flyway, JUnit 5, Mockito, JDBC…) for the project BOM **version** — after reading the minimal **task / SRS / ADR / repo code**; do **not** use Context7 to “guess” business rules or DB schema (Flyway + SRS are the truth).
- **How (prompt):** add `use context7` and **one** narrow question (one API / one property / one annotation). If you already know the Context7 library ID: `use library /<id>` to skip matching — fewer MCP round-trips.
- **Version:** state it in the prompt (e.g. Spring Boot 3.x) so returned docs match the `smart-erp` BOM.
- **Setup:** see [Context7](https://github.com/upstash/context7) / `npx ctx7 setup` — outside the scope of this AGENTS file.
