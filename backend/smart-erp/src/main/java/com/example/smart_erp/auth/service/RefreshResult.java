package com.example.smart_erp.auth.service;

/**
 * Kết quả {@link AuthService#refresh(String)} — không rotation: {@code refreshTokenPlain} trùng input.
 */
public record RefreshResult(String accessToken, String refreshTokenPlain, int userId) {
}
