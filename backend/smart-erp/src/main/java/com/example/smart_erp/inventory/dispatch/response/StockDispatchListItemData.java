package com.example.smart_erp.inventory.dispatch.response;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

public record StockDispatchListItemData(
		@JsonProperty("id") long id,
		@JsonProperty("dispatchCode") String dispatchCode,
		@JsonProperty("orderCode") String orderCode,
		@JsonProperty("customerName") String customerName,
		@JsonProperty("dispatchDate") LocalDate dispatchDate,
		@JsonProperty("userName") String userName,
		@JsonProperty("itemCount") int itemCount,
		@JsonProperty("status") String status) {
}
