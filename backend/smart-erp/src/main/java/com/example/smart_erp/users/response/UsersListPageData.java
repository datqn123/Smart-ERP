package com.example.smart_erp.users.response;

import java.util.List;

public record UsersListPageData(
		List<UserSummaryData> items,
		int page,
		int limit,
		long total) {
}

