package com.example.smart_erp.inventory.audit.response;

import java.time.Instant;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

/** Một dòng list đợt kiểm kê — Task021 §6. */
public record AuditSessionListItemData(
		@JsonProperty("id") long id,
		@JsonProperty("auditCode") String auditCode,
		@JsonProperty("title") String title,
		@JsonProperty("auditDate") LocalDate auditDate,
		@JsonProperty("status") String status,
		@JsonProperty("locationFilter") String locationFilter,
		@JsonProperty("categoryFilter") String categoryFilter,
		@JsonProperty("createdBy") int createdBy,
		@JsonProperty("createdByName") String createdByName,
		@JsonProperty("completedAt") Instant completedAt,
		@JsonProperty("completedByName") String completedByName,
		@JsonProperty("createdAt") Instant createdAt,
		@JsonProperty("updatedAt") Instant updatedAt,
		@JsonProperty("totalLines") int totalLines,
		@JsonProperty("countedLines") int countedLines,
		@JsonProperty("varianceLines") int varianceLines) {
}
