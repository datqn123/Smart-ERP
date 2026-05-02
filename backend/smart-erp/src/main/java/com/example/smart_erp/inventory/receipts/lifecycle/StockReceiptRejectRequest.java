package com.example.smart_erp.inventory.receipts.lifecycle;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@JsonIgnoreProperties(ignoreUnknown = false)
public record StockReceiptRejectRequest(
		@JsonProperty("reason") @NotBlank @Size(min = 15, max = 2000,
				message = "Lý do từ chối phải ghi rõ (tối thiểu 15 ký tự), tối đa 2000 ký tự") String reason) {
}
