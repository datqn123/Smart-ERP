package com.example.smart_erp.inventory.approvals;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.util.StringUtils;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;

/**
 * SRS Task061–062 §6 — Chỉ {@code role} Owner hoặc Admin được đọc {@code /approvals/pending} và
 * {@code /approvals/history}; Staff → 403.
 */
public final class ApprovalsAccessPolicy {

	private ApprovalsAccessPolicy() {
	}

	public static void assertOwnerOrAdmin(Jwt jwt, String forbiddenMessage) {
		String role = jwt.getClaimAsString("role");
		if (!StringUtils.hasText(role)) {
			throw new BusinessException(ApiErrorCode.FORBIDDEN, forbiddenMessage);
		}
		String r = role.trim();
		if ("Owner".equalsIgnoreCase(r) || "Admin".equalsIgnoreCase(r)) {
			return;
		}
		throw new BusinessException(ApiErrorCode.FORBIDDEN, forbiddenMessage);
	}
}
