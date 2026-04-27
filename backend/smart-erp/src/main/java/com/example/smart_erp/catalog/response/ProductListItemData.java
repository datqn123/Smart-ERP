package com.example.smart_erp.catalog.response;

import java.math.BigDecimal;
import java.time.Instant;

/** Task034 list item */
public record ProductListItemData(int id, String skuCode, String barcode, String name, Integer categoryId,
		String categoryName, String imageUrl, String status, long currentStock, BigDecimal currentPrice,
		Instant createdAt, Instant updatedAt) {
}
