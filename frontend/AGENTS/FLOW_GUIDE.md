# 🤖 HƯỚNG DẪN CHẠY THEO FLOW — HỆ THỐNG AGENT Mini-ERP

> **Bản chuẩn ngắn (điều phối)**: Khi Owner yêu cầu AI làm theo workflow, hãy dùng **[`WORKFLOW_RULE.md`](WORKFLOW_RULE.md)**.  
> **File này (`FLOW_GUIDE.md`)** là bản **mở rộng / tra cứu chi tiết** (sơ đồ dài, lệnh mẫu từng phase).

> **Mục đích**: Tài liệu này mô tả **đúng thứ tự** và **đúng cách** để các Agent hoạt động phối hợp nhịp nhàng từ đầu đến cuối, bao gồm **điểm chờ duyệt bắt buộc của Owner** trước khi PM kích hoạt chuỗi thực thi.

---

## 📌 Nguyên tắc cốt lõi

| Nguyên tắc | Nội dung |
| :--- | :--- |
| **Human-in-the-Loop** | Output BA (SRS) phải đạt **Gate G1** trước khi PM bắt đầu: Owner duyệt SRS **hoặc** đã **Approved** qua [`PLANNER_AGENT_INSTRUCTIONS.md`](PLANNER_AGENT_INSTRUCTIONS.md) + `AGENTS/docs/planner/PLANNER_BRIEF_*` (luồng BA từ Planner — xem [`WORKFLOW_RULE.md`](WORKFLOW_RULE.md) G1). |
| **Sequential Execution** | PM gọi các Agent theo đúng thứ tự: `PM → TECH_LEAD → DEV → TESTER → CODEBASE_ANALYST → DOC_SYNC` |
| **Gate-based** | Mỗi bước là một "Gate" — nếu Gate trước chưa xong, Gate sau không được bắt đầu. |
| **No Hallucination** | Không một Agent nào được tự ý mở rộng scope, thêm DB, hoặc tạo route mới ngoài SRS. |

---

## 🗺️ Bản đồ tổng quan (Full Flow Map)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        YÊU CẦU THÔ / Ý TƯỞNG                      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
              (tuỳ chọn)     │     PHASE 0: AGENT PLANNER
              ┌──────────────┴──────────────┐
              │ Q&A → PLANNER_BRIEF Approved│
              │ → handoff BA hoặc API_SPEC  │
              └──────────────┬──────────────┘
                             ▼
╔═════════════════════════════════════════════════════════════════════╗
║                        PHASE 1: AGENT BA                           ║
║                                                                     ║
║  Trụ 1: Elicitation  →  Tóm tắt Q&A (ELICITATION_TaskXXX.md)     ║
║      ↓                                                              ║
║  Trụ 2: Gap Analysis & PRD  →  (PRD_TaskXXX.md)                   ║
║      ↓                                                              ║
║  Trụ 3: Prototype Prompt  →  (PROTO_TaskXXX.md)                   ║
║      ↓                                                              ║
║  Trụ 4: User Story Spec  →  (USS_TaskXXX_StoryYYY.md × N)        ║
║      ↓                                                              ║
║  SRS tổng hợp  →  (SRS_TaskXXX_<slug>.md)                         ║
╚═══════════════════════════════════╦═════════════════════════════════╝
                                    │
                                    ▼
                 ┌──────────────────────────────────┐
                 │  🔴 OWNER APPROVAL GATE (BẮT BUỘC) │
                 │                                    │
                 │  Owner đọc & duyệt SRS_TaskXXX.md  │
                 │                                    │
                 │  ✅ APPROVE → tiếp tục Phase 2     │
                 │  ❌ REJECT  → BA sửa lại → re-submit│
                 └─────────────────┬──────────────────┘
                                   │ (chỉ khi ✅ APPROVE)
                                   ▼
╔═════════════════════════════════════════════════════════════════════╗
║                    PHASE 2: AGENT PM (Điều phối)                   ║
║                                                                     ║
║  Bước 2.1: PM đọc SRS đã duyệt                                     ║
║  Bước 2.2: PM cấp phát 3 Task ID liên tiếp                         ║
║  Bước 2.3: PM tạo 3 file Task (UNIT / FEATURE / E2E)               ║
╚═══════════════════════════════════╦═════════════════════════════════╝
                                    │
                                    ▼
