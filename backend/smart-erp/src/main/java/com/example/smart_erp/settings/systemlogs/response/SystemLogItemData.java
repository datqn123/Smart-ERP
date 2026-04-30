package com.example.smart_erp.settings.systemlogs.response;

/**
 * FE `SystemLog` row.
 */
public record SystemLogItemData(
		long id,
		String timestamp,
		String user,
		String action,
		String module,
		String description,
		String severity,
		String ipAddress) {
}

