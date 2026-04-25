package com.example.smart_erp.users.dto;

import java.util.Locale;
import java.util.Optional;

/**
 * Dòng mã nhân viên hiển thị trên form (Task078_02) — map sang prefix khác nhau khi cùng {@code roleId} (seed DB).
 */
public enum StaffFamily {
	ADMIN,
	MANAGER,
	WAREHOUSE,
	STAFF;

	public static Optional<StaffFamily> parseOptional(String raw) {
		if (raw == null || raw.isBlank()) {
			return Optional.empty();
		}
		try {
			return Optional.of(StaffFamily.valueOf(raw.strip().toUpperCase(Locale.ROOT)));
		}
		catch (IllegalArgumentException e) {
			return Optional.empty();
		}
	}
}
