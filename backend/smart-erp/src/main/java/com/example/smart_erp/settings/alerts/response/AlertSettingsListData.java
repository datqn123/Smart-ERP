package com.example.smart_erp.settings.alerts.response;

import java.util.List;

public record AlertSettingsListData(List<AlertSettingItemData> items) {
	public static AlertSettingsListData of(List<AlertSettingItemData> items) {
		return new AlertSettingsListData(items != null ? items : List.of());
	}
}
