package com.example.smart_erp.inventory.receipts.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

/** Trang list phiếu nhập — Task013. */
public record StockReceiptListPageData(
		@JsonProperty("items") List<StockReceiptListItemData> items,
		@JsonProperty("page") int page,
		@JsonProperty("limit") int limit,
		@JsonProperty("total") long total) {
}
