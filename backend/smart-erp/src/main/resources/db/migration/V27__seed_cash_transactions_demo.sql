-- Seed demo CashTransactions + FinanceLedger
-- Assumptions (validated from Flyway):
-- - `cashtransactions.performed_by` exists and NOT NULL since V25
-- - At least one user exists: admin seeded in V1 with id = 1
-- - Completed cash transactions must link to financeledger with:
--     reference_type='CashTransaction' and reference_id=cashtransactions.id

DO $$
DECLARE
  v_admin_id INT := 1;
BEGIN
  -- Ensure admin user exists to satisfy FK constraints.
  IF NOT EXISTS (SELECT 1 FROM users u WHERE u.id = v_admin_id) THEN
    RAISE EXCEPTION 'Seed requires users.id=% but it does not exist', v_admin_id;
  END IF;

  -- Avoid duplicate seeding if migration accidentally re-runs in a dev DB snapshot.
  -- Flyway should prevent re-run, but this makes the script safer for manual execution.
  IF EXISTS (
    SELECT 1
    FROM cashtransactions ct
    WHERE ct.transaction_code IN (
      'PT-2026-0001', 'PC-2026-0001',
      'PT-2026-0002', 'PC-2026-0002',
      'PT-2026-0003', 'PC-2026-0003'
    )
  ) THEN
    RAISE NOTICE 'CashTransactions demo seed already exists; skipping.';
    RETURN;
  END IF;

  -- 1) Completed Income (creates FinanceLedger)
  WITH ct AS (
    INSERT INTO cashtransactions (
      transaction_code, direction, amount, category, description, payment_method,
      status, transaction_date, finance_ledger_id, created_by, performed_by
    )
    VALUES (
      'PT-2026-0001', 'Income', 500000.00, 'Thu tiền khách lẻ', 'POS ngày 22/04', 'Cash',
      'Pending', DATE '2026-04-22', NULL, v_admin_id, v_admin_id
    )
    RETURNING id, transaction_date, amount, description, created_by
  ),
  fl AS (
    INSERT INTO financeledger (
      transaction_date, transaction_type, reference_type, reference_id,
      amount, description, created_by
    )
    SELECT
      ct.transaction_date,
      'SalesRevenue',
      'CashTransaction',
      ct.id,
      ct.amount,
      ct.description,
      ct.created_by
    FROM ct
    RETURNING id
  )
  UPDATE cashtransactions
  SET finance_ledger_id = (SELECT id FROM fl),
      status = 'Completed'
  WHERE id = (SELECT id FROM ct);

  -- 2) Completed Expense (creates FinanceLedger with negative amount)
  WITH ct AS (
    INSERT INTO cashtransactions (
      transaction_code, direction, amount, category, description, payment_method,
      status, transaction_date, finance_ledger_id, created_by, performed_by
    )
    VALUES (
      'PC-2026-0001', 'Expense', 120000.00, 'Chi phí vận hành', 'Mua văn phòng phẩm', 'Cash',
      'Pending', DATE '2026-04-23', NULL, v_admin_id, v_admin_id
    )
    RETURNING id, transaction_date, amount, description, created_by
  ),
  fl AS (
    INSERT INTO financeledger (
      transaction_date, transaction_type, reference_type, reference_id,
      amount, description, created_by
    )
    SELECT
      ct.transaction_date,
      'OperatingExpense',
      'CashTransaction',
      ct.id,
      (ct.amount * -1),
      ct.description,
      ct.created_by
    FROM ct
    RETURNING id
  )
  UPDATE cashtransactions
  SET finance_ledger_id = (SELECT id FROM fl),
      status = 'Completed'
  WHERE id = (SELECT id FROM ct);

  -- 3) Pending Income
  INSERT INTO cashtransactions (
    transaction_code, direction, amount, category, description, payment_method,
    status, transaction_date, finance_ledger_id, created_by, performed_by
  )
  VALUES (
    'PT-2026-0002', 'Income', 250000.00, 'Thu khác', 'Thu tiền đặt cọc', 'BankTransfer',
    'Pending', DATE '2026-04-25', NULL, v_admin_id, v_admin_id
  );

  -- 4) Pending Expense
  INSERT INTO cashtransactions (
    transaction_code, direction, amount, category, description, payment_method,
    status, transaction_date, finance_ledger_id, created_by, performed_by
  )
  VALUES (
    'PC-2026-0002', 'Expense', 80000.00, 'Chi khác', 'Chi ship nội bộ', 'Cash',
    'Pending', DATE '2026-04-25', NULL, v_admin_id, v_admin_id
  );

  -- 5) Cancelled Income
  INSERT INTO cashtransactions (
    transaction_code, direction, amount, category, description, payment_method,
    status, transaction_date, finance_ledger_id, created_by, performed_by
  )
  VALUES (
    'PT-2026-0003', 'Income', 100000.00, 'Thu khác', 'Phiếu thu tạo nhầm', 'Cash',
    'Cancelled', DATE '2026-04-26', NULL, v_admin_id, v_admin_id
  );

  -- 6) Cancelled Expense
  INSERT INTO cashtransactions (
    transaction_code, direction, amount, category, description, payment_method,
    status, transaction_date, finance_ledger_id, created_by, performed_by
  )
  VALUES (
    'PC-2026-0003', 'Expense', 60000.00, 'Chi phí vận hành', 'Huỷ do sai số tiền', 'Cash',
    'Cancelled', DATE '2026-04-26', NULL, v_admin_id, v_admin_id
  );
END $$;

