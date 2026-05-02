package com.example.smart_erp.inventory.dispatch;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record StockDispatchFromOrderRequest(@Positive int orderId, @NotNull LocalDate dispatchDate,
		@Size(max = 2000) String notes,
		@NotEmpty @Valid List<StockDispatchFromOrderLineRequest> lines) {
}
