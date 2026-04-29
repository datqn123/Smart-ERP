package com.example.smart_erp.finance.ledger.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record FinanceLedgerItemData(long id, LocalDate date, String transactionCode, String description,
		String transactionType, String referenceType, Integer referenceId, BigDecimal amount, BigDecimal debit,
		BigDecimal credit, BigDecimal balance) {
}

