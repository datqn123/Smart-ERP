# docs/srs - Software Requirements Specification (SRS)

Thư mục này chứa **SRS chính thức** cho từng tính năng của Mini-ERP.

## Quy ước đặt tên

- Mỗi SRS là 1 file: `SRS_TaskXXX_<slug>.md`
- `TaskXXX` là mã task 3 chữ số (vd: `Task016`, `Task003`).
- `<slug>` dùng **kebab-case**, ngắn gọn, phản ánh tính năng.
  - Ví dụ: `SRS_Task016_fix-stock-status-dropdown-visibility.md`, `SRS_Task007_stock-receipt-approval.md`

## Quy trình sử dụng (dành cho Agent BA)

- Agent BA nhận “yêu cầu thô” → nếu thiếu thông tin quan trọng thì hỏi tối đa **3 câu** → tạo/ghi SRS theo template.
- Không sinh `TASKS/TaskXXX.md` trong pha BA (SRS-only).
- Không bịa DB/table/route: mọi mapping phải bám các tài liệu:
  - `RULES.md`, `FUNCTIONAL_SUMMARY.md`, `overall-project.md`, `Tech-Stack.md`
  - `docs/database/` và `docs/UC/`

## Template chuẩn

- Dùng file: `docs/srs/SRS_TEMPLATE.md`

