-- Task007 (SRS OQ-2): cột đơn vị hiển thị meta trên dòng tồn; quantity vẫn theo đơn vị cơ sở.
ALTER TABLE inventory
  ADD COLUMN unit_id INT NULL
    REFERENCES productunits(id) ON DELETE SET NULL;

CREATE INDEX idx_inv_unit ON inventory(unit_id);

COMMENT ON COLUMN inventory.unit_id IS 'Đơn vị hiển thị/ghi nhận meta; quantity vẫn theo đơn vị cơ sở (UC).';
