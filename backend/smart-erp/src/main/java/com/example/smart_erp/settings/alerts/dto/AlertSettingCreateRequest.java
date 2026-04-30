package com.example.smart_erp.settings.alerts.dto;

import java.math.BigDecimal;
import java.util.List;

import com.example.smart_erp.settings.alerts.model.AlertChannel;
import com.example.smart_erp.settings.alerts.model.AlertFrequency;
import com.example.smart_erp.settings.alerts.model.AlertType;

import jakarta.validation.constraints.NotNull;

/**
 * Task083 POST /api/v1/alert-settings
 */
public record AlertSettingCreateRequest(
		@NotNull AlertType alertType,
		@NotNull AlertChannel channel,
		AlertFrequency frequency,
		BigDecimal thresholdValue,
		Boolean isEnabled,
		List<String> recipients) {
}

