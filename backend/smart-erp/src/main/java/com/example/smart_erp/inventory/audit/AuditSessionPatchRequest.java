package com.example.smart_erp.inventory.audit;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Size;

@JsonIgnoreProperties(ignoreUnknown = false)
public record AuditSessionPatchRequest(
		@JsonProperty("title") @Size(min = 1, max = 255) String title,
		@JsonProperty("notes") @Size(max = 2000) String notes,
		@JsonProperty("status") String status) {
}
