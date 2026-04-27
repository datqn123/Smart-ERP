package com.example.smart_erp.catalog.dto;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/** Task041 POST /api/v1/products/bulk-delete */
public record ProductsBulkDeleteRequest(
		@NotEmpty @Size(min = 1, max = 100) List<@Positive Integer> ids) {
}
