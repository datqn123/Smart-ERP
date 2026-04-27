-- Seed 100 khách hàng demo (UC quản lý khách hàng / phân trang).
-- Mã KH-DEMO-001 … KH-DEMO-100 — tách biệt mã do người dùng tạo (vd. KH00001).
-- Idempotent: ON CONFLICT (customer_code) DO NOTHING.

INSERT INTO customers (customer_code, name, phone, email, address, loyalty_points, status)
SELECT
    'KH-DEMO-' || lpad(i::text, 3, '0'),
    (ARRAY [
        'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Thu Dung', 'Hoàng Minh Em',
        'Vũ Lan Phương', 'Đặng Quốc Giang', 'Bùi Thị Hương', 'Đỗ Văn Kiên', 'Ngô Thị Lan',
        'Dương Văn Mạnh', 'Lý Thị Ngọc', 'Mai Văn Oanh', 'Võ Thị Phượng', 'Tôn Văn Quân',
        'Châu Thị Quyên', 'Hồ Văn Sơn', 'Lương Thị Tâm', 'Cao Văn Uy', 'Đinh Thị Vân',
        'Khúc Văn Xương', 'Tăng Thị Yến', 'Hà Văn Anh', 'Phan Thị Bích', 'Vương Văn Cần'
    ])[(i % 25) + 1],
    '0901' || lpad(((100000 + i) % 1000000)::text, 6, '0'),
    'kh.demo.' || lpad(i::text, 3, '0') || '@example.invalid',
    (ARRAY [
        '123 Lê Lợi, P. Bến Nghé, TP.HCM',
        '45 Trần Hưng Đạo, P. Cầu Kho, TP.HCM',
        '8 Hoàng Diệu, Ba Đình, Hà Nội',
        '120 Nguyễn Huệ, Hải Châu, Đà Nẵng',
        '15 Trần Phú, Ninh Kiều, Cần Thơ',
        '77 Lý Tự Trọng, Nha Trang, Khánh Hòa',
        '3 Pasteur, P. Bến Nghé, TP.HCM',
        '200 Lê Duẩn, Đống Đa, Hà Nội'
    ])[(i % 8) + 1],
    ((i * 37 + 11) % 5001),
    CASE WHEN i % 11 = 0 THEN 'Inactive' ELSE 'Active' END
FROM generate_series(1, 100) AS i
ON CONFLICT (customer_code) DO NOTHING;
