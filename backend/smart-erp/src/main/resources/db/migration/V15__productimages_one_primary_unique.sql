-- SRS Task034-041 OQ-4(a): at most one primary image per product (partial unique index).
CREATE UNIQUE INDEX IF NOT EXISTS uq_productimages_one_primary
    ON productimages (product_id)
    WHERE is_primary = TRUE;
