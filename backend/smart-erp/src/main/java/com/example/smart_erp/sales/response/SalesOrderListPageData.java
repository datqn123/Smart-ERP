package com.example.smart_erp.sales.response;

import java.util.List;

public record SalesOrderListPageData(List<SalesOrderListItemData> items, int page, int limit, long total) {
}
