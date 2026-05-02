-- SRS_PRD_customers-admin-soft-delete-single: soft delete + partial unique customer_code (active rows only).

ALTER TABLE customers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_customer_code_key;

CREATE UNIQUE INDEX IF NOT EXISTS uq_customers_customer_code_active
    ON customers (customer_code) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_customers_deleted_at ON customers (deleted_at) WHERE deleted_at IS NOT NULL;
