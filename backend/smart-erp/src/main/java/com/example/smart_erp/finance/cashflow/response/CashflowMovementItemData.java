package com.example.smart_erp.finance.cashflow.response;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * PRD — một dòng dòng tiền thống nhất (ledger hoặc phiếu thủ công pending/cancelled).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record CashflowMovementItemData(String id, String sourceKind, String transactionDate, BigDecimal amount, String direction,
		String description, String referenceType, Integer referenceId, Integer fundId, String fundCode, Long cashTransactionId,
		String status, String category) {
}
