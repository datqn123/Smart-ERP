-- Mở rộng CHECK notification_type để hỗ trợ Task004 bell / Owner notify
DO $$
DECLARE
	r RECORD;
BEGIN
	FOR r IN
		SELECT c.conname
		FROM pg_constraint c
			JOIN pg_class t ON c.conrelid = t.oid
		WHERE t.relname = 'notifications'
			AND c.contype = 'c'
			AND pg_get_constraintdef(c.oid) LIKE '%notification_type%'
	LOOP
		EXECUTE format('ALTER TABLE notifications DROP CONSTRAINT %I', r.conname);
	END LOOP;
END $$;

ALTER TABLE notifications ADD CONSTRAINT notifications_notification_type_check CHECK (notification_type IN (
		'ApprovalResult',
		'LowStock',
		'ExpiryWarning',
		'SystemAlert',
		'PasswordResetRequest'
));
