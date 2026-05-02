package com.example.smart_erp.finance.cashfunds;

import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.example.smart_erp.finance.cashfunds.response.CashFundItemData;

@SuppressWarnings("null")
@Repository
public class CashFundJdbcRepository {

	private static final RowMapper<CashFundItemData> ROW = (rs, i) -> new CashFundItemData(rs.getInt("id"), rs.getString("code"),
			rs.getString("name"), rs.getBoolean("is_default"), rs.getBoolean("is_active"));

	private final NamedParameterJdbcTemplate namedJdbc;

	public CashFundJdbcRepository(NamedParameterJdbcTemplate namedJdbc) {
		this.namedJdbc = namedJdbc;
	}

	public List<CashFundItemData> findAllActiveOrdered() {
		String sql = """
				SELECT id, code, name, is_default, is_active FROM cash_funds
				WHERE is_active = TRUE
				ORDER BY is_default DESC, id ASC
				""";
		return namedJdbc.query(sql, ROW);
	}

	public Optional<CashFundItemData> findById(int id) {
		String sql = "SELECT id, code, name, is_default, is_active FROM cash_funds WHERE id = :id";
		var list = namedJdbc.query(sql, new MapSqlParameterSource("id", id), ROW);
		return list.isEmpty() ? Optional.empty() : Optional.of(list.getFirst());
	}

	public boolean existsByCodeIgnoreCase(String code) {
		String sql = "SELECT COUNT(*) FROM cash_funds WHERE UPPER(code) = UPPER(:code)";
		Long c = namedJdbc.queryForObject(sql, new MapSqlParameterSource("code", code.trim()), Long.class);
		return c != null && c > 0;
	}

	public boolean existsActiveById(int id) {
		String sql = "SELECT COUNT(*) FROM cash_funds WHERE id = :id AND is_active = TRUE";
		Long c = namedJdbc.queryForObject(sql, new MapSqlParameterSource("id", id), Long.class);
		return c != null && c > 0;
	}

	public void clearDefaultFlag() {
		namedJdbc.update("UPDATE cash_funds SET is_default = FALSE, updated_at = NOW() WHERE is_default = TRUE",
				new MapSqlParameterSource());
	}

	public int insertReturningId(String code, String name, boolean isDefault, boolean isActive) {
		String sql = """
				INSERT INTO cash_funds (code, name, is_default, is_active)
				VALUES (:code, :name, :isdef, :isact)
				RETURNING id
				""";
		Integer id = namedJdbc.queryForObject(sql,
				new MapSqlParameterSource("code", code.trim()).addValue("name", name.trim()).addValue("isdef", isDefault)
						.addValue("isact", isActive),
				Integer.class);
		if (id == null) {
			throw new IllegalStateException("INSERT cash_funds không trả id");
		}
		return id;
	}

	public int updateFlags(int id, Boolean isActive, Boolean isDefault) {
		if (isActive == null && isDefault == null) {
			return 0;
		}
		StringBuilder sb = new StringBuilder("UPDATE cash_funds SET updated_at = NOW()");
		var src = new MapSqlParameterSource("id", id);
		if (isActive != null) {
			sb.append(", is_active = :isact");
			src.addValue("isact", isActive);
		}
		if (isDefault != null) {
			sb.append(", is_default = :isdef");
			src.addValue("isdef", isDefault);
		}
		sb.append(" WHERE id = :id");
		return namedJdbc.update(sb.toString(), src);
	}
}
