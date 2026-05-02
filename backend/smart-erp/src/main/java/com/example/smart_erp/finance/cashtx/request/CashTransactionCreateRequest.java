package com.example.smart_erp.finance.cashtx.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * SRS Task065 — POST body (server bỏ qua / từ chối {@code status} khác quy tắc BR-12).
 */
public record CashTransactionCreateRequest(@NotBlank String direction, @NotNull @Positive BigDecimal amount,
		@NotBlank @Size(min = 1, max = 500) String category, @Size(max = 2000) String description,
		@Size(max = 30) String paymentMethod, @NotNull LocalDate transactionDate, @NotNull Integer fundId, String status) {
}
