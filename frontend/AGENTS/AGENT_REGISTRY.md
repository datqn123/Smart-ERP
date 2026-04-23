# 🤖 AGENT REGISTRY v2.0 - HỆ THỐNG ĐIỀU PHỐI AGENT

> **Đọc trước (bắt buộc)**: Quy tắc điều phối — **[`AGENTS/WORKFLOW_RULE.md`](WORKFLOW_RULE.md)**  
> **Chi tiết từng phase**: **[`AGENTS/FLOW_GUIDE.md`](FLOW_GUIDE.md)**  
> **Context tối thiểu / tiết kiệm token**: [`AGENTS/docs/CONTEXT_INDEX.md`](docs/CONTEXT_INDEX.md)

Chào mừng bạn đến với trung tâm điều phối của dự án **Mini-ERP**. Dưới đây là danh sách các Agent chuyên biệt và cách triệu hồi chúng.

## 📋 Danh sách Agent hiện có

| Tên Agent | Tên gọi | File Hướng dẫn | Vai trò chính |
| :--- | :--- | :--- | :--- |
| **Agent Planner** | `PLANNER` | `PLANNER_AGENT_INSTRUCTIONS.md` | Intake Feature/Task; **Q&A lặp** với Owner cho đến khi đủ thông tin; xuất **Planner Brief**; sau **Approved** → handoff **API_SPEC** (thiết kế API) hoặc **BA** (tài liệu BA) trong cùng phiên. |
| **Agent BA** | `BA` | `BA_AGENT_INSTRUCTIONS.md` | Phân tích yêu cầu theo **6 Trụ Cột**: Elicitation → PRD → Prototype → User Story Spec → Change Request → System Integration. Output: bộ tài liệu BA đầy đủ + SRS. **Luồng Planner**: khi có brief Approved, BA không chờ Owner duyệt giữa các trụ trong phạm vi brief (xem BA §1.1). |
| **Agent PM** | `PM` | `PM_AGENT_INSTRUCTIONS.md` | Tách SRS/PRD đã duyệt thành chuỗi 3 Task (UNIT → FEATURE → E2E), tự cấp phát ID và quản lý phụ thuộc. |
| **Agent Tech Lead** | `TECH_LEAD` | `TECH_LEAD_AGENT_INSTRUCTIONS.md` | Viết ADR + duy trì guardrails + review PR; mọi ADR bắt buộc NFR (Performance/Scalability/Security/Reliability/Observability) trước khi approve. |
| **Agent Developer** | `DEV` | `DEVELOPER_AGENT_INSTRUCTIONS.md` | Implement theo TDD nghiêm ngặt, coverage gate ≥ 80%, chạy perf scan sau khi tests pass. |
| **Agent Codebase Analyst** | `CODEBASE_ANALYST` | `CODEBASE_ANALYST_AGENT_INSTRUCTIONS.md` | Brownfield discovery sâu 10 giai đoạn: module map, trích xuất business logic, brittle zones, đo coverage, risk register. |
| **Agent API Spec** | `API_SPEC` | `API_AGENT_INSTRUCTIONS.md` | Thiết kế tài liệu API RESTful + Token Auth dựa trên UC và Database Specification. Hoạt động theo yêu cầu thủ công. |
| **Agent API Upgrade**| `API_UPGRADE` | `API_UPGRADE_AGENT_INSTRUCTIONS.md`| Agent con chuyên nâng cấp Agent API dựa trên feedback của Owner; giải quyết các vấn đề về SQL và bảo mật. |
| **Agent Doc Sync** | `DOC_SYNC` | `DOC_SYNC_AGENT_INSTRUCTIONS.md` | Chạy sau sprint/PR merge để phát hiện drift giữa docs và code, bắn cảnh báo & đề xuất cập nhật. |
| **Agent Coder** | `CODER` | *(Đang chờ tạo)* | Thực thi mã nguồn dựa trên SRS/Task, tuân thủ RULES.md. |
| **Agent Tester** | `TESTER` | *(Đang chờ tạo)* | Viết Unit Test (Vitest) và E2E Test (Playwright). |

---

## 🚀 Cách triệu hồi Agent

### 1. Gọi trực tiếp trong câu lệnh

```
"Agent BA, chạy Elicitation cho yêu cầu này: [yêu cầu thô]"
"Agent BA, tạo PRD cho Task023 từ file elicitation: docs/ba/elicitation/ELICITATION_Task023_xxx.md"
"Agent BA, tạo Prototype Prompt cho Task023 (danh sách story đính kèm)"
"Agent BA, đặc tả User Story cho Task023_Story001"
"Agent BA, xử lý Change Request: [mô tả thay đổi]"
"Agent BA, phân tích tích hợp hệ thống với [tên đối tác/API]"
"Agent PM, tách SRS_Task023_xxx.md thành 3 Task (UNIT/FEATURE/E2E)"
"Agent TECH_LEAD, viết ADR cho thay đổi kiến trúc này theo docs/adr/ADR_TEMPLATE.md"
"Agent DEV, thực hiện Task123 theo TDD + coverage gate"
"Agent PLANNER, làm intake + Q&A cho Feature: [mô tả]"
"Agent PLANNER, brief Task023 đã Approved — handoff BA" / "— handoff API"
```

