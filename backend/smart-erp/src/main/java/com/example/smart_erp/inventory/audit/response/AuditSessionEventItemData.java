package com.example.smart_erp.inventory.audit.response;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonProperty;

/** Một dòng timeline — OQ-13 / Task023 mở rộng. */
public record AuditSessionEventItemData(
		@JsonProperty("id") long id,
		@JsonProperty("eventType") String eventType,
		@JsonProperty("payload") String payloadJson,
		@JsonProperty("createdBy") int createdBy,
		@JsonProperty("createdAt") Instant createdAt) {
}
