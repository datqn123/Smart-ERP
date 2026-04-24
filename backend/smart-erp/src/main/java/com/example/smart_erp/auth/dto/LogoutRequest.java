package com.example.smart_erp.auth.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Task002 logout — không {@code strip} refresh token (tránh đổi nghĩa chuỗi người dùng cố ý).
 */
public record LogoutRequest(
		@NotBlank(message = "Refresh token là bắt buộc để đăng xuất an toàn") String refreshToken) {
}
