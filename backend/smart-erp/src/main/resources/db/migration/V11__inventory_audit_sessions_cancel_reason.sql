-- SRS Task021-028 / PO OQ-4 — lý do hủy đợt kiểm kê (Task027).
ALTER TABLE inventoryauditsessions ADD COLUMN IF NOT EXISTS cancel_reason VARCHAR(1000);
