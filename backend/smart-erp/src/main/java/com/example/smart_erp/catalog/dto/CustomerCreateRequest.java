package com.example.smart_erp.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerCreateRequest(
		@NotBlank @Size(max = 50) String customerCode,
		@NotBlank @Size(max = 255) String name,
		@NotBlank @Size(max = 20) String phone,
		String email,
		String address,
		String status) {
}
