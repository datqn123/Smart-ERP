-- PRD SRS_PRD_cash-transactions-admin-unified-multi-fund — đa quỹ, fund_id trên ledger/cash tx, category 500

CREATE TABLE IF NOT EXISTS cash_funds (
    id           SERIAL PRIMARY KEY,
    code         VARCHAR(30)  NOT NULL,
    name         VARCHAR(255) NOT NULL,
    is_default   BOOLEAN      NOT NULL DEFAULT FALSE,
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_cash_funds_code UNIQUE (code)
);

COMMENT ON TABLE cash_funds IS 'Quỹ tiền (tiền mặt, ngân hàng, …) — PRD thu chi đa quỹ';

CREATE INDEX IF NOT EXISTS idx_cash_funds_active_default ON cash_funds (is_active, is_default);

INSERT INTO cash_funds (code, name, is_default, is_active)
SELECT 'CASH', 'Tiền mặt quỹ chính', TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM cash_funds WHERE code = 'CASH');

INSERT INTO cash_funds (code, name, is_default, is_active)
SELECT 'BANK-001', 'TK ngân hàng mặc định', FALSE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM cash_funds WHERE code = 'BANK-001');

-- financeledger: nullable FK first, backfill, then NOT NULL
ALTER TABLE financeledger
    ADD COLUMN IF NOT EXISTS fund_id INT;

UPDATE financeledger fl
SET fund_id = (SELECT cf.id FROM cash_funds cf WHERE cf.is_default = TRUE ORDER BY cf.id LIMIT 1)
WHERE fl.fund_id IS NULL;

ALTER TABLE financeledger
    ADD CONSTRAINT fk_financeledger_fund FOREIGN KEY (fund_id) REFERENCES cash_funds (id);

ALTER TABLE financeledger
    ALTER COLUMN fund_id SET NOT NULL;

-- cashtransactions
ALTER TABLE cashtransactions
    ADD COLUMN IF NOT EXISTS fund_id INT;

UPDATE cashtransactions ct
SET fund_id = (SELECT cf.id FROM cash_funds cf WHERE cf.is_default = TRUE ORDER BY cf.id LIMIT 1)
WHERE ct.fund_id IS NULL;

ALTER TABLE cashtransactions
    ADD CONSTRAINT fk_cashtransactions_fund FOREIGN KEY (fund_id) REFERENCES cash_funds (id);

ALTER TABLE cashtransactions
    ALTER COLUMN fund_id SET NOT NULL;

-- category length (PostgreSQL)
ALTER TABLE cashtransactions
    ALTER COLUMN category TYPE VARCHAR(500);
