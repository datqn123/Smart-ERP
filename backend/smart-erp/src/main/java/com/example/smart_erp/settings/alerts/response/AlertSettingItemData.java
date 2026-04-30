package com.example.smart_erp.settings.alerts.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * Shape aligned with API docs Task082–085 (camelCase).
 */
public record AlertSettingItemData(
		long id,
		String alertType,
		BigDecimal thresholdValue,
		String channel,
		String frequency,
		boolean isEnabled,
		List<String> recipients,
		@JsonFormat(shape = JsonFormat.Shape.STRING) Instant updatedAt) {
}

