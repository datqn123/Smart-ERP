package com.example.smart_erp.inventory.dispatch;

import java.math.BigDecimal;

import jakarta.validation.constraints.Positive;

public record StockDispatchLineRequest(
		@Positive long inventoryId,
		@Positive int quantity,
		BigDecimal unitPriceSnapshot) {
}
