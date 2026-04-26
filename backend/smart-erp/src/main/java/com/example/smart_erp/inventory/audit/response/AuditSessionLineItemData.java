package com.example.smart_erp.inventory.audit.response;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

/** Một dòng kiểm kê trong chi tiết — Task023 §6. */
public record AuditSessionLineItemData(
		@JsonProperty("id") long id,
		@JsonProperty("auditSessionId") long auditSessionId,
		@JsonProperty("inventoryId") long inventoryId,
		@JsonProperty("productId") int productId,
		@JsonProperty("productName") String productName,
		@JsonProperty("skuCode") String skuCode,
		@JsonProperty("unitName") String unitName,
		@JsonProperty("locationId") int locationId,
		@JsonProperty("warehouseCode") String warehouseCode,
		@JsonProperty("shelfCode") String shelfCode,
		@JsonProperty("batchNumber") String batchNumber,
		@JsonProperty("systemQuantity") BigDecimal systemQuantity,
		@JsonProperty("actualQuantity") BigDecimal actualQuantity,
		@JsonProperty("variance") BigDecimal variance,
		@JsonProperty("variancePercent") BigDecimal variancePercent,
		@JsonProperty("isCounted") boolean isCounted,
		@JsonProperty("notes") String notes) {
}
