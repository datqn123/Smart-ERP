package com.example.smart_erp.inventory.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Dữ liệu GET list + meta phân trang.
 */
public record InventoryListPageData(
		@JsonProperty("summary") InventorySummaryData summary,
		@JsonProperty("items") List<InventoryListItemData> items,
		@JsonProperty("page") int page,
		@JsonProperty("limit") int limit,
		@JsonProperty("total") long total) {
}
