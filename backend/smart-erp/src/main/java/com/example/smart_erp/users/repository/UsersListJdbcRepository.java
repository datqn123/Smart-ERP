package com.example.smart_erp.users.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * Task077 — danh sách nhân viên (paging + filter). SQL dialect PostgreSQL (bảng Flyway V1 + V5).
 */
@SuppressWarnings("null")
@Repository
public class UsersListJdbcRepository {

	private static final String BASE_FROM = """
			FROM users u
			INNER JOIN roles r ON r.id = u.role_id
			""";

	private static final String SELECT_LIST_COLUMNS = """
			SELECT
			  u.id,
			  u.username,
			  u.staff_code,
			  u.full_name,
			  u.email,
			  u.phone,
			  u.role_id,
			  r.name AS role_name,
			  u.status,
			  u.last_login,
			  u.created_at
			""";

	private final NamedParameterJdbcTemplate namedJdbc;

	public UsersListJdbcRepository(NamedParameterJdbcTemplate namedJdbc) {
		this.namedJdbc = namedJdbc;
	}

	/**
	 * Lookup by usernames for validation purposes (Task082–085 recipients=username).
	 */
	public Set<String> findExistingUsernames(List<String> usernames) {
		if (usernames == null || usernames.isEmpty()) {
			return Set.of();
		}
		String sql = "SELECT username FROM users WHERE username IN (:names)";
		var src = new MapSqlParameterSource("names", usernames);
		List<String> rows = namedJdbc.query(sql, src, (rs, i) -> rs.getString("username"));
		return Set.copyOf(rows);
	}

	public long countRows(String search, String status, Integer roleId) {
		Filter f = buildFilter(search, status, roleId);
		String sql = "SELECT COUNT(*) " + BASE_FROM + f.where;
		Long c = namedJdbc.queryForObject(sql, f.source, Long.class);
		return c != null ? c : 0L;
	}

	public List<UserListRow> loadPage(String search, String status, Integer roleId, int page, int limit) {
		Filter f = buildFilter(search, status, roleId);
		int offset = (page - 1) * limit;
		String sql = SELECT_LIST_COLUMNS + BASE_FROM + f.where + " ORDER BY u.created_at DESC LIMIT " + limit + " OFFSET " + offset;
		return namedJdbc.query(sql, f.source, ROW);
	}

	private Filter buildFilter(String search, String status, Integer roleId) {
		StringBuilder sb = new StringBuilder(" WHERE 1=1");
		var src = new MapSqlParameterSource();

		String st = status != null ? status.trim() : "all";
		if (!st.isEmpty() && !"all".equalsIgnoreCase(st)) {
			if ("Active".equalsIgnoreCase(st)) {
				sb.append(" AND u.status = 'Active'");
			}
			else if ("Inactive".equalsIgnoreCase(st)) {
				sb.append(" AND u.status = 'Locked'");
			}
		}

		if (roleId != null && roleId.intValue() > 0) {
			sb.append(" AND u.role_id = :_role_id");
			src.addValue("_role_id", roleId);
		}

		if (search != null) {
			String p = buildSearchPattern(search);
			if (!"%".equals(p)) {
				sb.append(" AND (u.username ILIKE :_search OR u.staff_code ILIKE :_search OR u.full_name ILIKE :_search OR u.email ILIKE :_search)");
				src.addValue("_search", p);
			}
		}

		return new Filter(sb.toString(), src);
	}

	/**
	 * Loại ký tự joker thường gặp trong tìm kiếm, tránh tác động ILIKE; param vẫn gắn theo tên nên an toàn SQLi.
	 */
	public static String buildSearchPattern(String raw) {
		String t = raw.trim();
		if (t.isEmpty()) {
			return "%";
		}
		t = t.replace("%", "").replace("_", "");
		if (t.isEmpty()) {
			return "%";
		}
		return "%" + t + "%";
	}

	private static final RowMapper<UserListRow> ROW = UsersListJdbcRepository::mapRow;

	private static UserListRow mapRow(ResultSet rs, int i) throws SQLException {
		Instant createdAt = rs.getTimestamp("created_at") != null ? rs.getTimestamp("created_at").toInstant() : Instant.parse("1970-01-01T00:00:00Z");
		Instant lastLogin = rs.getTimestamp("last_login") != null ? rs.getTimestamp("last_login").toInstant() : null;
		return new UserListRow(
				rs.getInt("id"),
				rs.getString("username"),
				rs.getString("staff_code"),
				rs.getString("full_name"),
				rs.getString("email"),
				rs.getString("phone"),
				rs.getInt("role_id"),
				rs.getString("role_name"),
				rs.getString("status"),
				lastLogin,
				createdAt.atZone(java.time.ZoneOffset.UTC).toLocalDate());
	}

	public record UserListRow(
			int id,
			String username,
			String staffCode,
			String fullName,
			String email,
			String phone,
			int roleId,
			String roleName,
			String dbStatus,
			Instant lastLogin,
			LocalDate joinedDate) {
	}

	private static final class Filter {
		final String where;
		final MapSqlParameterSource source;

		Filter(String w, MapSqlParameterSource s) {
			this.where = w;
			this.source = s;
		}
	}
}

