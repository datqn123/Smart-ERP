package com.example.smart_erp.auth.support;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.example.smart_erp.config.AppSecurityProperties;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtTokenService {

	private static final int ACCESS_TTL_MINUTES = 5;

	private final SecretKey signingKey;
	private final AppSecurityProperties.Jwt jwtProps;

	public JwtTokenService(AppSecurityProperties props) {
		byte[] bytes = props.getJwt().getSecret().getBytes(StandardCharsets.UTF_8);
		if (bytes.length < 32) {
			throw new IllegalStateException(
					"app.security.jwt.secret (JWT_SECRET) must be UTF-8 with byte length >= 32 for HS256 (Task001).");
		}
		this.signingKey = Keys.hmacShaKeyFor(bytes);
		this.jwtProps = props.getJwt();
	}

	public String createAccessToken(int userId, String username, String roleName) {
		Instant now = Instant.now();
		Instant exp = now.plusSeconds(ACCESS_TTL_MINUTES * 60L);
		var builder = Jwts.builder()
				.subject(String.valueOf(userId))
				.claim("name", username)
				.claim("role", roleName)
				.issuedAt(Date.from(now))
				.expiration(Date.from(exp))
				.signWith(signingKey);
		if (StringUtils.hasText(jwtProps.getIssuer())) {
			builder.issuer(jwtProps.getIssuer().trim());
		}
		if (StringUtils.hasText(jwtProps.getAudience())) {
			builder.claim("aud", jwtProps.getAudience().trim());
		}
		return builder.compact();
	}
}
