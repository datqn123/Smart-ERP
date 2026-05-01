package com.example.smart_erp.inventory.dispatch.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record StockDispatchDetailLineData(@JsonProperty("lineId") long lineId,
		@JsonProperty("inventoryId") long inventoryId, @JsonProperty("quantity") int quantity,
		@JsonProperty("availableQuantity") int availableQuantity, @JsonProperty("shortageLine") boolean shortageLine,
		@JsonProperty("productName") String productName, @JsonProperty("skuCode") String skuCode,
		@JsonProperty("warehouseCode") String warehouseCode, @JsonProperty("shelfCode") String shelfCode) {
}
