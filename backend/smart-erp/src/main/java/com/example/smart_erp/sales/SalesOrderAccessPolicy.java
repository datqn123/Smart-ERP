package com.example.smart_erp.sales;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.util.StringUtils;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;

/**
 * SRS Task054–060 §6 / OQ-8a: Staff phải gửi {@code orderChannel} khi list; Owner/Admin được bỏ qua.
 */
public final class SalesOrderAccessPolicy {

	private SalesOrderAccessPolicy() {
	}

	public static void assertCanListWithoutOrderChannelFilter(Jwt jwt, String orderChannelRaw) {
		if (StringUtils.hasText(orderChannelRaw)) {
			return;
		}
		String role = jwt.getClaimAsString("role");
		if (!StringUtils.hasText(role)) {
			throw new BusinessException(ApiErrorCode.FORBIDDEN,
					"Chỉ Owner hoặc Admin được xem danh sách đơn không lọc orderChannel");
		}
		String r = role.trim();
		if ("Owner".equalsIgnoreCase(r) || "Admin".equalsIgnoreCase(r)) {
			return;
		}
		throw new BusinessException(ApiErrorCode.FORBIDDEN,
				"Chỉ Owner hoặc Admin được xem danh sách đơn không lọc orderChannel");
	}
}
