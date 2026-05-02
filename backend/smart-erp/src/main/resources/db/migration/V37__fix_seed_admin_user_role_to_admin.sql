-- V1 gán nhầm user `admin` vào role_id = 1 (Owner). Thông báo chỉ gửi role Admin (`findActiveAdminUserIds`) nên không ai nhận.
UPDATE users u
SET role_id = r_admin.id
FROM roles r_admin
WHERE u.username = 'admin'
  AND r_admin.name = 'Admin'
  AND EXISTS (SELECT 1 FROM roles r_cur WHERE r_cur.id = u.role_id AND r_cur.name = 'Owner');
