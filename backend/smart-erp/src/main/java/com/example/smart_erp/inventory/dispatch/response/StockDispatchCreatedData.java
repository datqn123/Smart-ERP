package com.example.smart_erp.inventory.dispatch.response;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

public record StockDispatchCreatedData(
		@JsonProperty("id") long id,
		@JsonProperty("dispatchCode") String dispatchCode,
		@JsonProperty("dispatchDate") LocalDate dispatchDate,
		@JsonProperty("status") String status,
		@JsonProperty("referenceLabel") String referenceLabel) {
}
