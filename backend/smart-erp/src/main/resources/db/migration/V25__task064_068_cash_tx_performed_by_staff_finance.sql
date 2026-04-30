-- SRS Task064-068 (PO Approved): OQ-1(a) + OQ-4 (cột performed_by)
-- OQ-1(a): đồng bộ Task063 — mọi endpoint thu chi dùng can_view_finance; bật cho role Staff.
UPDATE roles
SET permissions = permissions || '{"can_view_finance": true}'::jsonb
WHERE LOWER(name) = 'staff';

-- OQ-4: cột người thực hiện — seed = created_by; PATCH cập nhật theo user hiện tại khi triển khai BE.
ALTER TABLE cashtransactions
    ADD COLUMN IF NOT EXISTS performed_by INT;

UPDATE cashtransactions SET performed_by = created_by WHERE performed_by IS NULL;

ALTER TABLE cashtransactions
    ADD CONSTRAINT fk_cash_tx_performed_by FOREIGN KEY (performed_by) REFERENCES Users(id);

ALTER TABLE cashtransactions ALTER COLUMN performed_by SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cash_tx_created_at ON cashtransactions (created_at DESC, id DESC);
