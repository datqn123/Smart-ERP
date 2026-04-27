package com.example.smart_erp.catalog.dto;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/** Task053 — payload có thể trùng; validate dedupe + max 50 unique ở service (SRS OQ-5(b)). */
public record CustomersBulkDeleteRequest(
		@NotEmpty @Size(max = 200) List<@Positive Integer> ids) {
}
