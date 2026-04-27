package com.example.smart_erp.catalog.response;

import java.util.List;

public record CustomerListPageData(List<CustomerData> items, int page, int limit, long total) {
}
