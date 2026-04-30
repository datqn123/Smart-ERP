package com.example.smart_erp.sales.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RetailVoucherPreviewRequest(Integer voucherId, @Size(max = 50) String voucherCode,
		@NotNull @NotEmpty @Valid List<SalesOrderLineRequest> lines, BigDecimal discountAmount) {
}
