package com.example.smart_erp.inventory.dispatch;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StockDispatchCreateRequest(
		@NotNull LocalDate dispatchDate,
		@Size(max = 255) String referenceLabel,
		@Size(max = 2000) String notes,
		@NotEmpty @Valid List<StockDispatchLineRequest> lines) {
}
