package com.example.smart_erp.auth;

/**
 * Tài khoản seed Task001 (Flyway {@code V1} + bcrypt {@code V2}) — dùng cho test tay Postman / integration.
 *
 * <p>
 * Email đăng nhập API; mật khẩu dev sau V2.
 * </p>
 */
public final class AuthTask001Fixtures {

	private AuthTask001Fixtures() {
	}

	/** Owner seed — khớp {@code V1__baseline_smart_inventory.sql} + {@code V2__task001_dev_admin_bcrypt.sql} */
	public static final String DEV_OWNER_EMAIL = "admin@smartinventory.vn";

	public static final String DEV_OWNER_PASSWORD = "Admin@123";
}
