package com.example.smart_erp.inventory.dispatch;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record StockDispatchFromOrderLineRequest(@Positive long inventoryId, @Positive int quantity,
		@NotNull BigDecimal unitPriceSnapshot) {
}
