package com.example.smart_erp.inventory.audit.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AuditApplyVarianceData(
		@JsonProperty("sessionId") long sessionId,
		@JsonProperty("appliedLines") List<AuditApplyVarianceLineResult> appliedLines) {
}
