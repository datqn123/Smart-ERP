package com.example.smart_erp.inventory.receipts.lifecycle;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@JsonIgnoreProperties(ignoreUnknown = false)
public record StockReceiptApproveRequest(
		@JsonProperty("inboundLocationId") @NotNull @Positive Integer inboundLocationId) {
}