╔═════════════════════════════════════════════════════════════════════╗
║                    PHASE 3: AGENT TECH_LEAD                        ║
║                                                                     ║
║  Đánh giá: có ảnh hưởng kiến trúc/contract không?                  ║
║  → CÓ: Viết ADR (docs/adr/ADR-XXXX_<slug>.md) + NFR bắt buộc     ║
║  → KHÔNG: Bỏ qua ADR, vẫn chạy Quality Gate checklist             ║
╚═══════════════════════════════════╦═════════════════════════════════╝
                                    │
                                    ▼
╔═════════════════════════════════════════════════════════════════════╗
║                      PHASE 4: AGENT DEV                            ║
║                                                                     ║
║  Bước 4.1: Task UNIT   — Viết tests FAIL trước (Red)               ║
║  Bước 4.2: Task FEATURE— Implement cho đến khi tests PASS (Green)  ║
║  Bước 4.3: Task E2E    — Viết Playwright tests theo Acceptance Criteria║
║  Bước 4.4: Coverage gate ≥ 80% + perf scan                         ║
╚═══════════════════════════════════╦═════════════════════════════════╝
                                    │
                                    ▼
╔═════════════════════════════════════════════════════════════════════╗
║                      PHASE 5: AGENT TESTER                         ║
║                                                                     ║
║  Xác thực AC, E2E, smoke (tối đa 10 kịch bản quan trọng trước release)║
║  Spring: JUnit/MockMvc + Postman body — `backend/AGENTS/TESTER_*`   ║
╚═══════════════════════════════════╦═════════════════════════════════╝
                                    │
                                    ▼
╔═════════════════════════════════════════════════════════════════════╗
║                 PHASE 6: AGENT CODEBASE_ANALYST                    ║
║                                                                     ║
║  Chạy 10-phase Brownfield Discovery cho phạm vi thay đổi:          ║
║  → Module map, Business logic, Brittle zones, Coverage gaps, Risks ║
╚═══════════════════════════════════╦═════════════════════════════════╝
                                    │
                                    ▼
╔═════════════════════════════════════════════════════════════════════╗
║                    PHASE 7: AGENT DOC_SYNC                         ║
║                                                                     ║
║  Phát hiện drift giữa docs và code sau PR merge                    ║
║  → Xuất báo cáo: docs/sync_reports/SYNC_REPORT_TaskXXX.md         ║
╚═══════════════════════════════════╦═════════════════════════════════╝
                                    │
                                    ▼
                 ┌──────────────────────────────────┐
                 │       PHASE 8: PM KẾT THÚC       │
                 │                                   │
                 │  ✅ Cập nhật SRS → Completed      │
                 │  ✅ Cập nhật PM_RUN → Completed   │
                 └───────────────────────────────────┘
