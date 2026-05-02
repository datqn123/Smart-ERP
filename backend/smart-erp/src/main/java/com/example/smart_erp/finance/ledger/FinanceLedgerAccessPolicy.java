package com.example.smart_erp.finance.ledger;

import java.util.Map;

import org.springframework.security.oauth2.jwt.Jwt;

import com.example.smart_erp.auth.support.MenuPermissionClaims;
import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;

/**
 * SRS Task063 §6 / OQ-2: kiểm tra claim {@code can_view_finance} (trong claim
 * {@code mp}). Riêng endpoint sổ cái tài chính: thêm yêu cầu JWT claim {@code role}
 * là {@code Admin} (PRD bảo mật).
 */
public final class FinanceLedgerAccessPolicy {

	private FinanceLedgerAccessPolicy() {
	}

	public static void assertCanViewFinanceLedger(Jwt jwt, String forbiddenMessage) {
		Object mp = jwt.getClaim(MenuPermissionClaims.CLAIM_NAME);
		if (!(mp instanceof Map<?, ?> map)) {
			throw new BusinessException(ApiErrorCode.FORBIDDEN, forbiddenMessage);
		}
		Object v = map.get("can_view_finance");
		if (Boolean.TRUE.equals(v)) {
			return;
		}
		throw new BusinessException(ApiErrorCode.FORBIDDEN, forbiddenMessage);
	}

	/**
	 * Sổ cái tài chính: {@code can_view_finance} và chỉ vai trò {@code Admin}.
	 */
	public static void assertFinanceLedgerAdminOnly(Jwt jwt, String forbiddenMessage) {
		assertCanViewFinanceLedger(jwt, forbiddenMessage);
		Object role = jwt.getClaim("role");
		if ("Admin".equals(role)) {
			return;
		}
		throw new BusinessException(ApiErrorCode.FORBIDDEN, forbiddenMessage);
	}
}

