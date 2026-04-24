package com.example.smart_erp.auth.support;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.example.smart_erp.auth.entity.Role;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Đọc cờ boolean trong JSON {@code Roles.permissions} (seed Flyway).
 */
@Component
public class RolePermissionReader {

	private static final String CAN_MANAGE_STAFF = "can_manage_staff";

	private final ObjectMapper objectMapper;

	public RolePermissionReader(ObjectMapper objectMapper) {
		this.objectMapper = objectMapper;
	}

	public boolean canManageStaff(Role role) {
		if (role == null) {
			return false;
		}
		if ("Owner".equals(role.getName())) {
			return true;
		}
		return jsonBooleanTrue(role.getPermissions(), CAN_MANAGE_STAFF);
	}

	private boolean jsonBooleanTrue(String json, String key) {
		if (!StringUtils.hasText(json)) {
			return false;
		}
		try {
			JsonNode n = objectMapper.readTree(json);
			return n.path(key).asBoolean(false);
		}
		catch (Exception e) {
			return false;
		}
	}
}
