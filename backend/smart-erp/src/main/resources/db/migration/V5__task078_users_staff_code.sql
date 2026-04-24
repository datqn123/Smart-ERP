-- Task078 / Task077: mã nhân viên hiển thị (employeeCode); nullable, unique khi có giá trị.
ALTER TABLE users ADD COLUMN IF NOT EXISTS staff_code VARCHAR(50);

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_staff_code ON users (staff_code) WHERE staff_code IS NOT NULL;
