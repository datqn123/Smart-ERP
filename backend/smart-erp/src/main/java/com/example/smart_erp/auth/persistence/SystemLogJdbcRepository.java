package com.example.smart_erp.auth.persistence;

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
}
