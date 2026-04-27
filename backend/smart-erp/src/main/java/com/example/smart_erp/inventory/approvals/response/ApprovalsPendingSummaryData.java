package com.example.smart_erp.inventory.approvals.response;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

/** {@code data.summary} — Task061. */
public record ApprovalsPendingSummaryData(
		@JsonProperty("totalPending") long totalPending,
		@JsonProperty("byType") Map<String, Long> byType) {
}
