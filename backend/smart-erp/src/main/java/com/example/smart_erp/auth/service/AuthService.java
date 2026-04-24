package com.example.smart_erp.auth.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.smart_erp.auth.persistence.RefreshToken;
import com.example.smart_erp.auth.persistence.RefreshTokenRepository;
import com.example.smart_erp.auth.persistence.SystemLogJdbcRepository;
import com.example.smart_erp.auth.persistence.User;
import com.example.smart_erp.auth.persistence.UserRepository;
import com.example.smart_erp.auth.session.LoginBruteForceProtection;
import com.example.smart_erp.auth.session.LoginSessionRegistry;
import com.example.smart_erp.auth.support.JwtTokenService;
import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;

@Service
public class AuthService {

	private static final int REFRESH_TTL_DAYS = 30;

	private static final String UNAUTHORIZED_LOGIN = "Email hoặc mật khẩu không chính xác hoặc tài khoản bị khóa";

	private static final String FORBIDDEN_LOGOUT_REFRESH = "Refresh token không khớp với phiên đăng nhập hiện tại";

	private final UserRepository userRepository;
	private final RefreshTokenRepository refreshTokenRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtTokenService jwtTokenService;
	private final SystemLogJdbcRepository systemLogJdbcRepository;
	private final LoginSessionRegistry loginSessionRegistry;
	private final LoginBruteForceProtection loginBruteForceProtection;

	public AuthService(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository,
			PasswordEncoder passwordEncoder, JwtTokenService jwtTokenService,
			SystemLogJdbcRepository systemLogJdbcRepository, LoginSessionRegistry loginSessionRegistry,
			LoginBruteForceProtection loginBruteForceProtection) {
		this.userRepository = userRepository;
		this.refreshTokenRepository = refreshTokenRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtTokenService = jwtTokenService;
		this.systemLogJdbcRepository = systemLogJdbcRepository;
		this.loginSessionRegistry = loginSessionRegistry;
		this.loginBruteForceProtection = loginBruteForceProtection;
	}

	@Transactional
	public LoginResult login(String email, String password) {
		String emailNorm = email.strip();

		if (userRepository.countActiveByEmailIgnoreCase(emailNorm) == 0) {
			throw new BusinessException(ApiErrorCode.UNAUTHORIZED, UNAUTHORIZED_LOGIN);
		}

		User user = userRepository.findActiveByEmailIgnoreCase(emailNorm)
				.orElseThrow(() -> new BusinessException(ApiErrorCode.UNAUTHORIZED, UNAUTHORIZED_LOGIN));

		loginSessionRegistry.assertNoConcurrentSession(user.getId());

		if (!passwordEncoder.matches(password, user.getPasswordHash())) {
			loginBruteForceProtection.onFailure(user.getId(), userRepository);
			throw new BusinessException(ApiErrorCode.UNAUTHORIZED, UNAUTHORIZED_LOGIN);
		}

		loginBruteForceProtection.onSuccess(user.getId());

		String roleName = user.getRole() != null ? user.getRole().getName() : "Unknown";
		String accessToken = jwtTokenService.createAccessToken(user.getId(), user.getUsername(), roleName);
		String refreshPlain = UUID.randomUUID().toString().replace("-", "");
		Instant refreshExp = Instant.now().plus(REFRESH_TTL_DAYS, ChronoUnit.DAYS);
		refreshTokenRepository.save(new RefreshToken(user.getId(), refreshPlain, refreshExp));

		user.setLastLogin(Instant.now());
		userRepository.save(user);

		systemLogJdbcRepository.insertAuthLoginSuccess(user.getId());
		loginSessionRegistry.register(user.getId(), accessToken);

		LoginResult.LoginUserDto dto = new LoginResult.LoginUserDto(user.getId(), user.getUsername(), user.getFullName(),
				user.getEmail(), roleName);
		return new LoginResult(accessToken, refreshPlain, dto);
	}

	/**
	 * Task002: soft revoke refresh + audit. Registry phiên gỡ ở controller sau khi transaction commit.
	 */
	@Transactional
	public void logout(int userIdFromJwt, String refreshToken) {
		Instant now = Instant.now();
		int updated = refreshTokenRepository.softRevoke(userIdFromJwt, refreshToken, now);
		if (updated == 0) {
			throw new BusinessException(ApiErrorCode.FORBIDDEN, FORBIDDEN_LOGOUT_REFRESH);
		}
		systemLogJdbcRepository.insertAuthLogout(userIdFromJwt);
	}
}
