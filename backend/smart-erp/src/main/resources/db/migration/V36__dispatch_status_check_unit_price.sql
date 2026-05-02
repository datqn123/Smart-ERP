-- Mở rộng CHECK status phiếu xuất (xuất tay + gắn đơn chờ duyệt/giao).
-- Snapshot đơn giá trên dòng phiếu (POST /stock-dispatches/from-order).

DO $$
DECLARE
    cname text;
BEGIN
    SELECT con.conname
    INTO cname
    FROM pg_constraint con
    WHERE con.conrelid = 'stockdispatches'::regclass
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) ILIKE '%status%';
    IF cname IS NOT NULL THEN
        EXECUTE format('ALTER TABLE stockdispatches DROP CONSTRAINT %I', cname);
    END IF;
END
$$;

ALTER TABLE stockdispatches
    ADD CONSTRAINT stockdispatches_status_check CHECK (status IN (
        'Pending',
        'Full',
        'Partial',
        'Cancelled',
        'WaitingDispatch',
        'Delivering',
        'Delivered'
    ));

ALTER TABLE stockdispatch_lines
    ADD COLUMN IF NOT EXISTS unit_price_snapshot NUMERIC(14, 4);

COMMENT ON COLUMN stockdispatch_lines.unit_price_snapshot IS 'Đơn giá snapshot khi lập phiếu gắn đơn (from-order).';
