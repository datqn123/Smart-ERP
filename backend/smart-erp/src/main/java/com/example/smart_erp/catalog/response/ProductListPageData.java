package com.example.smart_erp.catalog.response;

import java.util.List;

public record ProductListPageData(List<ProductListItemData> items, int page, int limit, long total) {
}
