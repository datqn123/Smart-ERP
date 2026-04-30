# Agent — API Bridge (Backend ↔ Frontend)

> **Call code:** `API_BRIDGE`  
> **Goal:** One session = **one Task / one endpoint** — read **one** FE wiring guide first, then work under **`frontend/mini-erp/`** (connect client ↔ spec ↔ BE when needed).  
> **Design philosophy:** **must read the FE guide first** + then open **few files** + produce a **`BRIDGE_*`** table → **burn fewer tokens**.

---

## 1. Input prompt (Owner / orchestration — copy one block)

```text
API_BRIDGE | Task=<TaskXXX> | Path=/api/v1/... | Mode=verify|wire-fe|fix-doc|fix-fe|fix-be
```

**Full prompt (Cursor + `@`):** see **section 7**.

| Mode | Behavior |
| :--- | :--- |
| **`verify`** | Cross-check docs ↔ BE ↔ existing FE files; create/update `BRIDGE_*.md` — do **not** modify code unless the Owner requests it. |
| **`wire-fe`** | Same as `verify` + **modify/create code** only under `frontend/mini-erp/src/**` following **Step 0** + **UI location** + **Wiring flow** (per `FE_API_CONNECTION_GUIDE.md`). |
| `fix-doc` / `fix-fe` / `fix-be` | Apply **minimal** fixes to the file type indicated in `BRIDGE_*` or the ticket. |

---

## 2. Step 0 — **One** Frontend document (mandatory before touching `frontend/`)

**Always read first (any Mode that touches FE):**

[`frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md`](../../frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md)

- This file defines: `VITE_API_BASE_URL`, `src/lib/api/` layout, `apiJson`, `features/*/api`, envelope, Bearer handling — do **not** invent alternate conventions in the session.  
- Only after reading it, `Grep` / `Read` more in `frontend/mini-erp/src`.

---

## 2b. Locate UI files (before `wire-fe` / when `BRIDGE_*` is missing FE column)

**One index file (prefer reading instead of globbing the entire `features/`):**

[`frontend/mini-erp/src/features/FEATURES_UI_INDEX.md`](../../frontend/mini-erp/src/features/FEATURES_UI_INDEX.md)

| How you know what to edit | What to do |
| :--- | :--- |
| Owner/ticket provides a **URL** (e.g. `/inventory/stock`) | Use **table 1** in the index → `.../pages/*.tsx` |
| Only a Vietnamese **menu label** is given | Open **one** file [`frontend/mini-erp/src/components/shared/layout/Sidebar.tsx`](../../frontend/mini-erp/src/components/shared/layout/Sidebar.tsx) — `label` → `path` → then use **table 1** |
| Need a **dialog/table** (not the whole page) | Use **table 2** by feature in the index → `Read` the right `components/*.tsx` |
| You know the **API path** (`/api/v1/...`) | `Grep` the path (or slug) in `frontend/mini-erp/src` — if there are **no hits**, map prefix → feature (table below), then open only `features/<feature>/api/*.ts` + page/component from the index |

**Quick prefix → feature folder map** (when doc/task does not state the UI screen):

| Prefix / group (example) | `features/` folder |
| :--- | :--- |
| `/api/v1/auth/...` | `auth/` |
| Inventory, receipts/issues, audits, locations | `inventory/` |
| Catalog / products / suppliers / customers | `product-management/` |
| Retail/wholesale orders / returns | `orders/` |
| Approvals | `approvals/` |
| Cashflow / debts / ledgers | `cashflow/` |
| Revenue reports / top products | `analytics/` |
| AI chat | `ai/` |
| Store, staff, alerts, logs | `settings/` |

---

## 2c. Wiring an endpoint into the UI (mandatory order)

1. **`features/<domain>/api/<name>.ts`** — call `apiJson` (spec-correct path, method, body/query). Do **not** call `fetch` directly in components.  
2. The located **page or component** (table 1/2 index or grep) — `import` the API function, call it in a handler (`onSubmit`, `useMutation`, etc.), handle errors per `FE_API_CONNECTION_GUIDE.md`.  
3. If multiple screens share one API — keep the function in **one** `api/*.ts` file; components only import.

**After `wire-fe`:** the *Frontend* column in `BRIDGE_*.md` must list **both** the `api/*.ts` file(s) **and** the wired UI file (page or component).

---

## 3. Steps 1–3 — short flow (after the guide)

