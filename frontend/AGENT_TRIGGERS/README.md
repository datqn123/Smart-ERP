# AGENT_TRIGGERS - File trigger để chạy Agent workflow

Thư mục này chứa các file mẫu để **kích hoạt Agent bằng “tên file”** (theo cơ chế đã mô tả trong `AGENTS/AGENT_REGISTRY.md`: file bắt đầu bằng tên Agent sẽ kích hoạt Agent đó).

**Quy tắc điều phối (bắt buộc khi Owner yêu cầu “chạy workflow”)**: `AGENTS/WORKFLOW_RULE.md`  
**Đọc tối thiểu theo loại task (tiết kiệm token)**: `AGENTS/docs/CONTEXT_INDEX.md`

## Quy ước chung

- File trigger **bắt đầu bằng tên Agent**:
  - `PLANNER_*.md` — intake + Q&A + `AGENTS/docs/planner/PLANNER_BRIEF_*`; xem `AGENTS/PLANNER_AGENT_INSTRUCTIONS.md`
  - `BA_*.md`
  - `PM_*.md`
  - `TECH_LEAD_*.md`
  - `DEV_*.md`
  - `CODEBASE_ANALYST_*.md`
  - `DOC_SYNC_*.md`

## Trigger chạy toàn chuỗi (khuyến nghị)

- Dùng file `PM_RUN_SRS_TaskXXX_<slug>.md` để PM tự điều phối theo thứ tự bắt buộc:

`PM -> TECH_LEAD -> DEV -> CODEBASE_ANALYST -> DOC_SYNC`

Xem template: `AGENT_TRIGGERS/PM_RUN_TEMPLATE.md`

