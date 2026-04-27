package com.example.smart_erp.catalog.response;

import java.util.List;

public record SupplierListPageData(List<SupplierListItemData> items, int page, int limit, long total) {
}
