package com.example.smart_erp.inventory.audit;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = false)
public record AuditSessionCompleteRequest(
		@JsonProperty("requireAllCounted") Boolean requireAllCounted) {
	public boolean requireAllCountedOrDefault() {
		return requireAllCounted == null || requireAllCounted;
	}
}
