package com.example.smart_erp.inventory.receipts.lifecycle;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@JsonIgnoreProperties(ignoreUnknown = false)
public record StockReceiptRejectRequest(
		@JsonProperty("reason") @NotBlank @Size(max = 2000) String reason) {
}
