-- Task054–060 / SRS §10: Vouchers, salesorders.voucher_id + pos_shift_ref, WALKIN, seed DISCOUNT10.

CREATE TABLE vouchers (
    id               SERIAL         PRIMARY KEY,
    code             VARCHAR(50)    NOT NULL UNIQUE,
    name             VARCHAR(255),
    discount_type    VARCHAR(20)    NOT NULL
                                    CHECK (discount_type IN ('Percent', 'FixedAmount')),
    discount_value   NUMERIC(12, 2) NOT NULL,
    is_active        BOOLEAN        NOT NULL DEFAULT TRUE,
    valid_from       DATE,
    valid_to         DATE,
    created_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE vouchers IS 'Mã giảm giá POS / retail checkout (SRS OQ-3).';

CREATE TRIGGER trg_vouchers_updated BEFORE UPDATE ON vouchers FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

ALTER TABLE salesorders
    ADD COLUMN IF NOT EXISTS voucher_id INT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_so_voucher'
    ) THEN
        ALTER TABLE salesorders
            ADD CONSTRAINT fk_so_voucher FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE SET NULL;
    END IF;
END $$;

ALTER TABLE salesorders
    ADD COLUMN IF NOT EXISTS pos_shift_ref VARCHAR(100) NULL;

CREATE INDEX IF NOT EXISTS idx_salesorders_voucher ON salesorders (voucher_id);

INSERT INTO vouchers (code, name, discount_type, discount_value, is_active, valid_from, valid_to)
VALUES ('DISCOUNT10', 'Giảm 10%', 'Percent', 10, TRUE, NULL, NULL)
ON CONFLICT (code) DO NOTHING;

INSERT INTO customers (customer_code, name, phone, email, address, loyalty_points, status)
SELECT 'WALKIN', 'Khách lẻ', '0900000000', NULL, NULL, 0, 'Active'
WHERE NOT EXISTS (SELECT 1 FROM customers c WHERE c.customer_code = 'WALKIN');
