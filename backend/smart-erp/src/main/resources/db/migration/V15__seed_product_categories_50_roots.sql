-- Seed demo: ~50 danh mục gốc + 3–4 danh mục con mỗi gốc (SRS Task029–033 / bảng categories).
-- Mã danh mục prefix DM50_ để không đụng seed V1/V6 (CAT001–CAT006).
-- Ràng buộc: category_code unique trong bản ghi active (V14); parent_id NULL = gốc.

INSERT INTO categories (category_code, name, description, parent_id, sort_order, status)
SELECT v.code,
       v.name,
       'Danh mục gốc bổ sung seed (SRS Task029–033).',
       NULL,
       v.sort_order,
       'Active'
FROM (VALUES
          ('DM50_001', 'Thịt heo tươi', 201),
          ('DM50_002', 'Thịt bò & cừu', 202),
          ('DM50_003', 'Gia cầm & Trứng', 203),
          ('DM50_004', 'Hải sản đông lạnh', 204),
          ('DM50_005', 'Hải sản tươi sống', 205),
          ('DM50_006', 'Rau lá xanh', 206),
          ('DM50_007', 'Rau củ quả', 207),
          ('DM50_008', 'Nấm & Đậu hũ', 208),
          ('DM50_009', 'Trái cây trong nước', 209),
          ('DM50_010', 'Trái cây nhập khẩu', 210),
          ('DM50_011', 'Gạo & Ngũ cốc', 211),
          ('DM50_012', 'Bún, miến, phở', 212),
          ('DM50_013', 'Mì ăn liền', 213),
          ('DM50_014', 'Dầu ăn & Mỡ', 214),
          ('DM50_015', 'Nước chấm & Xì dầu', 215),
          ('DM50_016', 'Gia vị khô', 216),
          ('DM50_017', 'Đường & Sữa đặc', 217),
          ('DM50_018', 'Bánh kẹo gói', 218),
          ('DM50_019', 'Đồ ăn vặt', 219),
          ('DM50_020', 'Sữa tươi & UHT', 220),
          ('DM50_021', 'Sữa chua & Phomat', 221),
          ('DM50_022', 'Bia & Rượu', 222),
          ('DM50_023', 'Nước ngọt', 223),
          ('DM50_024', 'Nước suối & Tăng lực', 224),
          ('DM50_025', 'Trà & Cà phê hòa tan', 225),
          ('DM50_026', 'Kem & Đồ ngọt đông lạnh', 226),
          ('DM50_027', 'Đồ hộp & Đóng gói', 227),
          ('DM50_028', 'Nguyên liệu làm bánh', 228),
          ('DM50_029', 'Hóa phẩm giặt tẩy', 229),
          ('DM50_030', 'Nước rửa chén & Sàn', 230),
          ('DM50_031', 'Vệ sinh nhà tắm', 231),
          ('DM50_032', 'Giấy ướt & Khăn giấy', 232),
          ('DM50_033', 'Gia dụng nhựa', 233),
          ('DM50_034', 'Dao, thớt & Dụng cụ bếp', 234),
          ('DM50_035', 'Bao bì & Túi nilon', 235),
          ('DM50_036', 'Đồ dùng học tập', 236),
          ('DM50_037', 'Văn phòng phẩm', 237),
          ('DM50_038', 'Pin & Đèn pin', 238),
          ('DM50_039', 'Phụ kiện điện tử nhỏ', 239),
          ('DM50_040', 'Quần áo may sẵn', 240),
          ('DM50_041', 'Giày dép', 241),
          ('DM50_042', 'Mũ nón', 242),
          ('DM50_043', 'Đồ chơi trẻ em', 243),
          ('DM50_044', 'Sữa bột & Ăn dặm', 244),
          ('DM50_045', 'Tã & Khăn sữa', 245),
          ('DM50_046', 'Chăn ga gối đệm', 246),
          ('DM50_047', 'Dụng cụ thể thao', 247),
          ('DM50_048', 'Thú cưng & Thức ăn chăn nuôi', 248),
          ('DM50_049', 'Làm vườn & Hạt giống', 249),
          ('DM50_050', 'Mỹ phẩm & Chăm sóc cá nhân', 250)
     ) AS v(code, name, sort_order);

-- Mỗi gốc DM50_XXX: 3 hoặc 4 con (sort_order chẵn → 4 con, lẻ → 3 con).
INSERT INTO categories (category_code, name, description, parent_id, sort_order, status)
SELECT p.category_code || '_C' || k.n::text,
       p.name || ' — ' ||
       CASE k.n
           WHEN 1 THEN 'Phân khúc tiêu chuẩn'
           WHEN 2 THEN 'Phân khúc cao cấp'
           WHEN 3 THEN 'Hàng khuyến mãi'
           ELSE 'Đặc biệt / Nhập khẩu'
           END,
       'Danh mục con (seed Task029–033).',
       p.id,
       k.n,
       'Active'
FROM categories p
         CROSS JOIN LATERAL generate_series(
        1,
        CASE WHEN (p.sort_order % 2) = 0 THEN 4 ELSE 3 END
                    ) AS k(n)
WHERE p.category_code ~ '^DM50_[0-9]{3}$'
  AND p.parent_id IS NULL
  AND p.deleted_at IS NULL;
