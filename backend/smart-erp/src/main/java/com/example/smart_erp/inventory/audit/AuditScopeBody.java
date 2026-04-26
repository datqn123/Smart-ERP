package com.example.smart_erp.inventory.audit;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;

@JsonIgnoreProperties(ignoreUnknown = false)
public record AuditScopeBody(
		@JsonProperty("mode") @NotBlank String mode,
		@JsonProperty("locationIds") List<Integer> locationIds,
		@JsonProperty("categoryId") Integer categoryId,
		@JsonProperty("inventoryIds") List<Integer> inventoryIds) {
}
