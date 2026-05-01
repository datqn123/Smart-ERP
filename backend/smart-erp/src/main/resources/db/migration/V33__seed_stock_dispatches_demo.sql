-- Seed phiếu xuất kho demo (16 bản ghi) cho UI danh sách / lọc.
-- Phụ thuộc: V32 (order_id nullable + reference_label), có ít nhất 1 user.
-- Ước lượng: V21 seed salesorders (~60 đơn) → 12 phiếu gắn đơn luân phiên; 4 phiếu xuất không đơn.
-- Idempotent theo dispatch_code (ON CONFLICT DO NOTHING). Mã ngắn: PX3301…PX3316.

INSERT INTO stockdispatches (
    dispatch_code,
    order_id,
    user_id,
    dispatch_date,
    status,
    notes,
    reference_label
)
SELECT
    'PX33' || lpad(gs::text, 2, '0'),
    CASE
        WHEN gs <= 12 THEN (
            SELECT so.id
            FROM salesorders so
            ORDER BY so.id
            LIMIT 1
            OFFSET (
                (gs - 1) % GREATEST((SELECT COUNT(*)::int FROM salesorders), 1)
            )
        )
        ELSE NULL
    END,
    u.id,
    (CURRENT_DATE - (((gs - 1) * 2) % 40))::date,
    (ARRAY['Pending', 'Full', 'Partial', 'Cancelled']::varchar[])[1 + ((gs - 1) % 4)],
    CASE
        WHEN gs % 6 = 0 THEN 'Giao trong giờ hành chính'
        WHEN gs % 9 = 0 THEN 'Kiểm tra seal trước khi giao'
        ELSE NULL
    END,
    CASE
        WHEN gs > 12 THEN (ARRAY[
            'Xuất điều chỉnh tồn — kiểm kê',
            'Trả hàng NCC — lô không đạt QC',
            'Cấp NVL phân xưởng nội bộ',
            'Xuất mẫu triển lãm'
        ])[(gs - 12)]
        ELSE NULL
    END
FROM generate_series(1, 16) AS gs
CROSS JOIN LATERAL (SELECT id FROM users ORDER BY id LIMIT 1) u
ON CONFLICT (dispatch_code) DO NOTHING;
