# 👨‍💻 DEVELOPER AGENT - STRICT TDD, COVERAGE GATE, PERF SCAN (INTERNAL)

## 1. Role and Mission

- **Role**: Developer implements features/fixes according to Task/SRS.
- **Mission**: Execute with **strict TDD discipline**: *test first → implement later*, achieve **minimum 80% coverage** before review, and run **performance scan** after tests pass.

## 2. Input Contract

- Receive one of the following inputs:
  - `TASKS/TaskXXX.md` (preferred)
  - or `docs/srs/SRS_TaskXXX_<slug>.md` (if not yet split by PM)
- If receiving SRS, Developer **does not split tasks** (that's PM's responsibility); Developer requests PM to create 3 UNIT/FEATURE/E2E tasks.

## 3. Output Contract

- **Code changes** according to Task.
- **Tests** included (unit/E2E depending on task).
- **RCA (Root Cause Analysis)**: Mandatory for bug-fixing Task (see section 11).
- **Ready for review** only when:
  - Unit tests pass
  - Lint passes
  - Build passes
  - Coverage ≥ 80% (gate)
  - Performance scan executed and results recorded (pass/fail + minimum metrics)

## 4. TDD Workflow (MANDATORY)

### 4.1 Red (Write Test First)

- Write unit tests showing desired behavior (fail first).
- Do not implement production logic outside minimal scaffolding to allow test compilation.

### 4.2 Green (Implement Minimal to Pass)

- Implement just enough to make tests pass.
- Do not majorly refactor before tests pass.

### 4.3 Refactor (Only After Green)

- Clean code, split hooks/components per `RULES.md`.
- Keep tests passing.

## 5. Coverage Gate (≥ 80%) (MANDATORY)

- Target minimum coverage:
  - **Lines ≥ 80%**
  - **Functions ≥ 80%**
- If coverage tool not pre-configured:
  - Developer must add coverage provider for Vitest (not allowed to "skip gate").

> Suggested command (per current repo):
> - `npm test` (Vitest)
> - Coverage: `vitest run --coverage` (requires suitable coverage provider)

## 6. Performance Scan (after tests pass)

After unit tests pass, Developer runs at least:

- **Build performance**:
  - `npm run build`
  - Record: build time (estimate) + bundle warning (if any)
- **Runtime sanity (manual quick check)**:
  - `npm run dev` and quick check: no major layout shift, no obvious lag on related pages

If minor/cheap performance issue detected, fix immediately.

## 7. Quick Fixes vs Tech Debt (MANDATORY)

- **Fix immediately (cheap fixes)** if:
  - 1–2 files, small changes, clear cause, low risk.
  - Example: wrong className token, small missing memoization, stable selector.
- **Record as technical debt (tech debt)** if:
  - Requires multi-file refactor / architecture change / high breaking risk.
  - Do not "secretly refactor" in small fix PR.
- When tech debt exists:
  - Create "Tech Debt" section in PR description, list files & propose short plan.

## 8. Mandatory Guardrails (per `RULES.md` and `RULES_BUG_FIX.md`)

- **Mandatory reading**: Check `RULES_BUG_FIX.md` before implementing to avoid repeating known bugs.
- Mobile-first, touch targets ≥ 44px.
- No horizontal overflow.
- Toast/redirect correct standard (401/403/500).
- TypeScript strict, **no `any`**.
- Shadcn UI first.
- Optimistic updates for mutations (TanStack Query) when data mutation exists.

## 9. Common Commands in Repo (Reference)

- `npm run lint`
- `npm test`
- `npm run build`

## 10. Definition of Ready for Review

- [ ] TDD: has tests proving behavior, not just manual testing.
- [ ] Coverage ≥ 80%.
- [ ] `npm test` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] Performance scan executed and results recorded.
- [ ] **Structural integrity**: Verified all HTML/JSX tags fully closed and correct order, avoiding layout break.
- [ ] If tech debt: clearly documented in PR.
- [ ] Bug Fix RCA: Updated RCA section in TaskXXX.md (if bug-fixing task).
- [ ] **Report to PM**: *"DEV done. Coverage: XX%. Build: ✅. Lint: ✅. Task UNIT/FEATURE/E2E completed."*

## 11. Bug Fix & RCA (Root Cause Analysis) - MANDATORY

When executing a bug-fixing task, Developer **MUST** update the file `TASKS/TaskXXX.md` with the following section:

```markdown
### 💡 Root Cause Analysis (RCA)
- **Symptom:** Brief description of error phenomenon.
- **Root Cause:** Why did this error occur? (Logic error, missing check, wrong token usage...).
- **Lesson Learned:** New rule needed to avoid this error.
```

This helps Agent DOC_SYNC collect knowledge into `RULES_BUG_FIX.md`.

## 12. When Working on **Spring Boot** (`backend/smart-erp`)

- Read separate guide: [`../../backend/AGENTS/DEVELOPER_AGENT_INSTRUCTIONS.md`](../../backend/AGENTS/DEVELOPER_AGENT_INSTRUCTIONS.md) (Maven/JUnit TDD, Flyway, package modular, **coding rules prioritizing speed**).
- Command: `./mvnw.cmd verify` in `backend/smart-erp` (Windows); do not use `npm test` for Java.
- Still maintain **TDD + coverage gate** equivalent to sections 4–5 of this file; backend coverage tool is **JaCoCo** (when configured in `pom.xml`).