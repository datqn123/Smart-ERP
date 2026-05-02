package com.example.smart_erp.finance.cashflow.response;

import java.math.BigDecimal;

public record CashflowMovementSummaryData(BigDecimal totalIncome, BigDecimal totalExpense, BigDecimal net) {
}
