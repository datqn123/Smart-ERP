package com.example.smart_erp.catalog.response;

import java.time.Instant;
import java.util.List;

public record CategoryDetailData(long id, String categoryCode, String name, String description, Long parentId,
		String parentName, int sortOrder, String status, long productCount, Instant createdAt, Instant updatedAt,
		List<CategoryBreadcrumbItemData> breadcrumb) {
}
