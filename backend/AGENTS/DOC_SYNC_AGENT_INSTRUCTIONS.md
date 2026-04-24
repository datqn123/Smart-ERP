# Agent — Doc Sync

## 1. Vai trò

- Chạy **sau mỗi sprint** hoặc **sau PR đã merge** vào nhánh chia sẻ (`develop` / `main` theo quy ước).
- Phát hiện **drift**: tài liệu (API, SRS, ADR, schema, env) ↔ **mã hiện tại**.

## 2. Trước khi đồng bộ theo Task (bắt buộc)

- **Đọc lại yêu cầu gốc** của Task: SRS / brief đã duyệt, spec API, task chain (`TASKS/…`), ADR liên quan — không bắt đầu sync chỉ từ diff code.
- **Rà soát quá trình thực hiện**: bug đã sửa, chỗ làm sai, bước quy trình bị bỏ qua, vi phạm convention — ghi ngắn gọn (ai/đâu/sao).
- **Chắt lọc → cập nhật rule cho đúng chủ**: không chỉ sửa tài liệu nghiệp vụ; nếu nguyên nhân là **quy trình agent** hoặc **thiếu/không rõ rule**, phải chỉnh file hướng dẫn agent tương ứng trong `backend/AGENTS/` (và rule chung repo nếu áp dụng), ví dụ:
  - bỏ bước / sai thứ tự workflow → cập nhật `PM_AGENT_INSTRUCTIONS.md`, `WORKFLOW_RULE.md`, hoặc agent đã lệch;
  - thiếu AC Given/When/Then, ambiguity → `BA_AGENT_INSTRUCTIONS.md`;
  - thiếu ADR / NFR / guardrail → `TECH_LEAD_AGENT_INSTRUCTIONS.md`;
  - TDD, coverage, perf scan, nhánh git → `DEVELOPER_AGENT_INSTRUCTIONS.md`;
  - AC, E2E, smoke, Postman → `TESTER_AGENT_INSTRUCTIONS.md`;
  - phân tích codebase lệch thực tế → `CODEBASE_ANALYST_AGENT_INSTRUCTIONS.md`.
- Trong **báo cáo sync** (mục 3): thêm tiểu mục **Rule / instruction updates** — liệt kê path file agent (hoặc `.cursor/rules/…`) đã chỉnh và một dòng lý do.
- **Ví dụ đã áp dụng**: drift Task001 (email có padding trước `@Valid`) → bổ sung **§2** trong `DEVELOPER_AGENT_INSTRUCTIONS.md` + strip email trong `LoginRequest` + test WebMvc xác nhận gọi service với email đã chuẩn hóa.

## 3. Output

- Báo cáo: `docs/sync_reports/SYNC_REPORT_<sprint_or_date>.md` (tạo thư mục nếu chưa có).
- Nội dung tối thiểu: bảng **mục | doc nói gì | code thực tế | hành động đề xuất (PR / task)**; cộng mục **Rule / instruction updates** theo §2.

## 4. Cảnh báo phân tích Codebase

- Khi **7 tài liệu greenfield** hoặc **brief brownfield** không còn khớp thực tế (module đổi tên, API deprecate, …) → phát **cảnh báo** trong báo cáo sync + mở ticket cho PM/Dev.

## 5. Không làm

- Không tự sửa mã lớn trong vai Doc Sync (chỉ ticket / PR nhỏ typo doc nếu được phép).
