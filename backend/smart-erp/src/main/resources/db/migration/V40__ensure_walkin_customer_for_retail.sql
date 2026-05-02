-- POS retail checkout resolves walk-in via customers.customer_code = 'WALKIN' AND deleted_at IS NULL
-- (SalesOrderJdbcRepository.findWalkinCustomerId). Missing active WALKIN → "Chưa cấu hình khách WALKIN".
-- Covers: V19 never applied on this DB; or WALKIN soft-deleted after V38 (V19 INSERT would not re-run).

UPDATE customers
SET deleted_at = NULL,
    status = 'Active',
    updated_at = CURRENT_TIMESTAMP
WHERE id = (
    SELECT c.id
    FROM customers c
    WHERE c.customer_code = 'WALKIN'
      AND c.deleted_at IS NOT NULL
    ORDER BY c.id
    LIMIT 1
)
AND NOT EXISTS (
    SELECT 1 FROM customers c2 WHERE c2.customer_code = 'WALKIN' AND c2.deleted_at IS NULL
);

INSERT INTO customers (customer_code, name, phone, email, address, loyalty_points, status)
SELECT 'WALKIN', 'Khách lẻ', '0900000000', NULL, NULL, 0, 'Active'
WHERE NOT EXISTS (
    SELECT 1 FROM customers c WHERE c.customer_code = 'WALKIN' AND c.deleted_at IS NULL
);
