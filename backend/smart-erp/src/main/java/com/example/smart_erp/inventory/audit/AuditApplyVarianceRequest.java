package com.example.smart_erp.inventory.audit;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@JsonIgnoreProperties(ignoreUnknown = false)
public record AuditApplyVarianceRequest(
		@JsonProperty("reason") @NotBlank @Size(min = 1, max = 500) String reason,
		@JsonProperty("mode") @Pattern(regexp = "^(delta|set_actual)$") String mode) {
	public String modeOrDefault() {
		return mode == null || mode.isBlank() ? "delta" : mode;
	}
}
