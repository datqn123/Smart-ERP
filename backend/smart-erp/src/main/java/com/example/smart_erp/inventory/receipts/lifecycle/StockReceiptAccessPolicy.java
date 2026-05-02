package com.example.smart_erp.inventory.receipts.lifecycle;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.util.StringUtils;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;

/**
 * SRS Task014–020 §6 — Đọc (GET list/detail): mọi user có {@code can_manage_inventory} xem **mọi** phiếu.
 * PATCH/SUBMIT: chỉ người tạo phiếu ({@code staff_id} = JWT subject).
 * Phê duyệt / từ chối (Pending): {@code role} Admin hoặc Owner + authority {@code can_approve}.
 * Xóa Nháp: chỉ Owner. Xóa Chờ duyệt: Staff, Admin hoặc Owner.
 */
public final class StockReceiptAccessPolicy {

	/** Khớp tên vai trò seed Flyway V1 / claim {@code role} trên access token. */
	public static final String OWNER_ROLE_NAME = "Owner";

	public static final String ADMIN_ROLE_NAME = "Admin";

	public static final String STAFF_ROLE_NAME = "Staff";

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

	/** Thông điệp mặc định khi gọi {@link #assertOwnerOnly(Jwt)} không truyền message tùy chỉnh (kiểm kê, v.v.). */
	private static final String DEFAULT_OWNER_ONLY_MESSAGE = "Chỉ tài khoản Owner mới được thực hiện thao tác này";

	private static final String OWNER_ONLY_DELETE_DRAFT_RECEIPT = "Chỉ tài khoản Owner mới được xóa phiếu ở trạng thái Nháp";

	private static final String DEFAULT_ADMIN_OR_OWNER_APPROVAL_MESSAGE = "Chỉ Admin hoặc Owner mới được phê duyệt hoặc từ chối phiếu Chờ duyệt";

	private static final String STAFF_ADMIN_OWNER_PENDING_DELETE_MESSAGE = "Chỉ Staff, Admin hoặc Owner mới được xóa phiếu ở trạng thái Chờ duyệt";

	/**
	 * DELETE phiếu Nháp — chỉ Owner (claim {@code role}, không phân biệt hoa thường).
	 */
	public static void assertOwnerOnly(Jwt jwt) {
		assertOwnerOnly(jwt, DEFAULT_OWNER_ONLY_MESSAGE);
	}

	/** Xóa phiếu nhập Nháp — chỉ Owner. */
	public static void assertOwnerOnlyForDraftReceiptDelete(Jwt jwt) {
		assertOwnerOnly(jwt, OWNER_ONLY_DELETE_DRAFT_RECEIPT);
	}

	/**
	 * Chỉ Owner — dùng cho Task033 categories soft-delete hoặc thao tác Owner-only khác (message tùy chỉnh).
	 */
	public static void assertOwnerOnly(Jwt jwt, String forbiddenMessage) {
		String role = jwt.getClaimAsString("role");
		if (!StringUtils.hasText(role) || !OWNER_ROLE_NAME.equalsIgnoreCase(role.trim())) {
			throw new BusinessException(ApiErrorCode.FORBIDDEN,
					StringUtils.hasText(forbiddenMessage) ? forbiddenMessage : DEFAULT_OWNER_ONLY_MESSAGE);
		}
	}

	/** Task019 / Task020 — Admin hoặc Owner (JWT {@code role}). */
	public static void assertAdminOrOwnerForApproveReject(Jwt jwt) {
		assertAdminOrOwnerForApproveReject(jwt, DEFAULT_ADMIN_OR_OWNER_APPROVAL_MESSAGE);
	}

	public static void assertAdminOrOwnerForApproveReject(Jwt jwt, String forbiddenMessage) {
		String role = jwt.getClaimAsString("role");
		if (hasAdminOrOwnerRole(role)) {
			return;
		}
		throw new BusinessException(ApiErrorCode.FORBIDDEN,
				StringUtils.hasText(forbiddenMessage) ? forbiddenMessage : DEFAULT_ADMIN_OR_OWNER_APPROVAL_MESSAGE);
	}

	/** DELETE phiếu Chờ duyệt — Staff, Admin hoặc Owner. */
	public static void assertStaffAdminOrOwnerForPendingReceiptDelete(Jwt jwt) {
		String role = jwt.getClaimAsString("role");
		if (hasStaffAdminOrOwnerRole(role)) {
			return;
		}
		throw new BusinessException(ApiErrorCode.FORBIDDEN, STAFF_ADMIN_OWNER_PENDING_DELETE_MESSAGE);
	}

	private static boolean hasAdminOrOwnerRole(String role) {
		if (!StringUtils.hasText(role)) {
			return false;
		}
		String r = role.trim();
		return ADMIN_ROLE_NAME.equalsIgnoreCase(r) || OWNER_ROLE_NAME.equalsIgnoreCase(r);
	}

	private static boolean hasStaffAdminOrOwnerRole(String role) {
		if (!StringUtils.hasText(role)) {
			return false;
		}
		String r = role.trim();
		return STAFF_ROLE_NAME.equalsIgnoreCase(r) || ADMIN_ROLE_NAME.equalsIgnoreCase(r) || OWNER_ROLE_NAME.equalsIgnoreCase(r);
	}
}
