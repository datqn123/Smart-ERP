package com.example.smart_erp.settings.systemlogs.response;

import java.util.List;

public record SystemLogsListData(
		List<SystemLogItemData> items,
		int page,
		int limit,
		long total) {
}

