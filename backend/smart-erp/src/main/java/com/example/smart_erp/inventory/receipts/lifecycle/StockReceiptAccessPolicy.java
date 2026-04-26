package com.example.smart_erp.inventory.receipts.lifecycle;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.util.StringUtils;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;

/**
 * SRS Task014–020 §6 — Đọc (GET list/detail): mọi user có {@code can_manage_inventory} xem **mọi** phiếu.
 * PATCH/SUBMIT: chỉ người tạo phiếu ({@code staff_id} = JWT subject). Xóa (DELETE) / phê duyệt / từ chối: chỉ
 * {@code role} = Owner (SRS §6).
 */
public final class StockReceiptAccessPolicy {

	/** Khớp tên vai trò seed Flyway V1 / claim {@code role} trên access token. */
	public static final String OWNER_ROLE_NAME = "Owner";

	public static final String AUTH_CAN_APPROVE = "can_approve";

	private StockReceiptAccessPolicy() {
	}

	public static int parseUserId(Jwt jwt) {
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

	/** PATCH / POST submit — chỉ người tạo phiếu ({@code staff_id}). */
	public static void assertReceiptCreator(int receiptStaffId, Jwt jwt) {
		int uid = parseUserId(jwt);
		if (receiptStaffId != uid) {
			throw new BusinessException(ApiErrorCode.FORBIDDEN, "Bạn chỉ được thao tác trên phiếu do chính mình tạo");
		}
	}

	/**
	 * DELETE (Nháp/Chờ duyệt), Task019 approve, Task020 reject — chỉ Owner (claim {@code role}, không phân biệt hoa thường).
	 */
	public static void assertOwnerOnly(Jwt jwt) {
		String role = jwt.getClaimAsString("role");
		if (!StringUtils.hasText(role) || !OWNER_ROLE_NAME.equalsIgnoreCase(role.trim())) {
			throw new BusinessException(ApiErrorCode.FORBIDDEN,
					"Chỉ tài khoản Owner mới được xóa phiếu (Nháp/Chờ duyệt), phê duyệt hoặc từ chối phiếu Chờ duyệt");
		}
	}
}
