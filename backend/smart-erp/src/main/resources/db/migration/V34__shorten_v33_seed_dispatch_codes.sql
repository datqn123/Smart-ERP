-- Chuẩn hóa mã phiếu seed V33: DB đã chạy phiên bản V33 đầu (PX-SEED-V33-…) — đổi sang dạng ngắn PX3301…PX3316.
-- Phiên kho đích mới chỉ có PX33xx sau V33 không cần dòng UPDATE này (WHERE không khớp).

UPDATE stockdispatches sd
SET dispatch_code = 'PX33'
    || lpad(
        (regexp_match(sd.dispatch_code, '^PX-SEED-V33-(\d+)$'))[1]::int::text,
        2,
        '0'
    )
WHERE sd.dispatch_code ~ '^PX-SEED-V33-[0-9]+$';
