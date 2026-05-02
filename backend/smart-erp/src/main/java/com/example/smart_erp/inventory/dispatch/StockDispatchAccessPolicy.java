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
		String role = roleClaimTrimmed(jwt);
		return StringUtils.hasText(role) && ADMIN_ROLE_NAME.equalsIgnoreCase(role);
	}

	/**
	 * Owner hoặc Admin — cùng claim {@code role} trên access JWT (đăng nhập / refresh).
	 * User seed {@code admin} trong V1 gắn {@code role_id} của Owner (id=1), không phải bản ghi role tên "Admin".
	 */
	public static boolean isElevatedDispatchManager(Jwt jwt) {
		return isAdmin(jwt) || isOwner(jwt);
	}

	private static boolean isOwner(Jwt jwt) {
		String role = roleClaimTrimmed(jwt);
		return StringUtils.hasText(role) && StockReceiptAccessPolicy.OWNER_ROLE_NAME.equalsIgnoreCase(role);
	}

	/** Đọc claim {@code role}: ưu tiên chuỗi; null/blank nếu thiếu. */
	private static String roleClaimTrimmed(Jwt jwt) {
		if (jwt == null) {
			return null;
		}
		Object raw = jwt.getClaim("role");
		if (raw == null) {
			return null;
		}
		if (raw instanceof String s) {
			return s.trim();
		}
		String asText = String.valueOf(raw).trim();
		return StringUtils.hasText(asText) ? asText : null;
	}

	public static void assertManualDispatchCreator(int dispatchCreatorUserId, Jwt jwt) {
		StockReceiptAccessPolicy.assertReceiptCreator(dispatchCreatorUserId, jwt);
	}

	/** PATCH — người tạo phiếu hoặc Owner/Admin (trạng thái chưa hoàn tất xử lý ở service). */
	public static void assertCreatorOrElevatedForDispatchEdit(int dispatchCreatorUserId, Jwt jwt) {
		int uid = StockReceiptAccessPolicy.parseUserId(jwt);
		if (uid == dispatchCreatorUserId) {
			return;
		}
		if (isElevatedDispatchManager(jwt)) {
			return;
		}
		throw new BusinessException(ApiErrorCode.FORBIDDEN,
				"Chỉ người tạo phiếu hoặc Owner/Admin mới được sửa phiếu xuất kho này");
	}

	public static void assertCreatorOrElevatedForSoftDelete(int dispatchCreatorUserId, Jwt jwt) {
		int uid = StockReceiptAccessPolicy.parseUserId(jwt);
		if (uid == dispatchCreatorUserId) {
			return;
		}
		if (isElevatedDispatchManager(jwt)) {
			return;
		}
		throw new BusinessException(ApiErrorCode.FORBIDDEN,
				"Chỉ người tạo phiếu hoặc Owner/Admin mới được xóa mềm phiếu xuất kho này");
	}
}
