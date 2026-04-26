package com.example.smart_erp.inventory.audit.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AuditSessionListPageData(
		@JsonProperty("items") List<AuditSessionListItemData> items,
		@JsonProperty("page") int page,
		@JsonProperty("limit") int limit,
		@JsonProperty("total") long total) {
}
