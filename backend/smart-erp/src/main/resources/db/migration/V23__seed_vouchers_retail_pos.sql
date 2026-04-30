-- Bổ sung mã voucher POS / retail checkout (sau V19: bảng vouchers + DISCOUNT10).
-- Idempotent theo UNIQUE(code): ON CONFLICT DO NOTHING.
-- Điều kiện hiệu lực tại runtime: VoucherJdbcRepository (is_active, valid_from / valid_to).

-- 1) Mã dùng được (UAT / demo)
INSERT INTO vouchers (code, name, discount_type, discount_value, is_active, valid_from, valid_to)
VALUES
  ('SAVE20K', 'Giảm 20.000đ đơn tối thiểu', 'FixedAmount', 20000, TRUE, NULL, NULL),
  ('WEEKEND15', 'Cuối tuần giảm 15%', 'Percent', 15, TRUE, DATE '2026-01-01', DATE '2026-12-31'),
  ('VIP5', 'Khách VIP 5%', 'Percent', 5, TRUE, NULL, NULL)
ON CONFLICT (code) DO NOTHING;

-- 2) Mã phục vụ test từ chối / không áp dụng (hết hạn, chưa hiệu lực, tắt)
INSERT INTO vouchers (code, name, discount_type, discount_value, is_active, valid_from, valid_to)
VALUES
  ('EXPIRED1', 'Đã hết hạn', 'Percent', 10, TRUE, DATE '2025-01-01', DATE '2025-12-31'),
  ('FUTURE1', 'Chưa đến hiệu lực', 'Percent', 10, TRUE, DATE '2027-06-01', NULL),
  ('OFFLINE', 'Tạm tắt', 'FixedAmount', 50000, FALSE, NULL, NULL)
ON CONFLICT (code) DO NOTHING;
