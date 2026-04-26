-- Seed demo: 100 phiếu nhập (stockreceipts) + 2 dòng chi tiết / phiếu (stockreceiptdetails).
-- Nguồn sản phẩm & giá: bảng products, productunits (is_base_unit), productpricehistory (mới nhất theo id).
-- Ràng buộc: FK supplier_id → suppliers, staff_id/approved_by/reviewed_by → users;
-- uq_srd_receipt_product_batch → mỗi dòng batch_number khác nhau (kể cả cùng product_id).
-- Idempotent từng phiếu: bỏ qua nếu receipt_code đã tồn tại.
-- Dialect: PostgreSQL (DO / PLpgSQL).

INSERT INTO suppliers (supplier_code, name, status)
SELECT v.code, v.name, 'Active'
FROM (VALUES
  ('NCC-SEED-V10-A', 'NCC seed V10 A'),
  ('NCC-SEED-V10-B', 'NCC seed V10 B'),
  ('NCC-SEED-V10-C', 'NCC seed V10 C')
) AS v(code, name)
WHERE NOT EXISTS (SELECT 1 FROM suppliers s WHERE s.supplier_code = v.code);

DO $$
DECLARE
  i int;
  rid int;
  n_prod int;
  n_sup int;
  sid int;
  pid1 int;
  uid1 int;
  cp1 numeric(10, 2);
  pid2 int;
  uid2 int;
  cp2 numeric(10, 2);
  qty1 int;
  qty2 int;
  st text;
  tot numeric(10, 2);
  rdate date;
  statuses text[] := ARRAY['Draft', 'Pending', 'Approved', 'Rejected'];
BEGIN
  SELECT COUNT(*) INTO n_prod
  FROM products p
  INNER JOIN productunits u ON u.product_id = p.id AND u.is_base_unit = TRUE;

  IF n_prod < 1 THEN
    RAISE NOTICE 'V10 seed stock receipts: skipped — no products with base unit.';
    RETURN;
  END IF;

  SELECT COUNT(*) INTO n_sup FROM suppliers WHERE status = 'Active';
  IF n_sup < 1 THEN
    RAISE NOTICE 'V10 seed stock receipts: skipped — no active suppliers.';
    RETURN;
  END IF;

  FOR i IN 1..100 LOOP
    IF EXISTS (SELECT 1 FROM stockreceipts sr WHERE sr.receipt_code = 'PN-V10-' || lpad(i::text, 5, '0')) THEN
      CONTINUE;
    END IF;

    SELECT id INTO sid FROM suppliers WHERE status = 'Active' ORDER BY id OFFSET ((i - 1) % n_sup) LIMIT 1;

    SELECT p.id, u.id,
      COALESCE(
        (SELECT pph.cost_price
         FROM productpricehistory pph
         WHERE pph.product_id = p.id AND pph.unit_id = u.id
         ORDER BY pph.id DESC
         LIMIT 1),
        10000.00
      )::numeric(10, 2)
    INTO pid1, uid1, cp1
    FROM products p
    INNER JOIN productunits u ON u.product_id = p.id AND u.is_base_unit = TRUE
    ORDER BY p.id OFFSET ((2 * i - 2) % n_prod) LIMIT 1;

    SELECT p.id, u.id,
      COALESCE(
        (SELECT pph.cost_price
         FROM productpricehistory pph
         WHERE pph.product_id = p.id AND pph.unit_id = u.id
         ORDER BY pph.id DESC
         LIMIT 1),
        10000.00
      )::numeric(10, 2)
    INTO pid2, uid2, cp2
    FROM products p
    INNER JOIN productunits u ON u.product_id = p.id AND u.is_base_unit = TRUE
    ORDER BY p.id OFFSET ((2 * i - 1) % n_prod) LIMIT 1;

    qty1 := 5 + (i % 12);
    qty2 := 3 + ((i + 3) % 10);
    tot := ROUND((qty1 * cp1) + (qty2 * cp2), 2);
    rdate := DATE '2026-01-15' + ((i % 90) * 1);

    st := statuses[1 + ((i - 1) % 4)];

    INSERT INTO stockreceipts (
      receipt_code,
      supplier_id,
      staff_id,
      receipt_date,
      status,
      invoice_number,
      total_amount,
      notes,
      approved_by,
      approved_at,
      reviewed_by,
      reviewed_at,
      rejection_reason
    )
    VALUES (
      'PN-V10-' || lpad(i::text, 5, '0'),
      sid,
      1,
      rdate,
      st,
      'HD-V10-' || lpad(i::text, 5, '0'),
      tot,
      'Seed Flyway V10 — 2 dòng / phiếu',
      CASE WHEN st = 'Approved' THEN 1 ELSE NULL END,
      CASE WHEN st = 'Approved' THEN (CURRENT_TIMESTAMP - INTERVAL '2 days') ELSE NULL END,
      CASE WHEN st IN ('Approved', 'Rejected') THEN 1 ELSE NULL END,
      CASE
        WHEN st = 'Approved' THEN (CURRENT_TIMESTAMP - INTERVAL '2 days')
        WHEN st = 'Rejected' THEN (CURRENT_TIMESTAMP - INTERVAL '1 day')
        ELSE NULL
      END,
      CASE WHEN st = 'Rejected' THEN 'Seed: không đạt SLA nhập (demo)' ELSE NULL END
    )
    RETURNING id INTO rid;

    INSERT INTO stockreceiptdetails (receipt_id, product_id, unit_id, quantity, cost_price, batch_number, expiry_date)
    VALUES
      (rid, pid1, uid1, qty1, cp1, 'V10-' || i::text || '-A', NULL),
      (rid, pid2, uid2, qty2, cp2, 'V10-' || i::text || '-B', NULL);
  END LOOP;
END $$;
