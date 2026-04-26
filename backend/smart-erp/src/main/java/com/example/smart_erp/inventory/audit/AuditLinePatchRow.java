package com.example.smart_erp.inventory.audit;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

@JsonIgnoreProperties(ignoreUnknown = false)
public record AuditLinePatchRow(
		@JsonProperty("lineId") @NotNull @Positive Long lineId,
		@JsonProperty("actualQuantity") @NotNull @DecimalMin(value = "0", inclusive = true) BigDecimal actualQuantity,
		@JsonProperty("notes") @Size(max = 500) String notes) {
}
