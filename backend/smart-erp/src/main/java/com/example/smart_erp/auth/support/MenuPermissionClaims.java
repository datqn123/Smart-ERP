package com.example.smart_erp.auth.support;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;

/**
 * Task101: tập boolean gọn cho side menu, nhúng vào JWT (claim {@value #CLAIM_NAME}).
 * Cùng tập khóa với subset đọc từ cột {@code roles.permissions} (JSONB).
 */
public final class MenuPermissionClaims {

	public static final String CLAIM_NAME = "mp";

	private static final ObjectMapper MAPPER = JsonMapper.builder().build();

	private static final String[] MENU_KEYS = {
		"can_view_dashboard",
		"can_use_ai",
		"can_manage_inventory",
		"can_manage_products",
		"can_manage_orders",
		"can_approve",
		"can_view_finance",
		"can_manage_staff",
		"can_configure_alerts"
	};

	private MenuPermissionClaims() {
	}

	/**
	 * Rút 9 cờ cần cho menu từ toàn bộ JSON {@code permissions} trên bảng Roles.
	 * Key thiếu hoặc lỗi parse → false.
	 */
	public static Map<String, Boolean> fromRolePermissionsJson(String rolePermissionsJson) {
		Map<String, Boolean> out = new LinkedHashMap<>();
		for (String k : MENU_KEYS) {
			out.put(k, false);
		}
		if (rolePermissionsJson == null || rolePermissionsJson.isBlank()) {
			return out;
		}
		try {
			JsonNode root = MAPPER.readTree(rolePermissionsJson);
			if (!root.isObject()) {
				return out;
			}
			for (String k : MENU_KEYS) {
				if (root.has(k) && root.get(k).isBoolean()) {
					out.put(k, root.get(k).asBoolean());
				}
			}
		}
		catch (Exception e) {
			// bảo toàn: toàn false
		}
		return Collections.unmodifiableMap(out);
	}
}
