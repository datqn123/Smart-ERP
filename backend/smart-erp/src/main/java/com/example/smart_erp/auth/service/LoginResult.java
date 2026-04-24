package com.example.smart_erp.auth.service;

public record LoginResult(String accessToken, String refreshToken, LoginUserDto user) {

	public record LoginUserDto(int id, String username, String fullName, String email, String role) {
	}
}
