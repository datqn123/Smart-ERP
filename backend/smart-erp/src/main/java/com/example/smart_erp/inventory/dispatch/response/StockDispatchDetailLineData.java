package com.example.smart_erp.inventory.dispatch.response;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record StockDispatchDetailLineData(@JsonProperty("lineId") long lineId,
		@JsonProperty("inventoryId") long inventoryId, @JsonProperty("quantity") int quantity,
		@JsonProperty("availableQuantity") int availableQuantity, @JsonProperty("shortageLine") boolean shortageLine,
		@JsonProperty("productName") String productName, @JsonProperty("skuCode") String skuCode,
		@JsonProperty("warehouseCode") String warehouseCode, @JsonProperty("shelfCode") String shelfCode,
		@JsonProperty("unitPriceSnapshot") BigDecimal unitPriceSnapshot) {
}
