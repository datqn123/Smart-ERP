package com.example.smart_erp.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Task043 POST /api/v1/suppliers — OQ-5(a): contactPerson bắt buộc non-blank. */
public record SupplierCreateRequest(
		@NotBlank @Size(max = 50) String supplierCode,
		@NotBlank @Size(max = 255) String name,
		@NotBlank @Size(max = 255) String contactPerson,
		@NotBlank @Size(max = 20) String phone,
		String email,
		String address,
		String taxCode,
		String status) {
}
