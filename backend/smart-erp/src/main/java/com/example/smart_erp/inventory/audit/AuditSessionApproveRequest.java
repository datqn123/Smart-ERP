package com.example.smart_erp.inventory.audit;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Size;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AuditSessionApproveRequest(
		@JsonProperty("notes") @Size(max = 500) String notes) {
}
