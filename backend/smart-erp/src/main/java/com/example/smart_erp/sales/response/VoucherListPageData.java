package com.example.smart_erp.sales.response;

import java.util.List;

public record VoucherListPageData(List<VoucherListItemData> items, int page, int limit, long total) {
}
