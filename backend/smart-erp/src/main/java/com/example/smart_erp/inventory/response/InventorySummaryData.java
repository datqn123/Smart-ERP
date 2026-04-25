package com.example.smart_erp.inventory.response;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Bốn KPI tổng theo cùng bộ lọc, không phân trang — API Task005.
 */
public record InventorySummaryData(
		@JsonProperty("totalSkus") long totalSkus,
		@JsonProperty("totalValue") java.math.BigDecimal totalValue,
		@JsonProperty("lowStockCount") long lowStockCount,
		@JsonProperty("expiringSoonCount") long expiringSoonCount) {
}