```

**Ghi chú**: Có thể **bỏ qua PHASE 0** và vào thẳng PHASE 1 nếu Owner gọi **Agent BA** trực tiếp (không qua Planner).

---

## 📋 CHI TIẾT TỪNG PHASE

---

### PHASE 1 — Agent BA: Phân tích & Tạo Output

**Ai kích hoạt**: User / Owner (hoặc tiếp nối **Agent Planner** sau brief Approved)  
**Điều kiện bắt đầu**: Có yêu cầu thô / ý tưởng **hoặc** file `AGENTS/docs/planner/PLANNER_BRIEF_TaskXXX_<slug>.md` đã Approved (`taskType` có nhánh BA)  
**Tham chiếu**: `AGENTS/BA_AGENT_INSTRUCTIONS.md` (§1.1 luồng Planner)

#### Các bước BA thực hiện (theo 6 Trụ):

| Bước | Trụ | Lệnh kích hoạt | Output |
| :--- | :--- | :--- | :--- |
| 1 | Elicitation | `Agent BA, chạy Elicitation cho TaskXXX` | `docs/ba/elicitation/ELICITATION_TaskXXX_<slug>.md` |
| 2 | PRD | `Agent BA, tạo PRD TaskXXX` | `docs/ba/prd/PRD_TaskXXX_<slug>.md` |
| 3 | Prototype | `Agent BA, tạo Prototype Prompt TaskXXX` | `docs/ba/prototype/PROTO_TaskXXX_<slug>.md` |
| 4 | User Story Spec | `Agent BA, đặc tả Story TaskXXX_StoryYYY` | `docs/ba/user-story-specs/USS_TaskXXX_StoryYYY.md` |
| 5 | Tổng hợp SRS | `Agent BA, tổng hợp SRS TaskXXX` | `docs/srs/SRS_TaskXXX_<slug>.md` |

#### ⚠️ Quy tắc bắt buộc cho BA:
- **KHÔNG** tự ý thêm bảng DB mới.
- **KHÔNG** chuyển output cho PM nếu chưa chạy QA Checklist.
- **KHÔNG** tiếp tục nếu thiếu thông tin — hỏi tối đa 3 câu.

#### Output cuối cùng của BA (bàn giao cho Owner duyệt):
```
docs/srs/SRS_TaskXXX_<slug>.md
```
> Đây là tài liệu Owner duyệt trước khi PM bắt đầu — **trừ** khi đã duyệt scope/Q&A ở **Agent Planner** cho cùng Task (xem Gate bên dưới).

---

### 🔴 OWNER APPROVAL GATE

**Ai thực hiện**: Owner (người dùng)  
**Điều kiện**: BA đã hoàn thành và tạo file SRS  

**Luồng Planner**: Nếu BA được giao từ `PLANNER_BRIEF_*` **Approved**, Owner **không** cần lặp lại chuỗi duyệt từng trụ BA; chỉ cần kiểm tra SRS cuối cùng (hoặc tin cậy brief + QA BA) trước PM theo [`WORKFLOW_RULE.md`](WORKFLOW_RULE.md) G1.

#### Owner cần làm:

1. **Mở file** `docs/srs/SRS_TaskXXX_<slug>.md`
2. **Kiểm tra** theo checklist sau:
   - [ ] Phạm vi (In-scope / Out-of-scope) rõ ràng, không "bloat"?
   - [ ] Luồng nghiệp vụ (Mermaid) đúng với ý định?
   - [ ] Acceptance Criteria đủ happy + unhappy paths?
   - [ ] Không có bảng DB mới không mong muốn?
   - [ ] UI/UX mô tả đúng thiết kế mong muốn?
3. **Quyết định**:
   - ✅ **ĐỒNG Ý** → Trả lời: `"Agent PM, chạy PM_RUN_SRS_TaskXXX_<slug>.md"` hoặc tạo file trigger.
   - ❌ **TỪ CHỐI** → Phản hồi cụ thể điểm cần sửa → BA sửa lại → submit lại cho Owner.

> **Không có lệnh nào của PM được thực thi trước khi Owner approve.**

---

### PHASE 2 — Agent PM: Cấp phát Task & Khởi động chuỗi

**Ai kích hoạt**: Owner (sau khi approve SRS)  
**Điều kiện bắt đầu**: File SRS đã được Owner approve  
**Tham chiếu**: `AGENTS/PM_AGENT_INSTRUCTIONS.md`

#### Cách kích hoạt PM:

**Option A — Gọi trực tiếp:**
```
Agent PM, chạy workflow cho SRS: docs/srs/SRS_TaskXXX_<slug>.md
```

**Option B — File trigger (khuyến nghị):**
1. Copy `AGENT_TRIGGERS/PM_RUN_TEMPLATE.md`
2. Đặt tên: `AGENT_TRIGGERS/PM_RUN_SRS_TaskXXX_<slug>.md`
3. Điền `Source SRS` và `Task code`
4. Mở file và nói: `"Agent PM, thực thi file trigger này"`

#### PM thực hiện tuần tự:

**Bước 2.1 — Tạo Task:**
```
1. Quét TASKS/Task*.md → tìm max(TaskID) hiện có
2. Cấp 3 ID liên tiếp: UNIT=(max+1), FEATURE=(max+2), E2E=(max+3)
3. Tạo 3 file: TASKS/TaskXXX.md, TaskXXX+1.md, TaskXXX+2.md
```

**Bước 2.2 — Gọi TECH_LEAD:**
```
Agent TECH_LEAD, review thay đổi TaskXXX: [tóm tắt scope]
Nguồn SRS: docs/srs/SRS_TaskXXX_<slug>.md
Tạo ADR nếu có ảnh hưởng kiến trúc.
```

**Bước 2.3 — Gọi DEV (sau khi TECH_LEAD xong):**
```
Agent DEV, thực hiện chuỗi Task: TaskXXX (UNIT) → TaskXXX+1 (FEATURE) → TaskXXX+2 (E2E)
TDD nghiêm ngặt. Coverage gate ≥ 80%.
```

**Bước 2.4 — Gọi TESTER (sau khi DEV xong):**
```
Agent TESTER, xác thực TaskXXX theo AC + E2E + smoke (UI).
Nhánh Spring: đọc backend/AGENTS/TESTER_AGENT_INSTRUCTIONS.md — JaCoCo + Postman body theo endpoint.
```

**Bước 2.5 — Gọi CODEBASE_ANALYST (sau khi TESTER xong):**
```
Agent CODEBASE_ANALYST, chạy 10-phase discovery cho phạm vi TaskXXX.
```

**Bước 2.6 — Gọi DOC_SYNC (sau khi CODEBASE_ANALYST xong):**
```
Agent DOC_SYNC, kiểm tra drift docs cho TaskXXX.
Lưu báo cáo: docs/sync_reports/SYNC_REPORT_TaskXXX.md
```

**Bước 2.7 — Kết thúc:**
```
1. Cập nhật docs/srs/SRS_TaskXXX_<slug>.md → Status: Completed
2. Cập nhật AGENT_TRIGGERS/PM_RUN_SRS_TaskXXX_<slug>.md → Trạng thái: Done
```

---

### PHASE 3 — Agent TECH_LEAD: Kiến trúc & Guardrails

**Ai kích hoạt**: Agent PM  
**Tham chiếu**: `AGENTS/TECH_LEAD_AGENT_INSTRUCTIONS.md`

#### TECH_LEAD thực hiện:

1. **Đọc SRS** và scope 3 Task vừa được PM tạo.
2. **Phân loại**: có ảnh hưởng kiến trúc/contract không?
3. **Nếu CÓ**: Viết ADR tại `docs/adr/ADR-XXXX_<slug>.md` với đủ 5 NFR:
   - Performance / Scalability / Security / Reliability / Observability
4. **Bao giờ cũng**: Xuất Guardrail Checklist cho DEV.
5. **Báo lại PM**: "TECH_LEAD done. ADR: [path hoặc N/A]"

> ⚠️ **Gate**: Nếu scope CÓ ảnh hưởng kiến trúc mà KHÔNG có ADR → DEV KHÔNG ĐƯỢC bắt đầu.

---

### PHASE 4 — Agent DEV: Implement theo TDD

**Ai kích hoạt**: Agent PM (sau TECH_LEAD done)  
**Tham chiếu**: `AGENTS/DEVELOPER_AGENT_INSTRUCTIONS.md`

#### DEV thực hiện theo thứ tự CỨNG:

**Bước 4.1 — Task UNIT (Red):**
```
- Tạo unit tests dựa trên Acceptance Criteria trong SRS
- Tests phải FAIL trước khi có implementation
- KHÔNG viết code production trong bước này
```

**Bước 4.2 — Task FEATURE (Green):**
```
- Implement code tối thiểu để unit tests PASS
- Tuân thủ RULES.md (mobile-first, touch 44px, TypeScript strict)
- Tái sử dụng component/hook hiện có, không tạo mới tuỳ tiện
```

**Bước 4.3 — Task E2E (Validate):**
```
- Viết Playwright tests map 1-1 với Acceptance Criteria
- Tránh selector fragile (dùng role/text, không class/id luongle)
```

**Bước 4.4 — Coverage Gate:**
```
- npm test --coverage → phải ≥ 80%
- npm run build → phải pass
- npm run lint → phải pass
```

- **Báo lại PM**: "DEV done. Coverage: XX%. Build: ✅"

---

### PHASE 5 — Agent TESTER: Xác thực & E2E

**Ai kích hoạt**: Agent PM (sau DEV done)  
**Điều kiện**: DEV đã báo done + Build pass + coverage gate  
**Tham chiếu (Spring / `smart-erp`)**: [`../../backend/AGENTS/TESTER_AGENT_INSTRUCTIONS.md`](../../backend/AGENTS/TESTER_AGENT_INSTRUCTIONS.md)  
**Tham chiếu (UI Mini-ERP)**: AC trong SRS + task E2E; Playwright như mục 4.3 Phase 4.

#### TESTER thực hiện (tóm tắt):

1. Đối chiếu từng Acceptance Criteria với hành vi thực tế (manual + automated).
2. Hoàn thiện / chạy E2E theo task; trước release: smoke tối đa **10** đường dẫn người dùng quan trọng trên môi trường **đang chạy** (không mô phỏng chống lại app thật).
3. **Spring**: bổ sung hoặc duy trì test gọi đúng endpoint; file JSON body cho Postman nằm cùng convention dự án (ví dụ `backend/smart-erp/docs/postman/`).
4. **Báo lại PM**: *"TESTER done. AC: [pass/fail]. E2E/Smoke: [tóm tắt]."*

---

### PHASE 6 — Agent CODEBASE_ANALYST: Brownfield Discovery

**Ai kích hoạt**: Agent PM (sau TESTER done)  
**Điều kiện**: TESTER đã báo done  
**Tham chiếu**: `AGENTS/CODEBASE_ANALYST_AGENT_INSTRUCTIONS.md` · Spring: [`../../backend/AGENTS/CODEBASE_ANALYST_AGENT_INSTRUCTIONS.md`](../../backend/AGENTS/CODEBASE_ANALYST_AGENT_INSTRUCTIONS.md)

#### CODEBASE_ANALYST thực hiện 10 phase:

| Phase | Nội dung |
| :--- | :--- |
| 1 | Inventory & Entry Points — liệt kê file liên quan |
| 2 | Module Mapping — sơ đồ phụ thuộc |
| 3 | Domain Model Extraction |
| 4 | Business Logic Extraction (logic chôn trong UI) |
| 5 | Data Flow & State |
| 6 | Contract Surfaces (UI↔API↔DB) |
| 7 | Brittleness Hotspots |
| 8 | Test Inventory |
| 9 | Coverage Measurement & Gaps |
| 10 | Recommendations & Actionable Plan |

- **Output bắt buộc**: `docs/analysis/ANALYSIS_TaskXXX.md`
- **Báo lại PM**: *"CODEBASE_ANALYST done. Brittle zones: [N]. Risks: [danh sách ngắn]."*

---

### PHASE 7 — Agent DOC_SYNC: Drift Detection

**Ai kích hoạt**: Agent PM (sau CODEBASE_ANALYST done)  
**Điều kiện**: CODEBASE_ANALYST đã báo done  
**Tham chiếu**: `AGENTS/DOC_SYNC_AGENT_INSTRUCTIONS.md`

#### DOC_SYNC thực hiện:

1. So sánh code thực tế vs tài liệu trong `docs/` (bao gồm `docs/ba/` nếu có)
2. Phát hiện các điểm docs đã lỗi thời
3. Phân loại: High / Medium / Low severity
4. **Knowledge Harvesting**: Quét `TASKS/TaskXXX.md` tìm mục RCA, cập nhật `RULES_BUG_FIX.md` đế rút kinh nghiệm
5. **Xuất báo cáo bắt buộc**: `docs/sync_reports/SYNC_REPORT_TaskXXX.md`
6. **Báo lại PM**: *"DOC_SYNC done. Report: docs/sync_reports/SYNC_REPORT_TaskXXX.md. Drift findings: [N]. Rules harvested: [N]."*

---

### PHASE 8 — Agent PM: Đóng Task

**Ai kích hoạt**: PM (sau DOC_SYNC done)

```
1. Cập nhật docs/srs/SRS_TaskXXX_<slug>.md
   → Dòng Trạng thái: "✅ Completed"

