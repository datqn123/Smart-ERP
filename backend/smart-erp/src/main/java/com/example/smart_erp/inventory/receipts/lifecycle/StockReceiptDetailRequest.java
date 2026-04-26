package com.example.smart_erp.inventory.receipts.lifecycle;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@JsonIgnoreProperties(ignoreUnknown = false)
public record StockReceiptDetailRequest(
		@JsonProperty("productId") @NotNull @Positive Integer productId,
		@JsonProperty("unitId") @NotNull @Positive Integer unitId,
		@JsonProperty("quantity") @NotNull @Positive Integer quantity,
		@JsonProperty("costPrice") @NotNull @DecimalMin(value = "0", inclusive = true) BigDecimal costPrice,
		@JsonProperty("batchNumber") String batchNumber,
		@JsonProperty("expiryDate") String expiryDate) {
}
