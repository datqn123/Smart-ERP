package com.example.smart_erp.inventory.approvals.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ApprovalsHistoryPageData(
		@JsonProperty("items") List<ApprovalsHistoryItemData> items,
		@JsonProperty("page") int page,
		@JsonProperty("limit") int limit,
		@JsonProperty("total") long total) {
}
