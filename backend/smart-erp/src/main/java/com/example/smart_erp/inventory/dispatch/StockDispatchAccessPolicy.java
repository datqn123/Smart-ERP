package com.example.smart_erp.inventory.dispatch;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.util.StringUtils;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.inventory.receipts.lifecycle.StockReceiptAccessPolicy;

public final class StockDispatchAccessPolicy {

	public static final String ADMIN_ROLE_NAME = "Admin";

	private StockDispatchAccessPolicy() {
	}

	public static boolean isAdmin(Jwt jwt) {
		String role = jwt.getClaimAsString("role");
		return StringUtils.hasText(role) && ADMIN_ROLE_NAME.equalsIgnoreCase(role.trim());
	}

	public static void assertManualDispatchCreator(int dispatchCreatorUserId, Jwt jwt) {
		StockReceiptAccessPolicy.assertReceiptCreator(dispatchCreatorUserId, jwt);
	}

	public static void assertCreatorOrAdminForSoftDelete(int dispatchCreatorUserId, Jwt jwt) {
		int uid = StockReceiptAccessPolicy.parseUserId(jwt);
		if (uid == dispatchCreatorUserId) {
			return;
		}
		if (isAdmin(jwt)) {
			return;
		}
		throw new BusinessException(ApiErrorCode.FORBIDDEN, "Chỉ người tạo phiếu hoặc Admin mới được xóa mềm phiếu này");
	}
}