2. Cập nhật AGENT_TRIGGERS/PM_RUN_SRS_TaskXXX_<slug>.md
   → Tích [x] toàn bộ checklist
   → Dòng Trạng thái: "✅ Done"

3. Thông báo cho Owner: "TaskXXX hoàn thành. Tóm tắt: [summary]"
```

---

## 📞 Cú pháp lệnh nhanh (Quick Reference)

### Bắt đầu từ đầu (luồng đầy đủ):

```
# Bước 1: Bắt đầu với BA
Agent BA, chạy Elicitation cho TaskXXX: [mô tả yêu cầu]

# Bước 2: Sau khi BA tổng hợp xong
→ Owner đọc docs/srs/SRS_TaskXXX_<slug>.md và duyệt

# Bước 3: Khi Owner approve, kích hoạt PM
Agent PM, chạy workflow cho SRS đã duyệt: docs/srs/SRS_TaskXXX_<slug>.md
```

### Chỉ chạy từ PM (khi đã có SRS sẵn):

```
Agent PM, chạy PM_RUN cho Task TaskXXX từ SRS: docs/srs/SRS_TaskXXX_<slug>.md
```

### Khi có Change Request:

```
Agent BA, xử lý Change Request TaskXXX: [mô tả thay đổi]
→ Chờ BA ra CR Analysis
→ Owner duyệt CR
→ Nếu lớn: Agent PM tạo Task mới
→ Nếu nhỏ: Agent DEV fix trực tiếp
```

---

## 🚦 Bảng tóm tắt Gate & Điều kiện

| Gate | Điều kiện để qua | Nếu không qua |
| :--- | :--- | :--- |
| **Gate 0** (BA → Owner) | BA hoàn thành SRS đầy đủ (QA Checklist pass) | BA tiếp tục sửa |
| **Gate 1** (Owner → PM) | Owner approve SRS | BA sửa theo feedback, resubmit |
| **Gate 2** (PM → TECH_LEAD) | PM tạo đủ 3 Task files | PM hoàn thành task creation trước |
| **Gate 3** (TECH_LEAD → DEV) | ADR tồn tại (nếu cần) + Guardrail checklist xuất | TECH_LEAD viết ADR trước |
| **Gate 4** (DEV → TESTER) | Tests pass + Coverage ≥ 80% + Build pass | DEV fix thêm |
| **Gate 5** (TESTER → CODEBASE_ANALYST) | AC / E2E / smoke đạt theo phạm vi task | TESTER báo cáo + DEV fix nếu fail |
| **Gate 6** (CODEBASE_ANALYST → DOC_SYNC) | 10-phase report hoàn thành | CODEBASE_ANALYST tiếp tục |
| **Gate 7** (DOC_SYNC → PM Close) | SYNC_REPORT đã lưu | DOC_SYNC xuất report |

---

## 📁 Cấu trúc file theo Flow

```
docs/
├── ba/                   ← Toàn bộ output của Agent BA v2.0
│   ├── elicitation/      → ELICITATION_TaskXXX_<slug>.md     (Trụ 1)
│   ├── prd/              → PRD_TaskXXX_<slug>.md              (Trụ 2)
│   ├── prototype/        → PROTO_TaskXXX_<slug>.md            (Trụ 3)
│   ├── user-story-specs/ → USS_TaskXXX_StoryYYY_<slug>.md    (Trụ 4)
│   ├── change-requests/  → CR_TaskXXX_<slug>.md              (Trụ 5)
│   └── integration/      → INTEGRATION_TaskXXX_<slug>.md     (Trụ 6)
├── srs/                  → SRS_TaskXXX_<slug>.md    ← Owner duyệt tại đây
├── templates/
│   └── ba/               → Các template cho từng loại output BA
├── adr/                  → ADR-XXXX_<slug>.md       ← TECH_LEAD tạo
├── analysis/             → ANALYSIS_TaskXXX.md      ← CODEBASE_ANALYST tạo
└── sync_reports/         → SYNC_REPORT_TaskXXX.md   ← DOC_SYNC tạo

