package com.example.smart_erp.sales.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SalesOrderLineRequest(@NotNull @Positive Integer productId, @NotNull @Positive Integer unitId,
		@NotNull @Positive Integer quantity, @NotNull BigDecimal unitPrice) {
}
