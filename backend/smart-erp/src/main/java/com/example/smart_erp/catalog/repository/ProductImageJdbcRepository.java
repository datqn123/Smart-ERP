package com.example.smart_erp.catalog.repository;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@SuppressWarnings("null")
@Repository
public class ProductImageJdbcRepository {

	private final NamedParameterJdbcTemplate namedJdbc;

	public ProductImageJdbcRepository(NamedParameterJdbcTemplate namedJdbc) {
		this.namedJdbc = namedJdbc;
	}

	public boolean productExists(int productId) {
		Boolean ok = namedJdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM products WHERE id = :id)",
				new MapSqlParameterSource("id", productId), Boolean.class);
		return Boolean.TRUE.equals(ok);
	}

	public void clearPrimaryForProduct(int productId) {
		namedJdbc.update("UPDATE productimages SET is_primary = FALSE WHERE product_id = :pid AND is_primary = TRUE",
				new MapSqlParameterSource("pid", productId));
	}

	public void updateProductMainImageUrl(int productId, String imageUrl) {
		namedJdbc.update(
				"UPDATE products SET image_url = :url, updated_at = CURRENT_TIMESTAMP WHERE id = :pid",
				new MapSqlParameterSource("pid", productId).addValue("url", imageUrl));
	}

	public int insertImage(int productId, String imageUrl, boolean isPrimary, int sortOrder, Long fileSizeBytes,
			String mimeType) {
		String sql = """
				INSERT INTO productimages (product_id, image_url, is_primary, sort_order, file_size_bytes, mime_type)
				VALUES (:pid, :url, :primary, :sort, :fsize, :mime)
				RETURNING id
				""";
		MapSqlParameterSource p = new MapSqlParameterSource().addValue("pid", productId).addValue("url", imageUrl)
				.addValue("primary", isPrimary).addValue("sort", sortOrder).addValue("fsize", fileSizeBytes)
				.addValue("mime", mimeType);
		Integer id = namedJdbc.queryForObject(sql, p, Integer.class);
		if (id == null) {
			throw new IllegalStateException("INSERT productimages did not return id");
		}
		return id;
	}
}
