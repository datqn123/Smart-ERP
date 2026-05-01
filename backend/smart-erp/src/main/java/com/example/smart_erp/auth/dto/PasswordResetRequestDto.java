package com.example.smart_erp.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Task004 §1 — public; username khớp {@code users.username}.
 */
public record PasswordResetRequestDto(
		@NotBlank(message = "Vui lòng nhập tên đăng nhập") @Size(max = 100, message = "Tên đăng nhập không hợp lệ") String username,
		@Size(max = 500, message = "Ghi chú không được vượt quá 500 ký tự") String message) {

	public PasswordResetRequestDto {
		username = username == null ? null : username.strip();
		message = message == null ? null : message.strip();
		if (message != null && message.isEmpty()) {
			message = null;
		}
	}
}
