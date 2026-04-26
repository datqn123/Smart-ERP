-- SRS Task029–033: soft-delete + partial unique category_code (reuse code after soft-delete).

ALTER TABLE categories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_category_code_key;

CREATE UNIQUE INDEX IF NOT EXISTS uq_categories_category_code_active
    ON categories (category_code) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories (parent_id);
