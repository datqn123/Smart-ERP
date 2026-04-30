package com.example.smart_erp.auth.response;

import java.util.Map;

public record RoleItemData(
		int id,
		String name,
		Map<String, Boolean> permissions) {
}

