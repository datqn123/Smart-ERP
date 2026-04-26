package com.example.smart_erp.inventory.audit;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@JsonIgnoreProperties(ignoreUnknown = false)
public record AuditSessionCancelRequest(
		@JsonProperty("cancelReason") @NotBlank @Size(max = 1000) String cancelReason) {
}
