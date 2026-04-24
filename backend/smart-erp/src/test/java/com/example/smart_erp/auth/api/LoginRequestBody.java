package com.example.smart_erp.auth.api;

/**
 * Mirrors Task001 login request JSON until production DTO exists under {@code main}.
 */
public record LoginRequestBody(String email, String password) {
}
