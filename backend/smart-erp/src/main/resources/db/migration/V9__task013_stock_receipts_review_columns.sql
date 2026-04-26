-- Task013 / SRS OQ-1 — bổ sung cột duyệt/từ chối theo UC §17 (Database_Specification).

ALTER TABLE stockreceipts ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE stockreceipts ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;
ALTER TABLE stockreceipts ADD COLUMN IF NOT EXISTS reviewed_by INT;

DO $$
BEGIN
  ALTER TABLE stockreceipts
    ADD CONSTRAINT fk_sr_reviewed_by_users FOREIGN KEY (reviewed_by) REFERENCES users (id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_sr_reviewed_at ON stockreceipts (reviewed_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_sr_receipt_date ON stockreceipts (receipt_date DESC, id DESC);

UPDATE stockreceipts
SET reviewed_at = approved_at, reviewed_by = approved_by
WHERE status = 'Approved' AND reviewed_at IS NULL AND approved_at IS NOT NULL;
