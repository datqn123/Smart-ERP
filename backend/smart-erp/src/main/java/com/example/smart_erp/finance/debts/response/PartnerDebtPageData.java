package com.example.smart_erp.finance.debts.response;

import java.util.List;

/**
 * SRS Task069 — phân trang danh sách nợ.
 */
public record PartnerDebtPageData(List<PartnerDebtItemData> items, int page, int limit, long total) {
}
