package com.example.smart_erp.catalog.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/** Task036 detail */
public record ProductDetailData(int id, String skuCode, String barcode, String name, Integer categoryId,
		String categoryName, String description, BigDecimal weight, String status, String imageUrl,
		Instant createdAt, Instant updatedAt, List<ProductUnitRow> units, List<ProductGalleryImageData> images) {
}
