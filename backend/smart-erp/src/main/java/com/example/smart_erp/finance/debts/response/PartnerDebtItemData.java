package com.example.smart_erp.finance.debts.response;

import java.math.BigDecimal;
import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * SRS Task069–071 — một dòng sổ nợ (camelCase JSON).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PartnerDebtItemData(long id, String debtCode, String partnerType, Long customerId, Long supplierId, String partnerName,
		BigDecimal totalAmount, BigDecimal paidAmount, BigDecimal remainingAmount, String dueDate, String status, String notes,
		Instant createdAt, Instant updatedAt) {
}
