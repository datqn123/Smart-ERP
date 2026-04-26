-- SRS Task021-028 v4: chờ duyệt Owner, Re-check, soft-delete, events, mở rộng CHECK status

ALTER TABLE inventoryauditsessions
    ALTER COLUMN status TYPE VARCHAR(50);

ALTER TABLE inventoryauditsessions
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

ALTER TABLE inventoryauditsessions
    ADD COLUMN IF NOT EXISTS owner_notes TEXT NULL;

ALTER TABLE inventoryauditsessions
    DROP CONSTRAINT IF EXISTS inventoryauditsessions_status_check;

ALTER TABLE inventoryauditsessions
    ADD CONSTRAINT inventoryauditsessions_status_check
        CHECK (status IN (
            'Pending',
            'In Progress',
            'Pending Owner Approval',
            'Completed',
            'Cancelled',
            'Re-check'
        ));

CREATE TABLE IF NOT EXISTS inventory_audit_session_events (
    id          SERIAL PRIMARY KEY,
    session_id  INT NOT NULL,
    event_type  VARCHAR(80) NOT NULL,
    payload     JSONB NULL,
    created_by  INT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_session_event_session
        FOREIGN KEY (session_id) REFERENCES inventoryauditsessions (id) ON DELETE CASCADE,

    CONSTRAINT fk_audit_session_event_user
        FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_audit_session_events_session
    ON inventory_audit_session_events (session_id);
