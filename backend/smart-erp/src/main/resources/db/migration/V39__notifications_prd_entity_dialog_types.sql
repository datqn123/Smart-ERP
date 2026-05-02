-- SRS_PRD_admin-notifications-entity-dialogs: distinct notification_type for FE dialog mapping
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
		'PasswordResetRequest',
		'StockReceiptPendingApproval',
		'StockDispatchPendingApproval',
		'StockDispatchShortage'
));
