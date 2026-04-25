-- Task005 / màn tồn kho: seed tối thiểu danh mục, sản phẩm, đơn vị cơ sở, giá vốn, dòng tồn
-- mẫu — đủ JOIN cho GET /api/v1/inventory. Giả định V1 đã tạo Categories(1-4) và WarehouseLocations(1-5).

-- ---------------------------------------------------------------------------
-- 1) Danh mục bổ sung (id 5,6)
-- ---------------------------------------------------------------------------
INSERT INTO Categories (category_code, name, description, sort_order) VALUES
    ('CAT005', 'Bánh kẹo', 'Bánh, snack, kẹo gói', 5),
    ('CAT006', 'Gia vị', 'Muối, đường, mắm, nước tương', 6);

-- ---------------------------------------------------------------------------
-- 2) Sản phẩm (sku_code unique)
--    category: 1 Thực phẩm khô, 2 Đồ uống, 3 Hóa phẩm, 5+6 mới
-- ---------------------------------------------------------------------------
INSERT INTO Products (category_id, sku_code, barcode, name, status) VALUES
    (2, 'DEMO-NUOC-500',  '8931234560001', 'Nước suối 500ml',     'Active'),
    (1, 'TP-MI-001',      '8932001002003', 'Mì gói hương vị gà',   'Active'),
    (1, 'TP-GAO-5',       '8932011003001', 'Gạo tẻ 5kg',         'Active'),
    (5, 'BK-OREO-1',     '4008400405012',  'Bánh quy socola 137g', 'Active'),
    (2, 'UONG-COKE-24',  '4221050012340',  'Coca 330ml thùng 24',  'Active'),
    (3, 'HPH-RC-1L5',    '8930005006001', 'Nước rửa chén 1.5L',  'Active'),
    (2, 'UONG-SUA-1L',   '8932007008002',  'Sữa tươi tiệt trùng 1L', 'Active'),
    (6, 'GV-NM-500',     '8932014009001',  'Nước mắm 40°N 500ml', 'Active');

-- ---------------------------------------------------------------------------
-- 3) Đơn vị cơ sở: mỗi SP đúng 1 dòng is_base_unit = true
-- ---------------------------------------------------------------------------
INSERT INTO ProductUnits (product_id, unit_name, conversion_rate, is_base_unit)
SELECT p.id, u.unit, u.cr, true
FROM Products p
JOIN (VALUES
    ('DEMO-NUOC-500',  'Chai', 1.0),
    ('TP-MI-001',      'Gói', 1.0),
    ('TP-GAO-5',       'Túi', 1.0),
    ('BK-OREO-1',      'Hộp', 1.0),
    ('UONG-COKE-24',  'Thùng', 1.0),
    ('HPH-RC-1L5',     'Chai', 1.0),
    ('UONG-SUA-1L',   'Hộp', 1.0),
    ('GV-NM-500',     'Chai', 1.0)
) AS u(sku, unit, cr) ON p.sku_code = u.sku;

-- ---------------------------------------------------------------------------
-- 4) Lịch sử giá (1 bản ghi — giá “hiện tại” khi effect_date cũ nhưng mới nhất theo thứ tự id)
-- ---------------------------------------------------------------------------
INSERT INTO ProductPriceHistory (product_id, unit_id, cost_price, sale_price, effective_date)
SELECT p.id, u.id, v.c, v.s, DATE '2024-01-15'
FROM Products p
JOIN ProductUnits u ON u.product_id = p.id AND u.is_base_unit = true
JOIN (VALUES
    ('DEMO-NUOC-500', 3500,  5500),
    ('TP-MI-001',     3000,  4500),
    ('TP-GAO-5',      80000, 100000),
    ('BK-OREO-1',     8000,  12000),
    ('UONG-COKE-24',  160000, 200000),
    ('HPH-RC-1L5',   15000,  22000),
    ('UONG-SUA-1L',  20000,  28000),
    ('GV-NM-500',   20000,  32000)
) AS v(sku, c, s) ON p.sku_code = v.sku;

-- ---------------------------------------------------------------------------
-- 5) Tồn kho (batch khác nhau theo uq: product+location+batch)
--    Gợi ý: 1 dòng cận hạn 30 ngày; 1 dòng hết hàng; vài dòng sắp hết; còn hàng
-- ---------------------------------------------------------------------------
INSERT INTO Inventory (product_id, location_id, batch_number, expiry_date, quantity, min_quantity)
SELECT p.id, t.lid, t.bnum, t.exp, t.qty, t.mq
FROM (VALUES
    ('DEMO-NUOC-500'::text, 1, 'LOT-2026-01'::text, DATE '2026-12-31', 240,  50),
    ('TP-MI-001',          1, 'B-MI-1',              NULL::date,          6,  20),
    ('TP-GAO-5',           2, 'B-GAO-2026-01',        NULL::date,        120,  50),
    ('BK-OREO-1',         3, 'BK-01',               NULL::date,         7,  20),
    ('UONG-COKE-24',        1, 'T-24-A',                NULL::date,       10,  5),
    ('UONG-COKE-24',        1, 'T-24-ZERO',             NULL::date,        0,  3),
    ('HPH-RC-1L5',          5, 'B-HSD',                 CURRENT_DATE + 18, 22,  5),
    ('UONG-SUA-1L',        4, 'S-1',                 NULL::date,       100,  30),
    ('GV-NM-500',          2, 'M-2026-02',            NULL::date,        3,  5)
) AS t(sku, lid, bnum, exp, qty, mq)
JOIN products p ON p.sku_code = t.sku;