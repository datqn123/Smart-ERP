package com.example.smart_erp.inventory.receipts.lifecycle;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

@JsonIgnoreProperties(ignoreUnknown = false)
public record StockReceiptCreateRequest(
		@JsonProperty("supplierId") @NotNull @Positive Integer supplierId,
		@JsonProperty("receiptDate") @NotNull @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$") String receiptDate,
		@JsonProperty("invoiceNumber") @Size(max = 100) String invoiceNumber,
		@JsonProperty("notes") String notes,
		@JsonProperty("saveMode") @NotNull @Pattern(regexp = "^(draft|pending)$") String saveMode,
		@JsonProperty("details") @NotNull @NotEmpty @Valid List<StockReceiptDetailRequest> details) {
}
