-- Task090 (SRS Task090 OQ-2): cấu hình kho mặc định để POS trừ tồn khi retail checkout.

ALTER TABLE storeprofiles
  ADD COLUMN IF NOT EXISTS default_retail_location_id INT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_storeprofiles_default_retail_location'
  ) THEN
    ALTER TABLE storeprofiles
      ADD CONSTRAINT fk_storeprofiles_default_retail_location
        FOREIGN KEY (default_retail_location_id) REFERENCES warehouselocations(id)
        ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_storeprofiles_default_retail_location
  ON storeprofiles(default_retail_location_id);

-- Default thực dụng cho môi trường demo: chọn vị trí kho id=1 nếu store profile đã tồn tại nhưng chưa cấu hình.
UPDATE storeprofiles
SET default_retail_location_id = 1
WHERE default_retail_location_id IS NULL;

