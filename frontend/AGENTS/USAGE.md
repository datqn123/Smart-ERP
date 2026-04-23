# Hướng dẫn sử dụng hệ thống Agent v2.0 (Mini-ERP)

Tài liệu này mô tả cách sử dụng các Agent trong repo. Phiên bản 2.0 nâng cấp **Agent BA** lên hệ thống **6 Trụ Cột** toàn diện.

---

## 1. Quy tắc chung

- Danh sách Agent và file hướng dẫn: `AGENTS/AGENT_REGISTRY.md`
- **Quy tắc workflow (AI tự điều phối theo lệnh Owner)**: `AGENTS/WORKFLOW_RULE.md`
- Luồng chi tiết (tham khảo): `AGENTS/FLOW_GUIDE.md`
- Mỗi Agent có instruction riêng trong `AGENTS/`
- **Template + context index + Planner brief**: `AGENTS/docs/` (xem [`AGENTS/docs/README.md`](docs/README.md))
- Quy ước file trigger:

| Prefix file | Agent kích hoạt | Trụ cột (nếu là BA) |
| :--- | :--- | :--- |
| `BA_ELICITATION_*.md` | Agent BA | Trụ 1: Elicitation |
| `BA_PRD_*.md` | Agent BA | Trụ 2: PRD |
| `BA_PROTO_*.md` | Agent BA | Trụ 3: Prototype |
| `BA_USS_*.md` | Agent BA | Trụ 4: User Story Spec |
| `BA_CR_*.md` | Agent BA | Trụ 5: Change Request |
| `BA_INT_*.md` | Agent BA | Trụ 6: Integration |
| `PM_RUN_SRS_*.md` | Agent PM | — |
| `TECH_LEAD_*.md` | Agent Tech Lead | — |
| `DEV_*.md` | Agent Developer | — |
| `CODEBASE_ANALYST_*.md` | Agent Codebase Analyst | — |
| `DOC_SYNC_*.md` | Agent Doc Sync | — |

---

## 2. Luồng chuẩn từ Yêu cầu Thô → Triển khai

### 2.1 Bước 1 — BA: Elicitation (Trụ 1)

Mục tiêu: làm rõ yêu cầu thô trước khi viết bất kỳ tài liệu nào.

```
Input : yêu cầu thô (văn bản / file / chat)
Output: docs/ba/elicitation/ELICITATION_TaskXXX_<slug>.md
```

Gọi:
```
Agent BA, chạy Elicitation cho Task023: [yêu cầu thô]
```
Hoặc tạo file trigger: `AGENT_TRIGGERS/BA_ELICITATION_Task023_<slug>.md`

---

### 2.2 Bước 2 — BA: Gap Analysis & PRD (Trụ 2)

Mục tiêu: tạo PRD bao gồm Process Analysis, Use Case List, ERD, Epic/Story list.

```
Input : ELICITATION_TaskXXX_<slug>.md
Output: docs/ba/prd/PRD_TaskXXX_<slug>.md
```

Gọi:
```
Agent BA, tạo PRD Task023 từ: docs/ba/elicitation/ELICITATION_Task023_xxx.md
```

---

### 2.3 Bước 3 — BA: Prototype (Trụ 3)

Mục tiêu: tạo Mockup Prompt để dùng với Stitch / Google AI Studio.

```
Input : Danh sách Epic/Story từ PRD
Output: docs/ba/prototype/PROTO_TaskXXX_<slug>.md
        (chứa brand prompt + layout prompt + detail prompt cho mỗi màn hình)
```

Gọi:
```
Agent BA, tạo Prototype Prompt Task023 (theo Epic/Story đã có trong PRD)
```

---

### 2.4 Bước 4 — BA: User Story Spec (Trụ 4)

Mục tiêu: đặc tả kỹ thuật chi tiết từng User Story (UI Spec, Sequence, Activity Rules) để DEV implement.

```
Input : PRD + Mockup Detail từ Trụ 3
Output: docs/ba/user-story-specs/USS_TaskXXX_StoryYYY_<slug>.md (1 file/story)
```

Gọi:
```
Agent BA, đặc tả User Story Task023_Story001
```

---

### 2.5 [Owner Review] Approve PRD & USS

> ⚠️ **Bắt buộc**: Owner review và approve PRD + USS trước khi chuyển sang Agent PM.

---

### 2.6 Bước 5 — PM: Tạo Task + Điều phối chuỗi

Sau khi Owner approve, PM nhận PRD/SRS và tách thành Task để DEV thực thi.

```
Input : docs/srs/SRS_TaskXXX_<slug>.md (BA tổng hợp từ PRD + USS)
Output: docs/tasks/Task_UNIT_XXX.md, Task_FEATURE_XXX.md, Task_E2E_XXX.md
```

Khuyến nghị trigger:
- Tạo file: `AGENT_TRIGGERS/PM_RUN_SRS_TaskXXX_<slug>.md`
- Template: `AGENT_TRIGGERS/PM_RUN_TEMPLATE.md`

---

## 3. Luồng phụ: Change Request (Trụ 5)

Khi có yêu cầu thay đổi sau khi PRD/USS đã được duyệt:

```
Agent BA, xử lý Change Request Task023: [mô tả thay đổi]
```
Hoặc tạo file: `AGENT_TRIGGERS/BA_CR_Task023_<slug>.md`

BA sẽ:
1. Phân tích tác động (Impact Analysis)
2. Cập nhật PRD / USS bị ảnh hưởng
3. Nếu CR lớn → PM tạo Task mới

---

## 4. Luồng phụ: System Integration (Trụ 6)

Khi cần tích hợp hệ thống bên ngoài:

```
Agent BA, phân tích tích hợp Task023 với [tên API/đối tác]
```
Hoặc tạo file: `AGENT_TRIGGERS/BA_INT_Task023_<slug>.md`

Output: `docs/ba/integration/INTEGRATION_Task023_<slug>.md`

---

## 5. Cách dùng ADR (khi có ảnh hưởng kiến trúc)

- Template ADR: `docs/adr/ADR_TEMPLATE.md`
- Quy tắc: ADR phải có **NFR đầy đủ** (Performance / Scalability / Security / Reliability / Observability) trước khi approve PR.

Gọi:
```
Agent TECH_LEAD, viết ADR cho thay đổi này theo docs/adr/ADR_TEMPLATE.md
```

---

## 6. Cấu trúc thư mục output

```
docs/
├── ba/
│   ├── elicitation/          # Trụ 1
│   ├── prd/                  # Trụ 2
│   ├── prototype/            # Trụ 3
│   ├── user-story-specs/     # Trụ 4
│   ├── change-requests/      # Trụ 5
│   └── integration/          # Trụ 6
├── srs/                      # SRS tổng hợp → bàn giao PM
├── templates/
│   └── ba/
│       ├── ELICITATION_SUMMARY_TEMPLATE.md
│       ├── PRD_TEMPLATE.md
│       ├── USER_STORY_SPEC_TEMPLATE.md
│       └── INTEGRATION_SPEC_TEMPLATE.md
├── adr/                      # Architectural Decision Records
└── database/                 # DB specs (24 tables)
```

---

## 7. Lệnh hay dùng trong `mini-erp/`

```bash
npm run lint
npm test
npm run build
npm run dev       # dev server
```
