package com.example.smart_erp.catalog.dto;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/** Task047 POST /api/v1/suppliers/bulk-delete — tối đa 50 id (SRS §8.1). */
public record SuppliersBulkDeleteRequest(
		@NotEmpty @Size(min = 1, max = 50) List<@Positive Integer> ids) {
}
