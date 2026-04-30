-- Task073-075: thêm permission can_view_store_profile cho store-profile APIs.
-- Đồng bộ với MenuPermissionClaims.MENU_KEYS và SRS_Task073-075_store-profile-api.md (Approved).

-- Owner/Admin: true; Staff: false (mặc định).
UPDATE roles
SET permissions = COALESCE(permissions, '{}'::jsonb) || jsonb_build_object('can_view_store_profile', TRUE)
WHERE name IN ('Owner', 'Admin');

UPDATE roles
SET permissions = COALESCE(permissions, '{}'::jsonb) || jsonb_build_object('can_view_store_profile', FALSE)
WHERE name = 'Staff';

