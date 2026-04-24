package com.example.smart_erp.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.smart_erp.auth.persistence.RefreshToken;
import com.example.smart_erp.auth.persistence.RefreshTokenRepository;
import com.example.smart_erp.auth.persistence.Role;
import com.example.smart_erp.auth.persistence.SystemLogJdbcRepository;
import com.example.smart_erp.auth.persistence.User;
import com.example.smart_erp.auth.persistence.UserRepository;
import com.example.smart_erp.auth.session.LoginBruteForceProtection;
import com.example.smart_erp.auth.session.LoginSessionRegistry;
import com.example.smart_erp.auth.session.RefreshAccessThrottle;
import com.example.smart_erp.auth.support.JwtTokenService;
import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class AuthServiceRefreshTest {

	@Mock
	private UserRepository userRepository;

	@Mock
	private RefreshTokenRepository refreshTokenRepository;

	@Mock
	private PasswordEncoder passwordEncoder;

	@Mock
	private JwtTokenService jwtTokenService;

	@Mock
	private SystemLogJdbcRepository systemLogJdbcRepository;

	@Mock
	private LoginSessionRegistry loginSessionRegistry;

	@Mock
	private LoginBruteForceProtection loginBruteForceProtection;

	private final RefreshAccessThrottle refreshAccessThrottle = new RefreshAccessThrottle();

	private AuthService authService;

	@BeforeEach
	void setUp() {
		authService = new AuthService(userRepository, refreshTokenRepository, passwordEncoder, jwtTokenService,
				systemLogJdbcRepository, loginSessionRegistry, loginBruteForceProtection, refreshAccessThrottle);
	}

	@Test
	void refresh_returnsNewAccessAndSameRefreshPlain() {
		String plain = "refreshplainvalue";
		Instant exp = Instant.now().plusSeconds(3600);
		when(refreshTokenRepository.findValidByToken(eq(plain), any(Instant.class)))
				.thenReturn(Optional.of(new RefreshToken(7, plain, exp)));
		User user = activeUser(7);
		when(userRepository.findActiveById(7)).thenReturn(Optional.of(user));
		when(jwtTokenService.createAccessToken(7, "admin", "Owner")).thenReturn("new.access.jwt");

		RefreshResult r = authService.refresh(plain);

		assertThat(r.accessToken()).isEqualTo("new.access.jwt");
		assertThat(r.refreshTokenPlain()).isEqualTo(plain);
		assertThat(r.userId()).isEqualTo(7);
	}

	@Test
	void refresh_throws401WhenNoValidRow() {
		when(refreshTokenRepository.findValidByToken(anyString(), any(Instant.class))).thenReturn(Optional.empty());

		assertThatThrownBy(() -> authService.refresh("unknown")).isInstanceOfSatisfying(BusinessException.class,
				ex -> assertThat(ex.getCode()).isEqualTo(ApiErrorCode.UNAUTHORIZED));
	}

	@Test
	void refresh_throws401WhenUserNotActive() {
		String plain = "t";
		when(refreshTokenRepository.findValidByToken(eq(plain), any(Instant.class)))
				.thenReturn(Optional.of(new RefreshToken(1, plain, Instant.now().plusSeconds(10))));
		when(userRepository.findActiveById(1)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> authService.refresh(plain)).isInstanceOfSatisfying(BusinessException.class,
				ex -> assertThat(ex.getCode()).isEqualTo(ApiErrorCode.UNAUTHORIZED));
	}

	@Test
	void refresh_secondCallWithinWindow_is429() {
		String plain = "same";
		Instant exp = Instant.now().plusSeconds(3600);
		when(refreshTokenRepository.findValidByToken(eq(plain), any(Instant.class)))
				.thenReturn(Optional.of(new RefreshToken(2, plain, exp)));
		User user = activeUser(2);
		when(userRepository.findActiveById(2)).thenReturn(Optional.of(user));
		when(jwtTokenService.createAccessToken(anyInt(), anyString(), anyString())).thenReturn("jwt1", "jwt2");

		authService.refresh(plain);

		assertThatThrownBy(() -> authService.refresh(plain)).isInstanceOfSatisfying(BusinessException.class,
				ex -> assertThat(ex.getCode()).isEqualTo(ApiErrorCode.TOO_MANY_REQUESTS));
	}

	private static User activeUser(int id) {
		User u = new User();
		ReflectionTestUtils.setField(u, "id", id);
		ReflectionTestUtils.setField(u, "username", "admin");
		ReflectionTestUtils.setField(u, "status", "Active");
		Role role = new Role();
		ReflectionTestUtils.setField(role, "name", "Owner");
		ReflectionTestUtils.setField(u, "role", role);
		return u;
	}
}
