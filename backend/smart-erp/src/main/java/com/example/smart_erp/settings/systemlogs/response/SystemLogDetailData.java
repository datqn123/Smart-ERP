package com.example.smart_erp.settings.systemlogs.response;

import com.fasterxml.jackson.databind.JsonNode;

public record SystemLogDetailData(
		long id,
		String timestamp,
		String user,
		String action,
		String module,
		String description,
		String severity,
		String ipAddress,
		String stackTrace,
		JsonNode contextData) {
}

