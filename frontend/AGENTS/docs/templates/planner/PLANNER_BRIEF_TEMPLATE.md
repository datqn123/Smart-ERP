# PLANNER BRIEF — TaskXXX / <slug>

> **Trạng thái**: `Draft` | `Approved`  
> **Task ID**: `TaskXXX`  
> **Loại nhiệm vụ** (chọn một): `API_DESIGN` | `BA_DOCUMENTATION` | `MIXED` | `OTHER`

---

## 1. Tóm tắt phạm vi (Owner đã xác nhận qua Agent Planner)

- **Feature / mục tiêu**:
- **In-scope**:
- **Out-of-scope**:
- **Ràng buộc** (thời gian, kỹ thuật, RBAC nếu có):

---

## 2. Nhật ký Q&A (Planner ↔ Owner)

| # | Câu hỏi (Planner) | Trả lời (Owner) |
| :- | :---------------- | :-------------- |
| 1 | | |
| 2 | | |

_(Thêm dòng khi có vòng hỏi mới.)_

---

## 3. Quyết định đã chốt (Decision log)

- 
- 

---

## 4. Phê duyệt (bắt buộc trước khi gọi Agent tiếp theo)

- [ ] Owner xác nhận nội dung mục 1–3 đủ để bàn giao.
- **Chữ ký / xác nhận**: _(ví dụ: chữ "Approved" trong chat + ngày, hoặc cập nhật trường dưới)_
- **Ngày Approved**: `YYYY-MM-DD`
- **Agent tiếp theo (tự động theo loại)**:
  - `API_DESIGN` → Agent **API_SPEC** (đọc brief này + `API_PROJECT_DESIGN.md` + UC/DB).
  - `BA_DOCUMENTATION` → Agent **BA** (đọc brief này; **không** chờ duyệt Owner lần hai giữa các trụ trong phạm vi brief — xem `BA_AGENT_INSTRUCTIONS.md` §1.1).

---

## 5. Tham chiếu nhanh

- UC liên quan: `docs/UC/...`
- SRS/PRD hiện có (nếu có):
- Ghi chú cho Agent downstream:
- **Context tối thiểu**: [`CONTEXT_INDEX.md`](../../CONTEXT_INDEX.md) (loại task tương ứng).

---

## 6. Session handoff (khi kết thúc phiên Planner hoặc trước Agent downstream)

Điền ngắn gọn (**5–15 dòng** tổng) để thread sau không phải đọc lại toàn bộ chat.

| Hạng mục | Nội dung |
| :------- | :------- |
| **Ngày / Task** | |
| **Trạng thái brief** | Draft / Approved |
| **Tóm tắt đã chốt với Owner** | |
| **Điểm còn mơ hồ (nếu có)** | |
| **Lệnh gợi ý cho Agent tiếp theo** | (một dòng, ví dụ: `Agent API_SPEC, …`) |
