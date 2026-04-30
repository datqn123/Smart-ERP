package com.example.smart_erp.settings.storeprofile;

import java.sql.Timestamp;
import java.sql.Types;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.example.smart_erp.settings.storeprofile.response.StoreProfileData;

/**
 * Task073–075 — persistence for {@code storeprofiles}.
 */
@SuppressWarnings("null")
@Repository
public class StoreProfileJdbcRepository {

	private static final RowMapper<StoreProfileData> ROW = (rs, i) -> {
		Timestamp ua = rs.getTimestamp("updated_at");
		Integer defaultLoc = rs.getObject("default_retail_location_id") != null ? rs.getInt("default_retail_location_id") : null;
		return new StoreProfileData(rs.getLong("id"), rs.getString("name"), rs.getString("business_category"), rs.getString("address"),
				rs.getString("phone"), rs.getString("email"), rs.getString("website"), rs.getString("tax_code"), rs.getString("footer_note"),
				rs.getString("logo_url"), rs.getString("facebook_url"), rs.getString("instagram_handle"), defaultLoc,
				ua != null ? ua.toInstant() : Instant.EPOCH);
	};

	private final NamedParameterJdbcTemplate namedJdbc;

	public StoreProfileJdbcRepository(NamedParameterJdbcTemplate namedJdbc) {
		this.namedJdbc = namedJdbc;
	}

	public void ensureExists(int ownerId, String defaultName) {
		String sql = """
				INSERT INTO storeprofiles (owner_id, name)
				VALUES (:oid, :name)
				ON CONFLICT (owner_id) DO NOTHING
				""";
		namedJdbc.update(sql, new MapSqlParameterSource("oid", ownerId).addValue("name", defaultName));
	}

	public Optional<StoreProfileData> findByOwnerId(int ownerId) {
		String sql = """
				SELECT
				  id, name, business_category, address, phone, email, website, tax_code, footer_note,
				  logo_url, facebook_url, instagram_handle, default_retail_location_id, updated_at
				FROM storeprofiles
				WHERE owner_id = :oid
				LIMIT 1
				""";
		var list = namedJdbc.query(sql, new MapSqlParameterSource("oid", ownerId), ROW);
		return list.isEmpty() ? Optional.empty() : Optional.of(list.getFirst());
	}

	public void updateLogoUrl(int ownerId, String publicUrl) {
		String sql = "UPDATE storeprofiles SET logo_url = :u WHERE owner_id = :oid";
		namedJdbc.update(sql, new MapSqlParameterSource("oid", ownerId).addValue("u", publicUrl));
	}

	public void updatePartial(int ownerId, Map<String, Object> columnToValue) {
		if (columnToValue.isEmpty()) {
			return;
		}
		StringBuilder sb = new StringBuilder("UPDATE storeprofiles SET ");
		MapSqlParameterSource src = new MapSqlParameterSource("oid", ownerId);
		int n = 0;
		for (Map.Entry<String, Object> e : columnToValue.entrySet()) {
			String col = e.getKey();
			Object val = e.getValue();
			if (n++ > 0) {
				sb.append(", ");
			}
			String p = "p_" + col;
			sb.append(col).append(" = :").append(p);
			if ("default_retail_location_id".equals(col)) {
				src.addValue(p, val, Types.INTEGER);
			}
			else {
				src.addValue(p, val, Types.VARCHAR);
			}
		}
		sb.append(" WHERE owner_id = :oid");
		namedJdbc.update(sb.toString(), src);
	}

	public boolean existsWarehouseLocation(int locationId) {
		String sql = "SELECT 1 FROM warehouselocations WHERE id = :id LIMIT 1";
		var list = namedJdbc.query(sql, new MapSqlParameterSource("id", locationId), (rs, i) -> 1);
		return !list.isEmpty();
	}

	public static Map<String, Object> newOrderedPatchMap() {
		return new LinkedHashMap<>();
	}
}

