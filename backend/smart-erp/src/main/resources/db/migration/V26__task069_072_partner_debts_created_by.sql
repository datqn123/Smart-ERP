-- Task069–072 SRS: partnerdebts.created_by (POST/PATCH owner) + index list sort

ALTER TABLE partnerdebts
    ADD COLUMN IF NOT EXISTS created_by INT;

UPDATE partnerdebts pd
SET created_by = (SELECT u.id FROM users u ORDER BY u.id ASC LIMIT 1)
WHERE pd.created_by IS NULL;

ALTER TABLE partnerdebts
    ALTER COLUMN created_by SET NOT NULL;

ALTER TABLE partnerdebts
    ADD CONSTRAINT fk_partnerdebts_created_by
        FOREIGN KEY (created_by) REFERENCES users (id)
            ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_partnerdebts_updated_id
    ON partnerdebts (updated_at DESC, id DESC);
