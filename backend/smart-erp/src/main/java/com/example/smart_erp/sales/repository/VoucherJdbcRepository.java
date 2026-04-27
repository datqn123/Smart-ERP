package com.example.smart_erp.sales.repository;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@SuppressWarnings("null")
@Repository
public class VoucherJdbcRepository {

	private final NamedParameterJdbcTemplate namedJdbc;

	public VoucherJdbcRepository(NamedParameterJdbcTemplate namedJdbc) {
		this.namedJdbc = namedJdbc;
	}

	public Optional<VoucherRow> findActiveByCodeIgnoreCase(String code) {
		if (code == null || code.isBlank()) {
			return Optional.empty();
		}
		LocalDate today = LocalDate.now();
		String sql = """
				SELECT id, code, name, discount_type, discount_value, is_active, valid_from, valid_to
				FROM vouchers
				WHERE UPPER(TRIM(code)) = UPPER(TRIM(:code))
				LIMIT 1
				""";
		List<VoucherRow> rows = namedJdbc.query(sql, Map.of("code", code), (rs, rn) -> new VoucherRow(rs.getInt("id"),
				rs.getString("code"), rs.getString("name"), rs.getString("discount_type"),
				rs.getBigDecimal("discount_value"), rs.getBoolean("is_active"),
				toLocalDate(rs.getDate("valid_from")), toLocalDate(rs.getDate("valid_to"))));
		if (rows.isEmpty()) {
			return Optional.empty();
		}
		VoucherRow v = rows.getFirst();
		if (!v.isActive()) {
			return Optional.empty();
		}
		if (v.validFrom() != null && today.isBefore(v.validFrom())) {
			return Optional.empty();
		}
		if (v.validTo() != null && today.isAfter(v.validTo())) {
			return Optional.empty();
		}
		return Optional.of(v);
	}

	private static LocalDate toLocalDate(Date d) {
		if (d == null) {
			return null;
		}
		return d.toLocalDate();
	}

	public record VoucherRow(int id, String code, String name, String discountType, BigDecimal discountValue,
			boolean isActive, LocalDate validFrom, LocalDate validTo) {
	}
}