| Step | Action | Limit |
| :---: | :--- | :--- |
| **1** | `Read` `frontend/docs/api/API_TaskXXX_*.md` — **only** the endpoint + request/response/error parts for the `Path`. **If available:** read **one** of these — `frontend/docs/api/endpoints/TaskXXX.md` (link table) **or** `frontend/docs/api/samples/TaskXXX/<slug>.request.json` + `.response.*.json` for the exact `Path` (fast shape, fewer tokens). | 1–3 files |
| **2** | (If BE needed) `Grep` the `Path` in `backend/smart-erp/src/main/java` → `Read` **1** controller (and **1** DTO if the doc lists detailed fields). | ≤ 2 files |
| **3** | **`wire-fe`:** (1) `Read` **FEATURES_UI_INDEX** if UI file is unknown; (2) `Grep` `Path` in `frontend/mini-erp/src` (`*.ts`, `*.tsx`); (3) edit/create **`features/<domain>/api/*.ts`** first, then page/component — do **not** `Glob` the whole `features/` if index + grep is enough. | Based on grep |

Do **not** read the full SRS, full `schema.sql`, or the entire `node_modules`.

---

## 4. Side branch (use when **not** `wire-fe` — verification only)

### Branch C — envelope / error codes

| Step | File | Files |
| :---: | :--- | :---: |
| 1 | `frontend/docs/api/API_RESPONSE_ENVELOPE.md` (relevant section) | 1 |
| 2 | `backend/smart-erp/.../ApiErrorCode.java` **or** `GlobalExceptionHandler` | 1 |

---

## 5. Mandatory output — `BRIDGE_*.md`

**Path:** `frontend/docs/api/bridge/BRIDGE_TaskXXX_<slug>.md`

**Minimum contents:**

1. First line: `Task`, `Path`, `Mode`, `Date`.  
2. Line: *Read `FE_API_CONNECTION_GUIDE.md` (Y/N)*.  
3. **One table** | Item | API doc (section) | Backend (file) | Frontend (`api/*.ts` + UI) | Match (Y/N) | Action |  
4. Up to **5 lines** conclusion.

---

## 6. Boundaries

| Agent | When |
| :--- | :--- |
| **API_BRIDGE** | One endpoint — read the **FE guide** → (spec + **endpoints/** + **samples/** when present) → wire/verify + `BRIDGE_*`. |
| **DOC_SYNC** | Detect drift after a sprint; ensure the **contract kit** in section **2a** (`endpoints/`, `samples/`, Postman sync) so API_BRIDGE has the needed sample files. |
| **TESTER** | 3 Postman files + manual AC. |

---

## 7. Prompt templates (Cursor — copy entire block)

**Rule:** one session = **one** `Path`; `@` only the necessary files — avoid attaching the whole `docs/api/` folder.

### 7.1 Minimal (verify + `BRIDGE_*` only, no code changes)

```text
Role: API_BRIDGE. Follow @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task003 | Path=/api/v1/auth/refresh | Mode=verify

Read in order: @frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md → @frontend/docs/api/endpoints/Task003.md (or @frontend/docs/api/samples/Task003/) → @frontend/docs/api/API_Task003_auth_refresh.md (refresh endpoint index).

Output: create/update @frontend/docs/api/bridge/BRIDGE_Task003_refresh.md per section 5.
```

### 7.2 Wire FE (`wire-fe`) — with UI (auth / form)

```text
Role: API_BRIDGE. Follow @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task001 | Path=/api/v1/auth/login | Mode=wire-fe

UI context: route /login (login form).

Read: @frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md → @frontend/mini-erp/src/features/FEATURES_UI_INDEX.md → @frontend/docs/api/endpoints/Task001.md → @frontend/docs/api/API_Task001_login.md (login section).

Do: apiJson + features/auth/api + wire into the component per the index; do not glob the whole features/ folder.

Output: @frontend/docs/api/bridge/BRIDGE_Task001_login.md.
```

### 7.3 Wire FE — minimal UI (refresh / interceptor, route table not needed)

```text
Role: API_BRIDGE. Follow @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task003 | Path=/api/v1/auth/refresh | Mode=wire-fe

Read: @frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md → @frontend/docs/api/endpoints/Task003.md → @frontend/docs/api/samples/Task003/refresh.request.json and refresh.response.200.json → grep Path in @frontend/mini-erp/src (only matching files).

Output: @frontend/docs/api/bridge/BRIDGE_Task003_refresh.md.
```

### 7.4 One-liner (once you know the order in this file)

```text
API_BRIDGE | Task=Task002 | Path=/api/v1/auth/logout | Mode=verify
```

---

## 8. Do not

- Do not skip **Step 0** (`FE_API_CONNECTION_GUIDE.md`) when editing code under `frontend/mini-erp/`.  
- Do not design new APIs (**API_SPEC** / BA responsibility).  
- Do not refactor outside the requested `Mode` / ticket scope.
