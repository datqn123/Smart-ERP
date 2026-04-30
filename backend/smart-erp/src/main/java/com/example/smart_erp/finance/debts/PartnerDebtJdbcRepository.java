package com.example.smart_erp.finance.debts;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.example.smart_erp.finance.debts.response.PartnerDebtItemData;
import com.example.smart_erp.finance.ledger.FinanceLedgerJdbcRepository;

/**
 * SRS Task069–072 — persistence {@code partnerdebts}.
 */
@SuppressWarnings("null")
@Repository
public class PartnerDebtJdbcRepository {

	public record DebtLockRow(long id, String debtCode, String partnerType, Long customerId, Long supplierId, BigDecimal totalAmount,
			BigDecimal paidAmount, LocalDate dueDate, String status, String notes, int createdBy) {
	}

	private static final String ITEM_SELECT = """
			SELECT d.id, d.debt_code, d.partner_type, d.customer_id, d.supplier_id,
			  COALESCE(c.name, s.name) AS partner_name,
			  d.total_amount, d.paid_amount,
			  (d.total_amount - d.paid_amount) AS remaining_amount,
			  d.due_date, d.status, d.notes, d.created_at, d.updated_at
			FROM partnerdebts d
			LEFT JOIN customers c ON d.customer_id = c.id
			LEFT JOIN suppliers s ON d.supplier_id = s.id
			""";

	private static final RowMapper<PartnerDebtItemData> ITEM_ROW = (rs, i) -> mapItem(rs);

	private static PartnerDebtItemData mapItem(java.sql.ResultSet rs) throws java.sql.SQLException {
		Long cid = rs.getObject("customer_id") != null ? rs.getLong("customer_id") : null;
		Long sid = rs.getObject("supplier_id") != null ? rs.getLong("supplier_id") : null;
		java.sql.Date dd = rs.getDate("due_date");
		String dueStr = dd != null ? dd.toLocalDate().toString() : null;
		Timestamp ca = rs.getTimestamp("created_at");
		Timestamp ua = rs.getTimestamp("updated_at");
		return new PartnerDebtItemData(rs.getLong("id"), rs.getString("debt_code"), rs.getString("partner_type"), cid, sid,
				rs.getString("partner_name"), rs.getBigDecimal("total_amount"), rs.getBigDecimal("paid_amount"),
				rs.getBigDecimal("remaining_amount"), dueStr, rs.getString("status"), rs.getString("notes"),
				ca != null ? ca.toInstant() : null, ua != null ? ua.toInstant() : null);
	}

	private static final RowMapper<DebtLockRow> LOCK_ROW = (rs, i) -> {
		Long cid = rs.getObject("customer_id") != null ? rs.getLong("customer_id") : null;
		Long sid = rs.getObject("supplier_id") != null ? rs.getLong("supplier_id") : null;
		return new DebtLockRow(rs.getLong("id"), rs.getString("debt_code"), rs.getString("partner_type"), cid, sid,
				rs.getBigDecimal("total_amount"), rs.getBigDecimal("paid_amount"), rs.getObject("due_date", LocalDate.class),
				rs.getString("status"), rs.getString("notes"), rs.getInt("created_by"));
	};

	private final NamedParameterJdbcTemplate namedJdbc;

	public PartnerDebtJdbcRepository(NamedParameterJdbcTemplate namedJdbc) {
		this.namedJdbc = namedJdbc;
	}

	public Optional<PartnerDebtItemData> findItemById(long id) {
		String sql = ITEM_SELECT + " WHERE d.id = :id";
		var list = namedJdbc.query(sql, new MapSqlParameterSource("id", id), ITEM_ROW);
		return list.isEmpty() ? Optional.empty() : Optional.of(list.getFirst());
	}

	public long countList(String partnerType, String status, LocalDate dueFrom, LocalDate dueTo, String searchPattern) {
		StringBuilder where = new StringBuilder(" WHERE 1=1 ");
		var src = new MapSqlParameterSource();
		appendFilters(where, src, partnerType, status, dueFrom, dueTo, searchPattern);
		String sql = """
				SELECT COUNT(*) FROM partnerdebts d
				LEFT JOIN customers c ON d.customer_id = c.id
				LEFT JOIN suppliers s ON d.supplier_id = s.id
				""" + where;
		Long c = namedJdbc.queryForObject(sql, src, Long.class);
		return c != null ? c : 0L;
	}

	public List<PartnerDebtItemData> loadPage(String partnerType, String status, LocalDate dueFrom, LocalDate dueTo, String searchPattern,
			int limit, int offset) {
		StringBuilder where = new StringBuilder(" WHERE 1=1 ");
		var src = new MapSqlParameterSource();
		appendFilters(where, src, partnerType, status, dueFrom, dueTo, searchPattern);
		String sql = ITEM_SELECT + where + " ORDER BY d.updated_at DESC, d.id DESC LIMIT :lim OFFSET :off";
		src.addValue("lim", limit).addValue("off", offset);
		return namedJdbc.query(sql, src, ITEM_ROW);
	}

