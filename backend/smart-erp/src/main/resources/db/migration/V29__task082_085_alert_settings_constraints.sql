-- Task082–085: AlertSettings constraints sync with Database_Specification §10
-- - Expand alert_type CHECK values
-- - Enforce UNIQUE (owner_id, alert_type)

-- 1) Expand CHECK constraint for alert_type (drop legacy auto-named check if exists)
ALTER TABLE alertsettings
  DROP CONSTRAINT IF EXISTS alertsettings_alert_type_check;

ALTER TABLE alertsettings
  DROP CONSTRAINT IF EXISTS ck_alert_settings_alert_type;

ALTER TABLE alertsettings
  ADD CONSTRAINT ck_alert_settings_alert_type
  CHECK (alert_type IN (
    'LowStock',
    'ExpiryDate',
    'HighValueTransaction',
    'PendingApproval',
    'OverStock',
    'SalesOrderCreated',
    'PartnerDebtDueSoon',
    'SystemHealth'
  ));

-- 2) Unique per owner + alert type
ALTER TABLE alertsettings
  ADD CONSTRAINT uq_alert_settings_owner_alert_type UNIQUE (owner_id, alert_type);

