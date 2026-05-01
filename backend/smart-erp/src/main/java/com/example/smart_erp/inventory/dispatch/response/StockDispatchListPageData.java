package com.example.smart_erp.inventory.dispatch.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record StockDispatchListPageData(
		@JsonProperty("items") List<StockDispatchListItemData> items,
		@JsonProperty("page") int page,
		@JsonProperty("limit") int limit,
		@JsonProperty("total") long total) {
}
