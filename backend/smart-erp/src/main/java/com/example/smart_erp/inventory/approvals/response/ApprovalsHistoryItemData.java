package com.example.smart_erp.inventory.approvals.response;

import java.math.BigDecimal;
import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ApprovalsHistoryItemData(
		@JsonProperty("entityType") String entityType,
		@JsonProperty("entityId") long entityId,
		@JsonProperty("transactionCode") String transactionCode,
		@JsonProperty("type") String type,
		@JsonProperty("creatorName") String creatorName,
		@JsonProperty("date") Instant date,
		@JsonProperty("reviewedAt") Instant reviewedAt,
		@JsonProperty("totalAmount") BigDecimal totalAmount,
		@JsonProperty("resolution") String resolution,
		@JsonProperty("rejectionReason") String rejectionReason,
		@JsonProperty("notes") String notes,
		@JsonProperty("reviewedByUserId") Integer reviewedByUserId,
		@JsonProperty("reviewerName") String reviewerName,
		@JsonProperty("approvedByUserId") Integer approvedByUserId,
		@JsonProperty("approvedAt") Instant approvedAt) {
}
