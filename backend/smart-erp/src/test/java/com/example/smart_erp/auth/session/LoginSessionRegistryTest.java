package com.example.smart_erp.auth.session;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import com.example.smart_erp.auth.support.JwtTokenService;
import com.example.smart_erp.common.exception.BusinessException;

@ExtendWith(MockitoExtension.class)
class LoginSessionRegistryTest {

	@Mock
	private JwtTokenService jwtTokenService;

	@Mock
	private StringRedisTemplate redis;

	@Mock
	private ValueOperations<String, String> values;

	private LoginSessionRegistry registry;

	@BeforeEach
	void setUp() {
		when(redis.opsForValue()).thenReturn(values);
		when(jwtTokenService.getAccessTtlSeconds()).thenReturn(60L);
		registry = new LoginSessionRegistry(jwtTokenService, redis);
	}

	@Test
	void assertNoConcurrentSession_prunesStaleTokenAndAllowsSecondLogin() {
		when(jwtTokenService.isAccessTokenActiveForSessionMap("old.jwt")).thenReturn(false);
		when(values.get("auth:session:1")).thenReturn("old.jwt");
		registry.register(1, "old.jwt");
		assertDoesNotThrow(() -> registry.assertNoConcurrentSession(1));
	}

	@Test
	void assertNoConcurrentSession_blocksWhenTokenStillActive() {
		when(jwtTokenService.isAccessTokenActiveForSessionMap("live.jwt")).thenReturn(true);
		when(values.get("auth:session:2")).thenReturn("live.jwt");
		registry.register(2, "live.jwt");
		assertThrows(BusinessException.class, () -> registry.assertNoConcurrentSession(2));
	}
}
