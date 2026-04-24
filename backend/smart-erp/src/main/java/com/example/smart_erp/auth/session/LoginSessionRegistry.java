package com.example.smart_erp.auth.session;

import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import com.example.smart_erp.auth.support.JwtTokenService;
import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;

/**
 * Phiên đăng nhập tại thời điểm (Task001): tạm dùng {@link ConcurrentHashMap}; sau này Redis chỉ lưu access token.
 * Chính sách: <strong>chặn</strong> đăng nhập thứ hai (403), không ghi đè phiên.
 * <p>
 * Task100: nếu entry map trỏ tới access JWT <strong>đã hết hạn</strong> hoặc không còn verify được →
 * <strong>gỡ entry</strong> (stale), không 403 oán.
 */
@Component
public class LoginSessionRegistry {

	private final ConcurrentHashMap<Integer, String> userIdToAccessToken = new ConcurrentHashMap<>();

	private final JwtTokenService jwtTokenService;

	public LoginSessionRegistry(JwtTokenService jwtTokenService) {
		this.jwtTokenService = jwtTokenService;
	}

	public void assertNoConcurrentSession(Integer userId) {
		String existing = userIdToAccessToken.get(userId);
		if (existing == null) {
			return;
		}
		if (!jwtTokenService.isAccessTokenActiveForSessionMap(existing)) {
			userIdToAccessToken.remove(userId, existing);
			return;
		}
		throw new BusinessException(ApiErrorCode.FORBIDDEN,
				"Tài khoản đang được đăng nhập ở một thiết bị khác. Vui lòng đăng xuất ở thiết bị đó hoặc liên hệ Admin.");
	}

	public void register(Integer userId, String accessToken) {
		userIdToAccessToken.put(userId, accessToken);
	}

	/** Dùng cho test / logout (Task002). */
	public void clear(Integer userId) {
		userIdToAccessToken.remove(userId);
	}
}
