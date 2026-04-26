package com.example.smart_erp.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryCreateRequest(@NotBlank @Size(max = 50) String categoryCode, @NotBlank @Size(max = 255) String name,
		String description, Long parentId, Integer sortOrder, String status) {
}
