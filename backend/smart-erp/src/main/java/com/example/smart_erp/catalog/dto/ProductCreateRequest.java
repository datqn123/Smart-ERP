package com.example.smart_erp.catalog.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Task035 POST /api/v1/products
 */
public record ProductCreateRequest(@NotBlank @Size(max = 50) String skuCode, @Size(max = 100) String barcode,
		@NotBlank @Size(max = 255) String name, Integer categoryId, String description,
		@DecimalMin(value = "0", inclusive = true) BigDecimal weight, @Size(max = 20) String status,
		@Size(max = 500) String imageUrl, @NotBlank @Size(max = 50) String baseUnitName,
		@NotNull @DecimalMin(value = "0", inclusive = true) BigDecimal costPrice,
		@NotNull @DecimalMin(value = "0", inclusive = true) BigDecimal salePrice, String priceEffectiveDate) {
}
