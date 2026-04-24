package com.example.smart_erp.auth.persistence;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "user_id", nullable = false)
	private Integer userId;

	@Column(nullable = false, length = 64, unique = true)
	private String token;

	@Column(name = "expires_at", nullable = false)
	private Instant expiresAt;

	public RefreshToken() {
	}

	public RefreshToken(Integer userId, String token, Instant expiresAt) {
		this.userId = userId;
		this.token = token;
		this.expiresAt = expiresAt;
	}
}
