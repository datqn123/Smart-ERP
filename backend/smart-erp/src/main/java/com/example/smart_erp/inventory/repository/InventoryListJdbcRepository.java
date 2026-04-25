package com.example.smart_erp.inventory.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.example.smart_erp.inventory.query.InventoryListQuery;
import com.example.smart_erp.inventory.query.InventoryStockLevel;
import com.example.smart_erp.inventory.response.InventorySummaryData;

/**
 * Đọc tồn theo SRS Task005; SQL dialect PostgreSQL (bảng Flyway V1).
 */
@Repository
public class InventoryListJdbcRepository {

	private static final String BASE_FROM = """
			FROM inventory i
			INNER JOIN products p ON p.id = i.product_id
			INNER JOIN warehouselocations wl ON wl.id = i.location_id
			INNER JOIN productunits pu ON pu.product_id = p.id AND pu.is_base_unit = true
			LEFT JOIN LATERAL (
			  SELECT pph1.cost_price AS latest_cost
			  FROM productpricehistory pph1
			  WHERE pph1.product_id = p.id AND pph1.unit_id = pu.id
			  ORDER BY pph1.effective_date DESC, pph1.id DESC
			  LIMIT 1
			) pph ON true
			""";

	private static final String SELECT_LIST_COLUMNS = """
			SELECT
			  i.id,
			  i.product_id,
			  p.name AS product_name,
			  p.sku_code,
			  p.barcode,
			  i.location_id,
			  wl.warehouse_code,
			  wl.shelf_code,
			  i.batch_number,
			  i.expiry_date,
			  i.quantity,
			  i.min_quantity,
			  pu.id AS unit_id,
			  pu.unit_name,
			  pph.latest_cost,
			  i.updated_at
			""";

	private final NamedParameterJdbcTemplate namedJdbc;

	public InventoryListJdbcRepository(NamedParameterJdbcTemplate namedJdbc) {
		this.namedJdbc = namedJdbc;
	}

	public InventorySummaryData loadSummary(InventoryListQuery q) {
		Filter f = buildFilter(q);
		String sql = """
				SELECT
				  COUNT(*)::bigint AS total_skus,
				  COALESCE(SUM(i.quantity::numeric * COALESCE(pph.latest_cost::numeric, 0)), 0) AS total_value,
				  COALESCE(SUM(
				    CASE
				      WHEN i.quantity > 0 AND i.quantity <= i.min_quantity
				      THEN 1
				      ELSE 0
				    END
				  ), 0)::bigint AS low_stock_count,
				  COALESCE(SUM(
				    CASE
				      WHEN i.expiry_date IS NOT NULL
				        AND i.expiry_date <= (CURRENT_DATE + interval '30 day')
				        AND i.quantity > 0
				      THEN 1
				      ELSE 0
				    END
				  ), 0)::bigint AS expiring_soon_count
				""" + BASE_FROM + f.where;
		return namedJdbc.queryForObject(sql, f.source, (rs, n) -> new InventorySummaryData(
				rs.getLong("total_skus"),
				rs.getBigDecimal("total_value"),
				rs.getLong("low_stock_count"),
				rs.getLong("expiring_soon_count")));
	}

	public long countRows(InventoryListQuery q) {
		Filter f = buildFilter(q);
		String sql = "SELECT COUNT(*) " + BASE_FROM + f.where;
		Long c = namedJdbc.queryForObject(sql, f.source, Long.class);
		return c != null ? c : 0L;
	}

	public List<InventoryListRow> loadPage(InventoryListQuery q) {
		Filter f = buildFilter(q);
		int offset = (q.page() - 1) * q.limit();
		String order = q.sort().orderByFragment();
		// page/limit đã validate; ghép số an toàn hơn mở rộng tên tham số
		String sql = SELECT_LIST_COLUMNS + BASE_FROM + f.where + " ORDER BY " + order + " LIMIT " + q.limit() + " OFFSET " + offset;
		return namedJdbc.query(sql, f.source, ROW);
	}

	private static final RowMapper<InventoryListRow> ROW = InventoryListJdbcRepository::mapListRow;

	private static InventoryListRow mapListRow(ResultSet rs, int i) throws SQLException {
		Instant upd = rs.getTimestamp("updated_at") != null ? rs.getTimestamp("updated_at").toInstant() : Instant.parse("1970-01-01T00:00:00Z");
		var cost = rs.getBigDecimal("latest_cost");
		return new InventoryListRow(
				rs.getLong("id"),
				rs.getLong("product_id"),
				rs.getString("product_name"),
				rs.getString("sku_code"),
				rs.getString("barcode"),
				rs.getInt("location_id"),
				rs.getString("warehouse_code"),
				rs.getString("shelf_code"),
				rs.getString("batch_number"),
				rs.getObject("expiry_date", LocalDate.class),
				rs.getInt("quantity"),
				rs.getInt("min_quantity"),
				rs.getInt("unit_id"),
				rs.getString("unit_name"),
				cost == null ? java.math.BigDecimal.ZERO : cost,
				upd);
	}

	public record InventoryListRow(
			long id,
			long productId,
			String productName,
			String skuCode,
			String barcode,
			int locationId,
			String warehouseCode,
			String shelfCode,
			String batchNumber,
			LocalDate expiryDate,
			int quantity,
			int minQuantity,
			int unitId,
			String unitName,
			java.math.BigDecimal costPrice,
			Instant updatedAt) {
	}

	private Filter buildFilter(InventoryListQuery q) {
		StringBuilder sb = new StringBuilder(" WHERE 1=1");
		var src = new MapSqlParameterSource();
		appendStockLevel(q.stockLevel(), sb);
		if (q.search() != null) {
			sb.append(" AND (p.name ilike :_search OR p.sku_code ilike :_search)");
			src.addValue("_search", buildSearchPattern(q.search()));
		}
		if (q.locationId() != null) {
			sb.append(" AND i.location_id = :_location_id");
			src.addValue("_location_id", q.locationId());
		}
		if (q.categoryId() != null) {
			sb.append(" AND p.category_id = :_category_id");
			src.addValue("_category_id", q.categoryId());
		}
		return new Filter(sb.toString(), src);
	}

	private static void appendStockLevel(InventoryStockLevel s, StringBuilder sb) {
		if (s == null || s == InventoryStockLevel.ALL) {
			return;
		}
		if (s == InventoryStockLevel.IN_STOCK) {
			sb.append(" AND i.quantity > i.min_quantity");
		}
		else if (s == InventoryStockLevel.LOW_STOCK) {
			sb.append(" AND i.quantity > 0 AND i.quantity <= i.min_quantity");
		}
		else if (s == InventoryStockLevel.OUT_OF_STOCK) {
			sb.append(" AND i.quantity = 0");
		}
	}

	/**
	 * Loại ký tự joker thường gặp trong tìm theo tên, tránh tác động ILIKE; param vẫn
	 * gắn theo tên nên an toàn SQLi.
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

	private static final class Filter {
		/** Cùng tệp: outer cần đọc. */
		final String where;
		/** Cùng tệp. */
		final MapSqlParameterSource source;

		Filter(String w, MapSqlParameterSource s) {
			this.where = w;
			this.source = s;
		}
	}
}
