-- Task002: soft revoke refresh tại logout (SRS §6.2)
ALTER TABLE refresh_tokens
    ADD COLUMN IF NOT EXISTS delete_ymd TIMESTAMPTZ NULL;

COMMENT ON COLUMN refresh_tokens.delete_ymd IS 'Thời điểm thu hồi (soft delete). NULL = còn hiệu lực.';
