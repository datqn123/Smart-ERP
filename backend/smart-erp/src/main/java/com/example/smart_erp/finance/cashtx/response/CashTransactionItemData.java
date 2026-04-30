package com.example.smart_erp.finance.cashtx.response;

import java.math.BigDecimal;
import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * SRS Task064–066 §8 — một dòng giao dịch thu chi (camelCase JSON).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record CashTransactionItemData(long id, String transactionCode, String direction, BigDecimal amount, String category,
		String description, String paymentMethod, String status, String transactionDate, Long financeLedgerId, int createdBy,
		String createdByName, int performedBy, String performedByName, Instant createdAt, Instant updatedAt) {
}
