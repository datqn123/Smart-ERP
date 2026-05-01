-- Cho phép phiếu xuất không gắn đơn hàng (xuất từ màn Tồn kho / điều chỉnh).
ALTER TABLE stockdispatches ADD COLUMN IF NOT EXISTS reference_label VARCHAR(255);

ALTER TABLE stockdispatches DROP CONSTRAINT IF EXISTS fk_sd_order;
ALTER TABLE stockdispatches ALTER COLUMN order_id DROP NOT NULL;
ALTER TABLE stockdispatches
    ADD CONSTRAINT fk_sd_order FOREIGN KEY (order_id) REFERENCES salesorders (id) ON DELETE RESTRICT;

COMMENT ON COLUMN stockdispatches.reference_label IS 'Mô tả đối tượng xuất khi không có SalesOrder (VD: tên khách / lý do).';
