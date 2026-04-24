-- Task001 dev: mật khẩu mặc định Admin@123 (đổi khi deploy; đặt JWT_SECRET trong môi trường).
UPDATE users
SET password_hash = '$2a$10$ID/8bh4S610dSC/a8Vy/X.vsA5WbJcNnnxcExEkAy5WTUbMv3874q'
WHERE username = 'admin';
