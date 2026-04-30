package com.example.smart_erp.finance.debts.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * SRS Task070 — body tạo khoản nợ.
 */
public record DebtCreateRequest(@NotBlank String partnerType, Integer customerId, Integer supplierId,
		@NotNull @DecimalMin(value = "0", inclusive = true) BigDecimal totalAmount,
		@DecimalMin(value = "0", inclusive = true) BigDecimal paidAmount, LocalDate dueDate, String notes) {
}
