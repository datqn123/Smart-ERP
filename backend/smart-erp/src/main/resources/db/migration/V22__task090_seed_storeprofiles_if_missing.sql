-- Task090: seed StoreProfiles để POS checkout có cấu hình kho mặc định.
-- Mục tiêu: nếu DB có Owner nhưng chưa có StoreProfiles → tạo 1 bản ghi tối thiểu.
-- Gán default_retail_location_id về một WarehouseLocations hợp lệ (MIN(id)).

-- 1) Seed StoreProfiles cho Owner thiếu profile
INSERT INTO storeprofiles (
  owner_id,
  name,
  business_category,
  address,
  phone,
  email,
  website,
  tax_code,
  footer_note,
  logo_url,
  facebook_url,
  instagram_handle,
  default_retail_location_id
)
SELECT
  u.id AS owner_id,
  'Cửa hàng mặc định' AS name,
  NULL,
  NULL,
  NULL,
  u.email AS email,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  (SELECT MIN(wl.id) FROM warehouselocations wl) AS default_retail_location_id
FROM users u
JOIN roles r ON r.id = u.role_id
LEFT JOIN storeprofiles sp ON sp.owner_id = u.id
WHERE r.name = 'Owner'
  AND sp.owner_id IS NULL;

-- 2) Defensive: nếu đã có StoreProfiles nhưng chưa set kho mặc định → set về MIN(id)
UPDATE storeprofiles
SET default_retail_location_id = (SELECT MIN(wl.id) FROM warehouselocations wl)
WHERE default_retail_location_id IS NULL;

