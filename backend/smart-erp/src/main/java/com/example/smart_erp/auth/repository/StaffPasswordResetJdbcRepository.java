package com.example.smart_erp.auth.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * Bảng vật lý PostgreSQL từ Flyway {@code CREATE TABLE StaffPasswordResetRequests} (không quote) →
 * {@code staffpasswordresetrequests}.
 */
@SuppressWarnings("null")
@Repository
public class StaffPasswordResetJdbcRepository {

	private final NamedParameterJdbcTemplate namedJdbc;

	public StaffPasswordResetJdbcRepository(NamedParameterJdbcTemplate namedJdbc) {
		this.namedJdbc = namedJdbc;
	}

	public record UserResetLookupRow(int userId, String username, String status, String roleName) {
	}

	public Optional<UserResetLookupRow> findUserRoleStatusByUsername(String username) {
		String sql = """
				SELECT u.id AS user_id, u.username AS uname, u.status AS user_status, r.name AS role_name
				FROM users u
				INNER JOIN roles r ON r.id = u.role_id
				WHERE u.username = :username
				""";
		var src = new MapSqlParameterSource("username", username);
		List<UserResetLookupRow> rows = namedJdbc.query(sql, src,
				(rs, i) -> new UserResetLookupRow(rs.getInt("user_id"), rs.getString("uname"), rs.getString("user_status"),
						rs.getString("role_name")));
		return rows.stream().findFirst();
	}

	public long insertPendingReturningId(int userId, String message) {
		String sql = """
				INSERT INTO staffpasswordresetrequests (user_id, message, status)
				VALUES (:userId, :message, 'Pending')
				RETURNING id
				""";
		var src = new MapSqlParameterSource().addValue("userId", userId).addValue("message", message);
		Long id = namedJdbc.queryForObject(sql, src, Long.class);
		return id != null ? id.longValue() : 0L;
	}
}
