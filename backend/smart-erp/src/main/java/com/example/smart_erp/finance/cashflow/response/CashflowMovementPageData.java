package com.example.smart_erp.finance.cashflow.response;

import java.util.List;

public record CashflowMovementPageData(List<CashflowMovementItemData> items, int page, int limit, long total,
		CashflowMovementSummaryData summary) {
}
