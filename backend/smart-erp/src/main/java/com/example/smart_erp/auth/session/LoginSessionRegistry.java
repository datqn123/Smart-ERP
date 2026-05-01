package com.example.smart_erp.auth.session;

import java.time.Duration;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import com.example.smart_erp.auth.support.JwtTokenService;
import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;

/**
 * Phiên đăng nhập tại thời điểm (Task001): lưu trong Redis để dùng chung giữa nhiều instance.
 * Chính sách: <strong>chặn</strong> đăng nhập thứ hai (403), không ghi đè phiên.
 * <p>
 * Task100: nếu entry Redis trỏ tới access JWT <strong>đã hết hạn</strong> hoặc không còn verify được →
 * <strong>gỡ entry</strong> (stale), không 403 oán.
 */
@Component
@SuppressWarnings("null")
public class LoginSessionRegistry {

	private static final String KEY_PREFIX = "auth:session:";

	private final JwtTokenService jwtTokenService;
	private final StringRedisTemplate redis;

	public LoginSessionRegistry(JwtTokenService jwtTokenService, StringRedisTemplate redis) {
		this.jwtTokenService = jwtTokenService;
		this.redis = redis;
	}

	public void assertNoConcurrentSession(Integer userId) {
		String existing = redis.opsForValue().get(key(userId));
		if (existing == null) {
			return;
		}
		if (!jwtTokenService.isAccessTokenActiveForSessionMap(existing)) {
			redis.delete(key(userId));
			return;
		}
		throw new BusinessException(ApiErrorCode.FORBIDDEN,
				"Tài khoản đang được đăng nhập ở một thiết bị khác. Vui lòng đăng xuất ở thiết bị đó hoặc liên hệ Admin.");
	}

	public void register(Integer userId, String accessToken) {
		long ttlSeconds = Math.max(60L, jwtTokenService.getAccessTtlSeconds());
		redis.opsForValue().set(key(userId), accessToken, Duration.ofSeconds(ttlSeconds));
	}

	/** Dùng cho test / logout (Task002). */
	public void clear(Integer userId) {
		redis.delete(key(userId));
	}

	private static String key(Integer userId) {
		return KEY_PREFIX + userId;
	}
}
