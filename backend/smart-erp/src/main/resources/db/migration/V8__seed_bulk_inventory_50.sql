-- Bổ sung dữ liệu demo: 50 sản phẩm + đơn vị cơ sở + giá vốn + 1 dòng tồn / SP.
-- Mục đích: tải list/KPI đủ dày trên môi trường dev (PostgreSQL). category_id = NULL.
-- Giả định: V1/V6 đã có warehouselocations.id = 1.

INSERT INTO products (category_id, sku_code, name, status)
SELECT
  NULL::INT,
  'BULK-SEED-' || lpad(g::text, 3, '0'),
  'Hàng seed demo #' || g,
  'Active'
FROM generate_series(1, 50) AS g;

INSERT INTO productunits (product_id, unit_name, conversion_rate, is_base_unit)
SELECT p.id, 'Cái', 1.00, true
FROM products p
WHERE p.sku_code LIKE 'BULK-SEED-%';

INSERT INTO productpricehistory (product_id, unit_id, cost_price, sale_price, effective_date)
SELECT p.id, u.id, 10000.00, 12000.00, DATE '2025-01-01'
FROM products p
INNER JOIN productunits u ON u.product_id = p.id AND u.is_base_unit = true
WHERE p.sku_code LIKE 'BULK-SEED-%';

INSERT INTO inventory (product_id, location_id, batch_number, expiry_date, quantity, min_quantity)
SELECT p.id, 1, 'SEED-' || lpad(g::text, 3, '0'), NULL, 10 + (g % 45), 3
FROM generate_series(1, 50) AS g
INNER JOIN products p ON p.sku_code = 'BULK-SEED-' || lpad(g::text, 3, '0');
