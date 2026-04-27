package com.example.smart_erp.catalog.response;

import java.math.BigDecimal;
import java.time.Instant;

/** Task048–051 — một dòng khách hàng + read-model đơn (SRS). */
public record CustomerData(
		int id,
		String customerCode,
		String name,
		String phone,
		String email,
		String address,
		int loyaltyPoints,
		BigDecimal totalSpent,
		long orderCount,
		String status,
		Instant createdAt,
		Instant updatedAt) {
}
