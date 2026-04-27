package com.example.smart_erp.sales.repository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.example.smart_erp.sales.response.PosProductRowData;

@SuppressWarnings("null")
@Repository
public class PosProductJdbcRepository {

	private final NamedParameterJdbcTemplate namedJdbc;

	public PosProductJdbcRepository(NamedParameterJdbcTemplate namedJdbc) {
		this.namedJdbc = namedJdbc;
	}

	public List<PosProductRowData> search(String searchRaw, Integer categoryId, Integer locationId, int limit) {
		String search = searchRaw != null && !searchRaw.isBlank() ? searchRaw.trim() : null;
		MapSqlParameterSource p = new MapSqlParameterSource();
		p.addValue("lim", limit);
		p.addValue("cat", categoryId);
		p.addValue("loc", locationId);
		String searchClause = search == null ? "TRUE"
				: "(p.name ILIKE :pat OR p.sku_code ILIKE :pat OR p.barcode ILIKE :pat OR p.barcode = :raw)";
		if (search != null) {
			p.addValue("pat", "%" + search + "%");
			p.addValue("raw", search);
		}
		String catClause = categoryId == null ? "TRUE" : "p.category_id = :cat";
		String sql = """
				WITH inv AS (
				  SELECT product_id, SUM(quantity)::bigint AS base_qty
				  FROM inventory
				  WHERE (CAST(:loc AS INTEGER) IS NULL OR location_id = :loc)
				  GROUP BY product_id
				)
				SELECT p.id AS product_id, p.name AS product_name, p.sku_code, p.barcode,
				       pu.id AS unit_id, pu.unit_name,
				       (SELECT ph.sale_price FROM productpricehistory ph
				        WHERE ph.product_id = p.id AND ph.unit_id = pu.id AND ph.effective_date <= CURRENT_DATE
				        ORDER BY ph.effective_date DESC, ph.id DESC LIMIT 1) AS unit_price,
				       COALESCE(inv.base_qty, 0)::bigint AS base_qty,
				       pu.conversion_rate,
				       p.image_url
				FROM products p
				JOIN productunits pu ON pu.product_id = p.id
				LEFT JOIN inv ON inv.product_id = p.id
				WHERE p.status = 'Active'
				AND (""" + searchClause + ") AND (" + catClause + ") ORDER BY p.name, pu.is_base_unit DESC, pu.id LIMIT :lim";
		return namedJdbc.query(sql, p, (rs, rn) -> {
			long base = rs.getLong("base_qty");
			BigDecimal rate = rs.getBigDecimal("conversion_rate");
			long avail = 0L;
			if (rate != null && rate.compareTo(BigDecimal.ZERO) > 0) {
				avail = BigDecimal.valueOf(base).divide(rate, 0, RoundingMode.DOWN).longValue();
			}
			BigDecimal unitPrice = rs.getBigDecimal("unit_price");
			return new PosProductRowData(rs.getInt("product_id"), rs.getString("product_name"), rs.getString("sku_code"),
					rs.getString("barcode"), rs.getInt("unit_id"), rs.getString("unit_name"), unitPrice, avail,
					rs.getString("image_url"));
		});
	}
}
