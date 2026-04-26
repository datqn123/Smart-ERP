package com.example.smart_erp.inventory.receipts.lifecycle;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;

/**
 * SRS Task014–020 §6 + OQ-2 — Staff chỉ thao tác phiếu {@code staff_id} của mình; user có
 * {@code can_approve} được coi như giám sát (mọi phiếu).
 */
public final class StockReceiptAccessPolicy {

	public static final String AUTH_CAN_APPROVE = "can_approve";

	private StockReceiptAccessPolicy() {
	}

	public static int parseUserId(org.springframework.security.oauth2.jwt.Jwt jwt) {
		try {
			return Integer.parseInt(jwt.getSubject());
		}
		catch (NumberFormatException e) {
			throw new BusinessException(ApiErrorCode.UNAUTHORIZED, "JWT subject không phải user id hợp lệ");
		}
	}

	public static boolean hasAuthority(Authentication authentication, String authority) {
		if (authentication == null) {
			return false;
		}
		for (GrantedAuthority ga : authentication.getAuthorities()) {
			if (authority.equals(ga.getAuthority())) {
				return true;
			}
		}
		return false;
	}

	/** GET/PATCH/DELETE/SUBMIT — inventory staff hoặc approver toàn quyền (OQ-2). */
	public static void assertCanManageInventoryReceipt(int receiptStaffId, org.springframework.security.oauth2.jwt.Jwt jwt,
			Authentication authentication) {
		if (hasAuthority(authentication, AUTH_CAN_APPROVE)) {
			return;
		}
		int uid = parseUserId(jwt);
		if (receiptStaffId != uid) {
			throw new BusinessException(ApiErrorCode.FORBIDDEN, "Bạn chỉ được thao tác trên phiếu do chính mình tạo");
		}
	}
}