	private static void appendFilters(StringBuilder where, MapSqlParameterSource src, String partnerType, String status,
			LocalDate dueFrom, LocalDate dueTo, String searchPattern) {
		if (partnerType != null && !partnerType.isBlank()) {
			where.append(" AND d.partner_type = :pt ");
			src.addValue("pt", partnerType.trim());
		}
		if (status != null && !status.isBlank()) {
			where.append(" AND d.status = :st ");
			src.addValue("st", status.trim());
		}
		if (dueFrom != null) {
			where.append(" AND d.due_date >= :df ");
			src.addValue("df", java.sql.Date.valueOf(dueFrom), Types.DATE);
		}
		if (dueTo != null) {
			where.append(" AND d.due_date <= :dt ");
			src.addValue("dt", java.sql.Date.valueOf(dueTo), Types.DATE);
		}
		if (searchPattern != null) {
			where.append("""
					 AND (
					   d.debt_code ILIKE :sp OR c.name ILIKE :sp OR c.customer_code ILIKE :sp
					   OR s.name ILIKE :sp OR s.supplier_code ILIKE :sp
					 )
					""");
			src.addValue("sp", searchPattern);
		}
	}

	public int nextDebtCodeSequenceSuffix(int year) {
		String sql = """
				SELECT COALESCE(MAX(split_part(d.debt_code, '-', 3)::int), 0)
				FROM partnerdebts d
				WHERE d.debt_code LIKE 'NO-' || CAST(:y AS text) || '-%'
				""";
		Integer n = namedJdbc.queryForObject(sql, new MapSqlParameterSource("y", year), Integer.class);
		return n != null ? n : 0;
	}

	public long insert(String debtCode, String partnerType, int customerIdOrZero, int supplierIdOrZero, BigDecimal totalAmount,
			BigDecimal paidAmount, LocalDate dueDate, String status, String notes, int createdBy) {
		String sql = """
				INSERT INTO partnerdebts (debt_code, partner_type, customer_id, supplier_id, total_amount, paid_amount,
				  due_date, status, notes, created_by)
				VALUES (:code, :ptype, :cid, :sid, :tot, :paid, :due, :st, :notes, :cb)
				RETURNING id
				""";
		Integer cid = "Customer".equals(partnerType) ? customerIdOrZero : null;
		Integer sid = "Supplier".equals(partnerType) ? supplierIdOrZero : null;
		Long id = namedJdbc.queryForObject(sql,
				new MapSqlParameterSource("code", debtCode).addValue("ptype", partnerType).addValue("cid", cid, Types.INTEGER)
						.addValue("sid", sid, Types.INTEGER).addValue("tot", totalAmount).addValue("paid", paidAmount)
						.addValue("due", dueDate != null ? java.sql.Date.valueOf(dueDate) : null, Types.DATE).addValue("st", status)
						.addValue("notes", notes, Types.VARCHAR).addValue("cb", createdBy),
				Long.class);
		if (id == null) {
			throw new IllegalStateException("INSERT partnerdebts không trả id");
		}
		return id;
	}

	public Optional<DebtLockRow> lockForUpdate(long id) {
		String sql = """
				SELECT d.id, d.debt_code, d.partner_type, d.customer_id, d.supplier_id, d.total_amount, d.paid_amount,
				  d.due_date, d.status, d.notes, d.created_by
				FROM partnerdebts d WHERE d.id = :id FOR UPDATE
				""";
		var list = namedJdbc.query(sql, new MapSqlParameterSource("id", id), LOCK_ROW);
		return list.isEmpty() ? Optional.empty() : Optional.of(list.getFirst());
	}

	public void updateRow(long id, BigDecimal totalAmount, BigDecimal paidAmount, LocalDate dueDate, String notes, String status) {
		String sql = """
				UPDATE partnerdebts SET total_amount = :tot, paid_amount = :paid, due_date = :due, notes = :notes, status = :st,
				  updated_at = NOW() WHERE id = :id
				""";
		namedJdbc.update(sql,
				new MapSqlParameterSource("id", id).addValue("tot", totalAmount).addValue("paid", paidAmount)
						.addValue("due", dueDate != null ? java.sql.Date.valueOf(dueDate) : null, Types.DATE)
						.addValue("notes", notes, Types.VARCHAR).addValue("st", status));
	}

	public boolean existsCustomer(int id) {
		var list = namedJdbc.query("SELECT 1 FROM customers WHERE id = :id LIMIT 1", new MapSqlParameterSource("id", id), (rs, i) -> 1);
		return !list.isEmpty();
	}

	public boolean existsSupplier(int id) {
		var list = namedJdbc.query("SELECT 1 FROM suppliers WHERE id = :id LIMIT 1", new MapSqlParameterSource("id", id), (rs, i) -> 1);
		return !list.isEmpty();
	}

	public static String toSearchPatternOrNull(String raw) {
		return FinanceLedgerJdbcRepository.toSearchPatternOrNull(raw);
	}
}
