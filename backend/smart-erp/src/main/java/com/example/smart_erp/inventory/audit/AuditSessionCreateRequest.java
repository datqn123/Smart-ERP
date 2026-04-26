package com.example.smart_erp.inventory.audit;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@JsonIgnoreProperties(ignoreUnknown = false)
public record AuditSessionCreateRequest(
		@JsonProperty("title") @NotNull @Size(min = 1, max = 255) String title,
		@JsonProperty("auditDate") @NotNull @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$") String auditDate,
		@JsonProperty("notes") @Size(max = 2000) String notes,
		@JsonProperty("scope") @NotNull @Valid AuditScopeBody scope) {
}
