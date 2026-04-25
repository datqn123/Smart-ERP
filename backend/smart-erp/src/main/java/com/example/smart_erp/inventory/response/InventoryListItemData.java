package com.example.smart_erp.inventory.response;

import java.time.Instant;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Một dòng tồn theo bảng — API Task005.
 */
public record InventoryListItemData(
		@JsonProperty("id") long id,
		@JsonProperty("productId") long productId,
		@JsonProperty("productName") String productName,
		@JsonProperty("skuCode") String skuCode,
		@JsonProperty("barcode") String barcode,
		@JsonProperty("locationId") int locationId,
		@JsonProperty("warehouseCode") String warehouseCode,
		@JsonProperty("shelfCode") String shelfCode,
		@JsonProperty("batchNumber") String batchNumber,
		@JsonProperty("expiryDate") LocalDate expiryDate,
		@JsonProperty("quantity") int quantity,
		@JsonProperty("minQuantity") int minQuantity,
		@JsonProperty("unitId") int unitId,
		@JsonProperty("unitName") String unitName,
		@JsonProperty("costPrice") java.math.BigDecimal costPrice,
		@JsonProperty("updatedAt") Instant updatedAt,
		@JsonProperty("isLowStock") boolean isLowStock,
		@JsonProperty("isExpiringSoon") boolean isExpiringSoon,
		@JsonProperty("totalValue") java.math.BigDecimal totalValue) {
}
