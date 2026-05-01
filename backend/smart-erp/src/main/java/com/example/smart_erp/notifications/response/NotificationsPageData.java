package com.example.smart_erp.notifications.response;

import java.util.List;

public record NotificationsPageData(
		List<NotificationItemData> items,
		int page,
		int limit,
		long total,
		long unreadTotal) {
}
