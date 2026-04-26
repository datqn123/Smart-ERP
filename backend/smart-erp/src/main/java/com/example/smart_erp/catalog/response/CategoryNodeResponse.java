package com.example.smart_erp.catalog.response;

import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

public record CategoryNodeResponse(long id, String categoryCode, String name, String description, Long parentId,
		int sortOrder, String status, long productCount, Instant createdAt, Instant updatedAt,
		@JsonInclude(JsonInclude.Include.NON_NULL) List<CategoryNodeResponse> children) {
}
