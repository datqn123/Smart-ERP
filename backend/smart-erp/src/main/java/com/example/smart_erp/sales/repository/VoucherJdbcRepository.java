package com.example.smart_erp.sales.repository;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
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
		return loadByCodeIgnoreCase(code).filter(this::isRetailWindowAndActiveAndQuotaOk);
	}

	/**
	 * Khóa dòng voucher theo mã (FOR UPDATE) — chỉ gọi trong transaction ghi.
	 */
	public Optional<VoucherRow> lockVoucherByCodeForUpdate(String code) {
		if (code == null || code.isBlank()) {
			return Optional.empty();
		}
		String sql = """
				SELECT id, code, name, discount_type, discount_value, is_active, valid_from, valid_to,
				       used_count, max_uses, created_at
				FROM vouchers
				WHERE UPPER(TRIM(code)) = UPPER(TRIM(:code))
				LIMIT 1
				FOR UPDATE
				""";
		List<VoucherRow> rows = namedJdbc.query(sql, Map.of("code", code), (rs, rn) -> mapRow(rs));
		return rows.isEmpty() ? Optional.empty() : Optional.of(rows.getFirst());
	}

	public Optional<VoucherRow> findVoucherById(int id) {
		String sql = """
				SELECT id, code, name, discount_type, discount_value, is_active, valid_from, valid_to,
				       used_count, max_uses, created_at
				FROM vouchers WHERE id = :id LIMIT 1
				""";
		List<VoucherRow> rows = namedJdbc.query(sql, Map.of("id", id), (rs, rn) -> mapRow(rs));
		return rows.isEmpty() ? Optional.empty() : Optional.of(rows.getFirst());
	}

	/** Theo mã, không lọc hạn/ngày — dùng preview / tra cứu. */
	public Optional<VoucherRow> findVoucherByCodeIgnoreCase(String code) {
		if (code == null || code.isBlank()) {
			return Optional.empty();
		}
		return loadByCodeIgnoreCase(code);
	}

	public long countRetailApplicable(LocalDate today) {
		String sql = """
				SELECT COUNT(*)::bigint FROM vouchers v
				WHERE v.is_active = TRUE
				  AND (v.valid_from IS NULL OR v.valid_from <= CAST(:today AS date))
				  AND (v.valid_to IS NULL OR v.valid_to >= CAST(:today AS date))
				  AND (v.max_uses IS NULL OR v.used_count < v.max_uses)
				""";
		Long n = namedJdbc.queryForObject(sql, Map.of("today", java.sql.Date.valueOf(today)), Long.class);
		return n == null ? 0L : n;
	}

	public List<VoucherRow> findRetailApplicablePage(LocalDate today, int limit, int offset) {
		String sql = """
				SELECT id, code, name, discount_type, discount_value, is_active, valid_from, valid_to,
				       used_count, max_uses, created_at
				FROM vouchers v
				WHERE v.is_active = TRUE
				  AND (v.valid_from IS NULL OR v.valid_from <= CAST(:today AS date))
				  AND (v.valid_to IS NULL OR v.valid_to >= CAST(:today AS date))
				  AND (v.max_uses IS NULL OR v.used_count < v.max_uses)
				ORDER BY v.created_at DESC, v.id DESC
				LIMIT :limit OFFSET :offset
				""";
		MapSqlParameterSource p = new MapSqlParameterSource();
		p.addValue("today", java.sql.Date.valueOf(today));
		p.addValue("limit", limit);
		p.addValue("offset", offset);
		return namedJdbc.query(sql, p, (rs, rn) -> mapRow(rs));
	}

	public void incrementUsedCount(int voucherId) {
		namedJdbc.update("UPDATE vouchers SET used_count = used_count + 1 WHERE id = :id", Map.of("id", voucherId));
	}

	public void insertRedemption(int voucherId, int salesOrderId) {
		namedJdbc.update("""
				INSERT INTO voucher_redemptions (voucher_id, sales_order_id)
				VALUES (:vid, :oid)
				""", Map.of("vid", voucherId, "oid", salesOrderId));
	}

	/**
	 * Hoàn tác lượt dùng khi hủy đơn bán lẻ (nếu có bản ghi log).
	 */
	public void reverseRedemptionForOrder(int salesOrderId) {
		List<Integer> vids = namedJdbc.query("""
				DELETE FROM voucher_redemptions WHERE sales_order_id = :oid RETURNING voucher_id
				""", Map.of("oid", salesOrderId), (rs, rn) -> rs.getInt("voucher_id"));
		if (vids.isEmpty()) {
			return;
		}
		int vid = vids.getFirst();
		namedJdbc.update("UPDATE vouchers SET used_count = GREATEST(0, used_count - 1) WHERE id = :id",
				Map.of("id", vid));
	}

	private Optional<VoucherRow> loadByCodeIgnoreCase(String code) {
		String sql = """
				SELECT id, code, name, discount_type, discount_value, is_active, valid_from, valid_to,
				       used_count, max_uses, created_at
				FROM vouchers
				WHERE UPPER(TRIM(code)) = UPPER(TRIM(:code))
				LIMIT 1
				""";
		List<VoucherRow> rows = namedJdbc.query(sql, Map.of("code", code), (rs, rn) -> mapRow(rs));
		return rows.isEmpty() ? Optional.empty() : Optional.of(rows.getFirst());
	}

	private boolean isRetailWindowAndActiveAndQuotaOk(VoucherRow v) {
		LocalDate today = LocalDate.now();
		if (!v.isActive()) {
			return false;
		}
		if (v.validFrom() != null && today.isBefore(v.validFrom())) {
			return false;
		}
		if (v.validTo() != null && today.isAfter(v.validTo())) {
			return false;
		}
		return v.maxUses() == null || v.usedCount() < v.maxUses();
	}

	private static VoucherRow mapRow(java.sql.ResultSet rs) throws java.sql.SQLException {
		Timestamp cat = rs.getTimestamp("created_at");
		Instant createdAt = cat != null ? cat.toInstant() : null;
		int used = rs.getInt("used_count");
		int maxU = rs.getInt("max_uses");
		boolean maxNull = rs.wasNull();
		return new VoucherRow(rs.getInt("id"), rs.getString("code"), rs.getString("name"), rs.getString("discount_type"),
				rs.getBigDecimal("discount_value"), rs.getBoolean("is_active"), toLocalDate(rs.getDate("valid_from")),
				toLocalDate(rs.getDate("valid_to")), used, maxNull ? null : maxU, createdAt);
	}

	private static LocalDate toLocalDate(Date d) {
		if (d == null) {
			return null;
		}
		return d.toLocalDate();
	}

	public record VoucherRow(int id, String code, String name, String discountType, BigDecimal discountValue,
			boolean isActive, LocalDate validFrom, LocalDate validTo, int usedCount, Integer maxUses,
			Instant createdAt) {
	}
}
