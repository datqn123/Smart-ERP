-- Seed demo: ~10 đợt kiểm kê (inventoryauditsessions) + 1 dòng tồn / đợt (inventoryauditlines).
-- Nguồn tồn: bảng inventory (sản phẩm seed V6 + V8). created_by = admin (users.id = 1).
-- Mã phiên: DEMO-KK-V13-.. — tránh pattern KK-{năm}-* để không lệch nextAuditSequenceSuffix.
-- Idempotent: bỏ qua toàn bộ nếu đã có DEMO-KK-V13-01.
-- Dialect: PostgreSQL.

INSERT INTO inventoryauditsessions (
    audit_code,
    title,
    audit_date,
    status,
    location_filter,
    category_filter,
    notes,
    created_by,
    completed_at,
    completed_by,
    cancel_reason
)
SELECT v.audit_code,
       v.title,
       v.audit_date,
       v.status,
       v.location_filter,
       v.category_filter,
       v.notes,
       1,
       v.completed_at,
       v.completed_by,
       v.cancel_reason
FROM (VALUES
          ('DEMO-KK-V13-01', 'Kiểm kê định kỳ tháng 1/2026 — khu khô A',
              DATE '2026-01-18', 'Completed', 'WH01', NULL,
              'Đối soát xong, khớp sổ.', TIMESTAMPTZ '2026-01-20 10:00:00+07', 1, NULL::varchar(1000)),
          ('DEMO-KK-V13-02', 'Kiểm kê đột xuất đồ uống',
              DATE '2026-02-03', 'Completed', 'WH01', 'CAT002',
              'Phát hiện lệch thùng Coke.', TIMESTAMPTZ '2026-02-05 14:30:00+07', 1, NULL::varchar(1000)),
          ('DEMO-KK-V13-03', 'Kiểm kê đang thực hiện — toàn kho chính',
              DATE '2026-03-10', 'In Progress', 'WH01', NULL,
              'Đang đếm lại kệ B.', NULL::timestamptz, NULL::int, NULL::varchar(1000)),
          ('DEMO-KK-V13-04', 'Kiểm kê bánh kẹo & snack',
              DATE '2026-03-12', 'In Progress', NULL, 'CAT005',
              NULL, NULL::timestamptz, NULL::int, NULL::varchar(1000)),
          ('DEMO-KK-V13-05', 'Đợt kiểm kê chờ bắt đầu Q2',
              DATE '2026-04-01', 'Pending', NULL, NULL,
              'Chưa phân công nhóm đếm.', NULL::timestamptz, NULL::int, NULL::varchar(1000)),
          ('DEMO-KK-V13-06', 'Kiểm kê chờ Owner duyệt chênh lệch',
              DATE '2026-04-08', 'Pending Owner Approval', 'WH01', NULL,
              'Gửi duyệt sau khi đếm xong.', NULL::timestamptz, NULL::int, NULL::varchar(1000)),
          ('DEMO-KK-V13-07', 'Re-check sau đợt tháng 3',
              DATE '2026-04-15', 'Re-check', 'WH01', NULL,
              'Làm lại một phần vị trí nghi ngờ.', NULL::timestamptz, NULL::int, NULL::varchar(1000)),
          ('DEMO-KK-V13-08', 'Kiểm kê hủy — trùng lịch sự kiện',
              DATE '2026-04-20', 'Cancelled', NULL, NULL,
              NULL, NULL::timestamptz, NULL::int, 'Trùng lịch đóng cửa kho cuối tuần.'),
          ('DEMO-KK-V13-09', 'Kiểm kê hóa phẩm & gia dụng',
              DATE '2026-04-22', 'Completed', NULL, NULL,
              'Hoàn tất, cập nhật min stock.', TIMESTAMPTZ '2026-04-23 09:00:00+07', 1, NULL::varchar(1000)),
          ('DEMO-KK-V13-10', 'Kiểm kê nhanh trước kiểm định',
              DATE '2026-04-25', 'Pending', 'WH01', NULL,
              NULL, NULL::timestamptz, NULL::int, NULL::varchar(1000))
     ) AS v(audit_code, title, audit_date, status, location_filter, category_filter, notes,
            completed_at, completed_by, cancel_reason)
WHERE NOT EXISTS (SELECT 1 FROM inventoryauditsessions s WHERE s.audit_code = 'DEMO-KK-V13-01');

INSERT INTO inventoryauditlines (session_id, inventory_id, system_quantity, actual_quantity, is_counted, notes)
SELECT s.id,
       i.id,
       i.quantity::numeric(12, 4),
       CASE s.audit_code
           WHEN 'DEMO-KK-V13-01' THEN i.quantity::numeric(12, 4)
           WHEN 'DEMO-KK-V13-02' THEN GREATEST(i.quantity - 1, 0)::numeric(12, 4)
           WHEN 'DEMO-KK-V13-04' THEN i.quantity::numeric(12, 4)
           WHEN 'DEMO-KK-V13-06' THEN i.quantity::numeric(12, 4)
           WHEN 'DEMO-KK-V13-09' THEN i.quantity::numeric(12, 4)
           ELSE NULL::numeric(12, 4)
           END,
       ln.is_counted,
       ln.line_notes
FROM inventoryauditsessions s
         INNER JOIN (SELECT id,
                            quantity,
                            ROW_NUMBER() OVER (ORDER BY id) AS rn
                     FROM inventory
                     LIMIT 10) i ON i.rn = CAST(split_part(s.audit_code, '-', 4) AS int)
         INNER JOIN (VALUES ('DEMO-KK-V13-01', TRUE, NULL::varchar),
                            ('DEMO-KK-V13-02', TRUE, 'Cần Owner xác nhận lệch'::varchar),
                            ('DEMO-KK-V13-03', FALSE, NULL::varchar),
                            ('DEMO-KK-V13-04', TRUE, NULL::varchar),
                            ('DEMO-KK-V13-05', FALSE, NULL::varchar),
                            ('DEMO-KK-V13-06', TRUE, NULL::varchar),
                            ('DEMO-KK-V13-07', FALSE, NULL::varchar),
                            ('DEMO-KK-V13-08', FALSE, NULL::varchar),
                            ('DEMO-KK-V13-09', TRUE, NULL::varchar),
                            ('DEMO-KK-V13-10', FALSE, NULL::varchar)
                   ) AS ln(code, is_counted, line_notes) ON ln.code = s.audit_code
WHERE s.audit_code LIKE 'DEMO-KK-V13-%'
  AND NOT EXISTS (SELECT 1 FROM inventoryauditlines x WHERE x.session_id = s.id);
