package com.example.smart_erp.finance.ledger.response;

import java.util.List;

public record FinanceLedgerPageData(List<FinanceLedgerItemData> items, int page, int limit, long total) {
}

