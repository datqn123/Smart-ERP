package com.example.smart_erp.sales.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record RetailCheckoutRequest(Integer customerId, Boolean walkIn, @NotEmpty @Valid List<SalesOrderLineRequest> lines,
		BigDecimal discountAmount, @Size(max = 50) String voucherCode, String paymentStatus, @Size(max = 1000) String notes,
		@Size(max = 100) String shiftReference) {
}
