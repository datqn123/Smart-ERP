package com.example.smart_erp.inventory.response;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Chi tiết một dòng tồn + {@code relatedLines} — SRS Task006 / API Task006.
 */
public record InventoryByIdData(
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
		@JsonProperty("totalValue") java.math.BigDecimal totalValue,
		@JsonProperty("relatedLines") List<InventoryRelatedLineData> relatedLines) {

	public static InventoryByIdData fromItem(InventoryListItemData item, List<InventoryRelatedLineData> relatedLines) {
		return new InventoryByIdData(
				item.id(),
				item.productId(),
				item.productName(),
				item.skuCode(),
				item.barcode(),
				item.locationId(),
				item.warehouseCode(),
				item.shelfCode(),
				item.batchNumber(),
				item.expiryDate(),
				item.quantity(),
				item.minQuantity(),
				item.unitId(),
				item.unitName(),
				item.costPrice(),
				item.updatedAt(),
				item.isLowStock(),
				item.isExpiringSoon(),
				item.totalValue(),
				relatedLines);
	}
}
