-- Task086: thêm permission can_view_system_logs cho system-logs APIs.
-- Đồng bộ với MenuPermissionClaims.MENU_KEYS và SRS_Task086_system-logs.md (Approved).
--
-- Owner/Admin: true; Staff: false (mặc định).
UPDATE roles
SET permissions = COALESCE(permissions, '{}'::jsonb) || jsonb_build_object('can_view_system_logs', TRUE)
WHERE name IN ('Owner', 'Admin');

UPDATE roles
SET permissions = COALESCE(permissions, '{}'::jsonb) || jsonb_build_object('can_view_system_logs', FALSE)
WHERE name = 'Staff';

