package com.example.smart_erp.sales.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record VoucherListItemData(int id, String code, String name, String discountType, BigDecimal discountValue,
		LocalDate validFrom, LocalDate validTo, boolean isActive, int usedCount, Integer maxUses, Instant createdAt) {
}
