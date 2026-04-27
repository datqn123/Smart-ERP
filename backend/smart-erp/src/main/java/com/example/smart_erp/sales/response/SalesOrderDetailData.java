package com.example.smart_erp.sales.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record SalesOrderDetailData(int id, String orderCode, int customerId, String customerName,
		BigDecimal totalAmount, BigDecimal discountAmount, BigDecimal finalAmount, String status, String orderChannel,
		String paymentStatus, Integer parentOrderId, Integer refSalesOrderId, String shippingAddress, String notes,
		String posShiftRef, Integer voucherId, String voucherCode, Instant cancelledAt, Integer cancelledBy,
		Instant createdAt, Instant updatedAt, List<SalesOrderLineDetailData> lines) {
}
