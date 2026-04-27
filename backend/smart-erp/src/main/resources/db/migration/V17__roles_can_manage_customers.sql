-- SRS Task048-053 OQ-4(b): permission riêng cho module Khách hàng (JWT claim mp + hasAuthority)
-- jsonb ||: khóa bên phải ghi đè giá trị cũ nếu trùng tên
UPDATE roles
SET permissions = permissions || '{"can_manage_customers": true}'::jsonb;
