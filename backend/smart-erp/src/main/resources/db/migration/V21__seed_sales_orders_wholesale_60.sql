-- Seed ~60 đơn bán sỉ demo cho UI "Đơn bán sỉ" (Task054 list + sort + filter).
-- - Chỉ seed kênh Wholesale (order_channel='Wholesale')
-- - Idempotent theo order_code (ON CONFLICT DO NOTHING)
-- - Tạo line items trong orderdetails, rồi cập nhật total_amount/discount_amount theo tổng line.
--
-- Yêu cầu dữ liệu nền:
-- - có ít nhất 1 user trong bảng users
-- - có customers (VD: V18__seed_customers_100.sql)
-- - có products + productunits (VD: các seed sản phẩm/tồn kho)
--
-- Lưu ý: Tên bảng trong Flyway tạo là PascalCase nhưng không quote, nên thực tế là lowercase (salesorders, orderdetails, ...).

WITH
seed_orders AS (
    INSERT INTO salesorders (
        order_code,
        customer_id,
        user_id,
        status,
        parent_order_id,
        shipping_address,
        notes,
        created_at,
        updated_at,
        cancelled_at,
        cancelled_by,
        order_channel,
        payment_status,
        ref_sales_order_id,
        total_amount,
        discount_amount
    )
    SELECT
        'SO-WH-DEMO-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(i::text, 4, '0')                                                   AS order_code,
        (SELECT c.id FROM customers c WHERE c.status = 'Active' ORDER BY random() LIMIT 1)                                            AS customer_id,
        (SELECT u.id FROM users u ORDER BY u.id LIMIT 1)                                                                               AS user_id,
        (ARRAY['Pending','Processing','Partial','Shipped','Delivered','Cancelled'])[1 + ((random() * 5)::int)]                         AS status,
        NULL::int                                                                                                                      AS parent_order_id,
        (ARRAY[
            'Số 12 Nguyễn Huệ, Q1, TP.HCM',
            '45 Trần Hưng Đạo, Q5, TP.HCM',
            '120 Lê Lợi, Q1, TP.HCM',
            '8 Hoàng Diệu, Ba Đình, Hà Nội',
            '200 Lê Duẩn, Đống Đa, Hà Nội'
        ])[1 + ((random() * 4)::int)]                                                                                                  AS shipping_address,
        CASE WHEN i % 7 = 0 THEN 'Giao giờ hành chính' WHEN i % 11 = 0 THEN 'Liên hệ trước khi giao' ELSE NULL END                    AS notes,
        (now() - make_interval(days => (i % 45))) + make_interval(hours => (random() * 8)::int)                                        AS created_at,
        (now() - make_interval(days => (i % 45))) + make_interval(hours => (9 + (random() * 10)::int))                                 AS updated_at,
        NULL::timestamp                                                                                                                 AS cancelled_at,
        NULL::int                                                                                                                      AS cancelled_by,
        'Wholesale'                                                                                                                    AS order_channel,
        (ARRAY['Paid','Unpaid','Partial'])[1 + ((random() * 2)::int)]                                                                  AS payment_status,
        NULL::int                                                                                                                      AS ref_sales_order_id,
        0::numeric                                                                                                                     AS total_amount,
        0::numeric                                                                                                                     AS discount_amount
    FROM generate_series(1, 60) AS i
    ON CONFLICT (order_code) DO NOTHING
    RETURNING id, status
),
seed_lines AS (
    INSERT INTO orderdetails (
        order_id,
        product_id,
        unit_id,
        quantity,
        price_at_time,
        dispatched_qty,
        created_at
    )
    SELECT
        o.id                                                                                                                            AS order_id,
        p.id                                                                                                                            AS product_id,
        pu.id                                                                                                                           AS unit_id,
        q.qty                                                                                                                           AS quantity,
        q.price                                                                                                                         AS price_at_time,
        CASE
            WHEN o.status IN ('Delivered', 'Shipped') THEN q.qty
            WHEN o.status = 'Partial' THEN GREATEST(0, (q.qty / 2))
            ELSE 0
        END                                                                                                                             AS dispatched_qty,
        now()                                                                                                                           AS created_at
    FROM seed_orders o
    CROSS JOIN LATERAL (
        SELECT 1 + (random() * 4)::int AS line_count
    ) lc
    CROSS JOIN LATERAL generate_series(1, lc.line_count) AS ln(idx)
    CROSS JOIN LATERAL (
        SELECT pr.id
        FROM products pr
        ORDER BY random()
        LIMIT 1
    ) p
    CROSS JOIN LATERAL (
        SELECT u.id
        FROM productunits u
        WHERE u.product_id = p.id
        ORDER BY random()
        LIMIT 1
    ) pu
    CROSS JOIN LATERAL (
        SELECT
            (1 + (random() * 18)::int)                           AS qty,
            (10000 + (random() * 490000))::numeric(10,2)         AS price
    ) q
    ON CONFLICT DO NOTHING
    RETURNING order_id
),
recalc_totals AS (
    UPDATE salesorders so
    SET total_amount = t.total_amount
    FROM (
        SELECT od.order_id, COALESCE(SUM(od.quantity * od.price_at_time), 0)::numeric(10,2) AS total_amount
        FROM orderdetails od
        WHERE od.order_id IN (SELECT id FROM seed_orders)
        GROUP BY od.order_id
    ) t
    WHERE so.id = t.order_id
    RETURNING so.id, so.total_amount
),
apply_discount AS (
    UPDATE salesorders so
    SET discount_amount = CASE
        WHEN so.total_amount <= 0 THEN 0
        WHEN (random() < 0.25) THEN LEAST(so.total_amount, (so.total_amount * (0.02 + random() * 0.06))::numeric(10,2))
        ELSE 0
    END
    WHERE so.id IN (SELECT id FROM seed_orders)
    RETURNING so.id
),
apply_cancel_meta AS (
    UPDATE salesorders so
    SET cancelled_at = now() - make_interval(days => (1 + (random() * 20)::int)),
        cancelled_by = (SELECT u.id FROM users u ORDER BY u.id LIMIT 1),
        payment_status = 'Unpaid'
    WHERE so.id IN (SELECT id FROM seed_orders WHERE status = 'Cancelled')
    RETURNING so.id
)
SELECT
    (SELECT COUNT(*) FROM seed_orders)      AS inserted_orders,
    (SELECT COUNT(*) FROM seed_lines)       AS inserted_lines,
    (SELECT COUNT(*) FROM apply_cancel_meta) AS cancelled_orders;

