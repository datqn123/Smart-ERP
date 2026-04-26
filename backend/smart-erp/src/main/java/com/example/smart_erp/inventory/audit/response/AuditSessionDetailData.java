package com.example.smart_erp.inventory.audit.response;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

/** Chi tiết đợt + dòng — Task023. */
public record AuditSessionDetailData(
		@JsonProperty("id") long id,
		@JsonProperty("auditCode") String auditCode,
		@JsonProperty("title") String title,
		@JsonProperty("auditDate") LocalDate auditDate,
		@JsonProperty("status") String status,
		@JsonProperty("locationFilter") String locationFilter,
		@JsonProperty("categoryFilter") String categoryFilter,
		@JsonProperty("notes") String notes,
		@JsonProperty("createdBy") int createdBy,
		@JsonProperty("createdByName") String createdByName,
		@JsonProperty("completedAt") Instant completedAt,
		@JsonProperty("completedByName") String completedByName,
		@JsonProperty("cancelReason") String cancelReason,
		@JsonProperty("createdAt") Instant createdAt,
		@JsonProperty("updatedAt") Instant updatedAt,
		@JsonProperty("items") List<AuditSessionLineItemData> items) {
}
