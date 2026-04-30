-- Task092: giới hạn lượt dùng voucher + log gắn đơn (SRS §10).

ALTER TABLE vouchers
    ADD COLUMN IF NOT EXISTS used_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE vouchers
    ADD COLUMN IF NOT EXISTS max_uses INTEGER NULL;

COMMENT ON COLUMN vouchers.used_count IS 'Số lần đã áp dụng thành công tại checkout (Task092).';
COMMENT ON COLUMN vouchers.max_uses IS 'NULL = không giới hạn lượt.';

CREATE TABLE IF NOT EXISTS voucher_redemptions (
    id               SERIAL         PRIMARY KEY,
    voucher_id       INT            NOT NULL REFERENCES vouchers (id) ON DELETE CASCADE,
    sales_order_id   INT            NOT NULL REFERENCES salesorders (id) ON DELETE CASCADE,
    created_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_voucher_redemptions_order UNIQUE (sales_order_id)
);

CREATE INDEX IF NOT EXISTS idx_voucher_redemptions_voucher ON voucher_redemptions (voucher_id);

COMMENT ON TABLE voucher_redemptions IS 'Log mỗi lần voucher được ghi nhận trên đơn bán lẻ (Task092).';
