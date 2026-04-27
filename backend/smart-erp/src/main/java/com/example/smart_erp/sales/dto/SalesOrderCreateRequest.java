package com.example.smart_erp.sales.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SalesOrderCreateRequest(@NotBlank String orderChannel, @NotNull @Positive Integer customerId,
		BigDecimal discountAmount, String shippingAddress, String notes, String paymentStatus, String status,
		Integer refSalesOrderId, @NotEmpty @Valid List<SalesOrderLineRequest> lines) {
}
