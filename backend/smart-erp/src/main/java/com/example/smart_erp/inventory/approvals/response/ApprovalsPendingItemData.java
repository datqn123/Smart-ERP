package com.example.smart_erp.inventory.approvals.response;

import java.math.BigDecimal;
import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ApprovalsPendingItemData(
		@JsonProperty("entityType") String entityType,
		@JsonProperty("entityId") long entityId,
		@JsonProperty("transactionCode") String transactionCode,
		@JsonProperty("type") String type,
		@JsonProperty("creatorName") String creatorName,
		@JsonProperty("date") Instant date,
		@JsonProperty("totalAmount") BigDecimal totalAmount,
		@JsonProperty("status") String status,
		@JsonProperty("notes") String notes) {
}
