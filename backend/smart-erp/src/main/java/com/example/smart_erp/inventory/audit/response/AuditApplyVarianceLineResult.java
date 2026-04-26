package com.example.smart_erp.inventory.audit.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AuditApplyVarianceLineResult(
		@JsonProperty("lineId") long lineId,
		@JsonProperty("inventoryId") long inventoryId,
		@JsonProperty("deltaQty") int deltaQty,
		@JsonProperty("quantityAfter") int quantityAfter) {
}
