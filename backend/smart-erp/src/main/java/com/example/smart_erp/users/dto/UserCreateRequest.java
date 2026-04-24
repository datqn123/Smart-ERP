package com.example.smart_erp.users.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Body {@code POST /api/v1/users} — khớp Zod {@code UserCreateBodySchema} (Task078).
 */
public record UserCreateRequest(
		@NotBlank @Size(min = 3, max = 100) String username,
		@NotBlank @Size(min = 8, max = 128) String password,
		@NotBlank @Size(min = 1, max = 255) String fullName,
		@NotBlank @Email String email,
		@Size(max = 20) String phone,
		@Size(max = 50) String staffCode,
		@NotNull @Positive Integer roleId,
		@Pattern(regexp = "Active|Inactive") String status) {
}
