package com.example.smart_erp.auth.web;

import jakarta.validation.constraints.NotBlank;

/**
 * Task003 — không {@code String#strip} refresh (tránh đổi nghĩa chuỗi), giống {@link LogoutRequest}.
 */
public record RefreshRequest(@NotBlank(message = "Refresh token là bắt buộc") String refreshToken) {
}
