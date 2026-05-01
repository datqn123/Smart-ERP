package com.example.smart_erp.inventory.dispatch;

import java.sql.Date;
import java.sql.Types;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.example.smart_erp.inventory.dispatch.response.StockDispatchListItemData;

@SuppressWarnings("null")
@Repository
public class StockDispatchJdbcRepository {

	private final NamedParameterJdbcTemplate namedJdbc;

	public StockDispatchJdbcRepository(NamedParameterJdbcTemplate namedJdbc) {
		this.namedJdbc = namedJdbc;
	}

	public record LockedInventoryRow(
			long id,
			int productId,
			int locationId,
			int quantity,
			int lineUnitId,
			int baseUnitId,
			java.math.BigDecimal lineConversionRate) {
	}

	public Optional<LockedInventoryRow> lockInventoryRowForUpdate(long inventoryId) {
		String sql = """
				SELECT i.id, i.product_id, i.location_id, i.quantity,
				       COALESCE(i.unit_id, pub.id) AS line_unit_id,
				       pub.id AS base_unit_id,
				       COALESCE(pud.conversion_rate, 1) AS line_rate
				FROM inventory i
				INNER JOIN products p ON p.id = i.product_id
				INNER JOIN productunits pub ON pub.product_id = p.id AND pub.is_base_unit = TRUE
				LEFT JOIN productunits pud ON pud.id = i.unit_id
				WHERE i.id = :id
				FOR UPDATE OF i
				""";
		return namedJdbc.query(sql, Map.of("id", inventoryId), rs -> {
			if (!rs.next()) {
				return Optional.empty();
			}
			return Optional.of(new LockedInventoryRow(
					rs.getLong("id"),
					rs.getInt("product_id"),
					rs.getInt("location_id"),
					rs.getInt("quantity"),
					rs.getInt("line_unit_id"),
					rs.getInt("base_unit_id"),
					rs.getBigDecimal("line_rate")));
		});
	}

	public void deductInventoryQuantity(long inventoryId, int deductInRowUnit) {
		namedJdbc.update(
				"UPDATE inventory SET quantity = quantity - :d, updated_at = CURRENT_TIMESTAMP WHERE id = :id",
				new MapSqlParameterSource("d", deductInRowUnit).addValue("id", inventoryId));
	}

	public long insertManualDispatchHeader(String tempCode, int userId, LocalDate dispatchDate, String status,
			String notes, String referenceLabel) {
		KeyHolder kh = new GeneratedKeyHolder();
		String sql = """
				INSERT INTO stockdispatches (dispatch_code, order_id, user_id, dispatch_date, status, notes, reference_label)
				VALUES (:code, NULL, :uid, :d, :st, :notes, :ref)
				""";
		MapSqlParameterSource p = new MapSqlParameterSource("code", tempCode)
				.addValue("uid", userId)
				.addValue("d", Date.valueOf(dispatchDate))
				.addValue("st", status)
				.addValue("notes", notes, Types.VARCHAR)
				.addValue("ref", referenceLabel, Types.VARCHAR);
		namedJdbc.update(sql, p, kh, new String[] { "id" });
		Number key = kh.getKey();
		if (key == null) {
			throw new IllegalStateException("INSERT stockdispatches không trả id");
		}
		return key.longValue();
	}

	public void updateDispatchCode(long dispatchId, String dispatchCode) {
		namedJdbc.update("UPDATE stockdispatches SET dispatch_code = :c, updated_at = CURRENT_TIMESTAMP WHERE id = :id",
				Map.of("c", dispatchCode, "id", dispatchId));
	}

	private static void appendFilters(StringBuilder where, MapSqlParameterSource src, String search, String status,
			String dateFrom, String dateTo) {
		boolean first = where.length() == 0;
		if (search != null && !search.isBlank()) {
			where.append(first ? " WHERE " : " AND ").append("""
					(sd.dispatch_code ILIKE :s
					   OR COALESCE(so.order_code, '') ILIKE :s
					   OR COALESCE(sd.reference_label, '') ILIKE :s)
					""");
			src.addValue("s", "%" + search.trim() + "%");
			first = false;
		}
		if (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) {
			where.append(first ? " WHERE " : " AND ").append("sd.status = :st");
			src.addValue("st", status);
			first = false;
		}
		if (dateFrom != null && !dateFrom.isBlank()) {
			where.append(first ? " WHERE " : " AND ").append("sd.dispatch_date >= CAST(:df AS date)");
			src.addValue("df", dateFrom);
			first = false;
		}
		if (dateTo != null && !dateTo.isBlank()) {
			where.append(first ? " WHERE " : " AND ").append("sd.dispatch_date <= CAST(:dt AS date)");
			src.addValue("dt", dateTo);
		}
	}

	public long countDispatches(String search, String status, String dateFrom, String dateTo) {
		StringBuilder where = new StringBuilder();
		MapSqlParameterSource src = new MapSqlParameterSource();
		appendFilters(where, src, search, status, dateFrom, dateTo);
		String sql = "SELECT COUNT(*)::bigint FROM stockdispatches sd LEFT JOIN salesorders so ON so.id = sd.order_id "
				+ where;
		Long n = namedJdbc.queryForObject(sql, src, Long.class);
		return n == null ? 0L : n;
	}

	public List<StockDispatchListItemData> listDispatches(String search, String status, String dateFrom, String dateTo,
			int limit, int offset) {
		StringBuilder where = new StringBuilder();
		MapSqlParameterSource src = new MapSqlParameterSource("lim", limit).addValue("off", offset);
		appendFilters(where, src, search, status, dateFrom, dateTo);
		String sql = """
				SELECT sd.id, sd.dispatch_code,
				       COALESCE(so.order_code, '—') AS order_code,
				       COALESCE(c.name, COALESCE(sd.reference_label, '—')) AS customer_name,
				       sd.dispatch_date,
				       COALESCE(u.full_name, u.email, '—') AS user_name,
				       (SELECT COUNT(*)::int FROM inventorylogs il
				        WHERE il.dispatch_id = sd.id AND il.action_type = 'OUTBOUND') AS item_count,
				       sd.status
				FROM stockdispatches sd
				INNER JOIN users u ON u.id = sd.user_id
				LEFT JOIN salesorders so ON so.id = sd.order_id
				LEFT JOIN customers c ON c.id = so.customer_id
				"""
				+ where
				+ """
				ORDER BY sd.id DESC
				LIMIT :lim OFFSET :off
				""";
		return namedJdbc.query(sql, src, (rs, rn) -> new StockDispatchListItemData(
				rs.getLong("id"),
				rs.getString("dispatch_code"),
				rs.getString("order_code"),
				rs.getString("customer_name"),
				rs.getObject("dispatch_date", LocalDate.class),
				rs.getString("user_name"),
				rs.getInt("item_count"),
				rs.getString("status")));
	}
}
