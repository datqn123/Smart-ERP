package com.example.smart_erp.catalog.dto;

import org.hibernate.validator.constraints.URL;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Task039 JSON body: {@code url} maps to DB {@code productimages.image_url}.
 */
public record ProductImageCreateRequest(@NotBlank @URL @Size(max = 500) String url, @Min(0) Integer sortOrder,
		Boolean isPrimary) {

	public ProductImageCreateRequest {
		if (sortOrder == null) {
			sortOrder = 0;
		}
		if (isPrimary == null) {
			isPrimary = false;
		}
	}

	public int sortOrderValue() {
		return sortOrder;
	}

	public boolean primaryFlag() {
		return isPrimary;
	}
}