TASKS/
├── TaskXXX.md      → [UNIT]
├── TaskXXX+1.md    → [FEATURE]
└── TaskXXX+2.md    → [E2E]

AGENT_TRIGGERS/
└── PM_RUN_SRS_TaskXXX_<slug>.md  → File điều phối PM (chứa Owner Approval Gate)
```

---

## 📊 Bảng đồng bộ: Agent — Output — Nơi lưu

| Agent | Output | Nơi lưu | Người nhận |
| :--- | :--- | :--- | :--- |
| **BA** (Trụ 1) | Elicitation Summary | `docs/ba/elicitation/` | BA (để làm PRD) |
| **BA** (Trụ 2) | PRD | `docs/ba/prd/` | Owner review |
| **BA** (Trụ 3) | Prototype Prompts | `docs/ba/prototype/` | Owner/DEV |
| **BA** (Trụ 4) | User Story Spec | `docs/ba/user-story-specs/` | DEV |
| **BA** (Tổng hợp) | SRS | `docs/srs/` | **Owner duyệt → PM** |
| **BA** (Trụ 5) | CR Analysis | `docs/ba/change-requests/` | Owner |
| **BA** (Trụ 6) | Integration Spec | `docs/ba/integration/` | TECH_LEAD/DEV |
| **PM** | 3 Task files | `TASKS/` | DEV |
| **TECH_LEAD** | ADR | `docs/adr/` | DEV, PM |
| **DEV** | Code + Tests | `mini-erp/src/` | PM (coverage report) |
| **TESTER** | E2E / smoke / báo cáo AC | `e2e/`, `docs/postman/` (nếu có), log smoke | PM, Owner (ký smoke trước release) |
| **CODEBASE_ANALYST** | Analysis Report | `docs/analysis/` | PM, DOC_SYNC |
| **DOC_SYNC** | Sync Report + RULES_BUG_FIX | `docs/sync_reports/` + `RULES_BUG_FIX.md` | Owner, PM |

