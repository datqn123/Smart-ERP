package com.example.smart_erp.notifications.response;

import java.time.Instant;

public record NotificationItemData(
		long id,
		String notificationType,
		String title,
		String message,
		boolean read,
		String referenceType,
		Integer referenceId,
		Instant createdAt) {
}
