package com.example.smart_erp.finance.cashtx.response;

import java.util.List;

/**
 * SRS Task064 — phân trang danh sách thu chi.
 */
public record CashTransactionPageData(List<CashTransactionItemData> items, int page, int limit, long total) {
}
