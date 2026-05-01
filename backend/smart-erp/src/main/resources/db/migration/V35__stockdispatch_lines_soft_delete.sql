-- Manual phiếu xuất (order_id NULL): dòng chờ — chưa trừ tồn cho đến khi Delivered.
-- Soft delete phiếu: deleted_at + audit.

CREATE TABLE IF NOT EXISTS stockdispatch_lines (
    id           BIGSERIAL PRIMARY KEY,
    dispatch_id  BIGINT NOT NULL REFERENCES stockdispatches (id) ON DELETE CASCADE,
    inventory_id BIGINT NOT NULL REFERENCES inventory (id),
    quantity     INTEGER NOT NULL CHECK (quantity > 0),
    CONSTRAINT uq_stockdispatch_line UNIQUE (dispatch_id, inventory_id)
);

CREATE INDEX IF NOT EXISTS ix_stockdispatch_lines_dispatch ON stockdispatch_lines (dispatch_id);

ALTER TABLE stockdispatches
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS deleted_by_user_id INTEGER REFERENCES users (id),
    ADD COLUMN IF NOT EXISTS delete_reason TEXT;

CREATE INDEX IF NOT EXISTS ix_stockdispatches_deleted_active ON stockdispatches (deleted_at)
    WHERE deleted_at IS NULL;

COMMENT ON COLUMN stockdispatches.delete_reason IS 'Lý do xóa mềm (creator hoặc Admin).';
