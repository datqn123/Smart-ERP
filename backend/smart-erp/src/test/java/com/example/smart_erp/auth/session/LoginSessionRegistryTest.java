package com.example.smart_erp.auth.session;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.smart_erp.auth.support.JwtTokenService;
import com.example.smart_erp.common.exception.BusinessException;

@ExtendWith(MockitoExtension.class)
class LoginSessionRegistryTest {

	@Mock
	private JwtTokenService jwtTokenService;

	private LoginSessionRegistry registry;

	@BeforeEach
	void setUp() {
		registry = new LoginSessionRegistry(jwtTokenService);
	}

	@Test
	void assertNoConcurrentSession_prunesStaleTokenAndAllowsSecondLogin() {
		when(jwtTokenService.isAccessTokenActiveForSessionMap("old.jwt")).thenReturn(false);
		registry.register(1, "old.jwt");
		assertDoesNotThrow(() -> registry.assertNoConcurrentSession(1));
	}

	@Test
	void assertNoConcurrentSession_blocksWhenTokenStillActive() {
		when(jwtTokenService.isAccessTokenActiveForSessionMap("live.jwt")).thenReturn(true);
		registry.register(2, "live.jwt");
		assertThrows(BusinessException.class, () -> registry.assertNoConcurrentSession(2));
	}
}
