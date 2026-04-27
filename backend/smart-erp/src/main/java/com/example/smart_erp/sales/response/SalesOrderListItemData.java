package com.example.smart_erp.sales.response;

import java.math.BigDecimal;
import java.time.Instant;

public record SalesOrderListItemData(int id, String orderCode, int customerId, String customerName,
		BigDecimal totalAmount, BigDecimal discountAmount, BigDecimal finalAmount, String status, String orderChannel,
		String paymentStatus, int itemsCount, String notes, Instant createdAt, Instant updatedAt) {
}