**Luồng khuyến nghị có Planner** (yêu cầu mới / Feature lớn):

```
PLANNER (Q&A → PLANNER_BRIEF Approved) → API_SPEC hoặc BA → … (WORKFLOW_RULE sau SRS nếu có PM)
```

### 2. Giao việc qua file trigger

File trigger bắt đầu bằng tên Agent + loại công việc:

| Tên file trigger | Agent kích hoạt | Ví dụ |
| :--- | :--- | :--- |
| `BA_ELICITATION_*.md` | Agent BA (Trụ 1) | `BA_ELICITATION_Task023_smart-report.md` |
| `BA_PRD_*.md` | Agent BA (Trụ 2) | `BA_PRD_Task023_smart-report.md` |
| `BA_PROTO_*.md` | Agent BA (Trụ 3) | `BA_PROTO_Task023_smart-report.md` |
| `BA_USS_*.md` | Agent BA (Trụ 4) | `BA_USS_Task023_Story001.md` |
| `BA_CR_*.md` | Agent BA (Trụ 5) | `BA_CR_Task023_add-export.md` |
| `BA_INT_*.md` | Agent BA (Trụ 6) | `BA_INT_Task023_erp-connector.md` |
| `PM_RUN_SRS_*.md` | Agent PM | `PM_RUN_SRS_Task023_smart-report.md` |
| `PLANNER_RUN_*.md` | Agent Planner → handoff | `PLANNER_RUN_Task023_api-scope.md` (mô tả + link `AGENTS/docs/planner/PLANNER_BRIEF_*.md`) |

### 3. Chạy toàn chuỗi BA → PM (khuyến nghị)

**Luồng chuẩn đầy đủ:**
```
(Tùy chọn) PLANNER → PLANNER_BRIEF Approved → BA hoặc API_SPEC
         hoặc luồng cổ điển:
BA Elicitation → BA PRD → BA Prototype → BA User Story Spec
                                                   ↓
                        [Owner Approve SRS — hoặc đã Approve ở Planner khi đi luồng BA từ brief]
                                                   ↓
                                PM_RUN_SRS_TaskXXX → DEV → DOC_SYNC
```

**Cú pháp trigger toàn chuỗi PM** (sau khi BA đã xong):
- Tạo file: `AGENT_TRIGGERS/PM_RUN_SRS_TaskXXX_<slug>.md`
- Template: `AGENT_TRIGGERS/PM_RUN_TEMPLATE.md`

---

## 🗂️ Cấu trúc thư mục output của Agent BA v2.0

```
docs/
├── ba/
│   ├── elicitation/          # Trụ 1: Kết quả khơi gợi yêu cầu
│   ├── prd/                  # Trụ 2: Product Requirement Document
│   ├── prototype/            # Trụ 3: Mockup Prompts & Design Notes
│   ├── user-story-specs/     # Trụ 4: User Story Specifications
│   ├── change-requests/      # Trụ 5: Change Request Analysis
│   └── integration/          # Trụ 6: System Integration Specs
└── srs/                      # SRS tổng hợp (output cuối → bàn giao cho PM)
```

**Templates Agent** (BA, API, Planner, Task handoff) — tách khỏi `docs/`:

```
AGENTS/docs/
├── CONTEXT_INDEX.md
├── BACKEND_SPRING_BOOT.md    # Đồng bộ Spring Boot + hợp đồng API
├── planner/                  # PLANNER_BRIEF_TaskXXX_<slug>.md (runtime)
└── templates/
    ├── ba/                   # PRD, USS, Elicitation, Integration
    ├── api/                  # RESTFUL_API_TEMPLATE.md
    ├── planner/
    └── tasks/
```

---

## 🛠️ Quy trình xử lý nội bộ (OpenCode Workflow)

Khi nhận diện được từ khóa Agent:
1. **Load Context**: Đọc file `AGENT_REGISTRY.md` để xác định file hướng dẫn.
2. **Read Instructions**: Tải toàn bộ quy trình của Agent đó từ file instruction.
3. **Identify Pillar**: (Với BA) Xác định trong 6 Trụ, Agent đang ở Trụ nào.
4. **Impersonate**: Áp dụng phong cách, tiêu chuẩn và checklist của Agent đó.
5. **Execution**: Thực thi bằng các công cụ (`write`, `edit`, `bash`, `task`).
6. **QA Gate**: Tự chạy QA Checklist trước khi bàn giao output.
