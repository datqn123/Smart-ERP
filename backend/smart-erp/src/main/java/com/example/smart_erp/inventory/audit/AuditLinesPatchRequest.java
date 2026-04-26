package com.example.smart_erp.inventory.audit;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

@JsonIgnoreProperties(ignoreUnknown = false)
public record AuditLinesPatchRequest(
		@JsonProperty("lines") @NotNull @NotEmpty @Valid List<AuditLinePatchRow> lines) {
}
