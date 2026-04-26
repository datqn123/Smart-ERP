package com.example.smart_erp.auth.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * Ghi nhật ký đăng nhập. Tên bảng vật lý PostgreSQL từ {@code CREATE TABLE SystemLogs} (không quote) → {@code systemlogs}.
 */
@Repository
public class SystemLogJdbcRepository {

	private final JdbcTemplate jdbcTemplate;

	public SystemLogJdbcRepository(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	public void insertAuthLoginSuccess(int userId) {
		jdbcTemplate.update(
				"INSERT INTO systemlogs (log_level, module, action, user_id, message) VALUES (?, ?, ?, ?, ?)",
				"INFO", "AUTH", "LOGIN", userId, "Người dùng đăng nhập thành công");
	}

	public void insertAuthLogout(int userId) {
		jdbcTemplate.update(
				"INSERT INTO systemlogs (log_level, module, action, user_id, message) VALUES (?, ?, ?, ?, ?)",
				"INFO", "AUTH", "LOGOUT", userId, "Người dùng đã đăng xuất");
	}

	/** Task007 — audit PATCH tồn (context JSON theo SRS / Task011). */
	public void insertInventoryPatch(int userId, String contextJson) {
		jdbcTemplate.update(
				"INSERT INTO systemlogs (log_level, module, action, user_id, message, context_data) VALUES (?, ?, ?, ?, ?, CAST(? AS jsonb))",
				"INFO", "inventory", "PATCH_INVENTORY", userId, "Cập nhật meta tồn kho", contextJson);
	}
}
