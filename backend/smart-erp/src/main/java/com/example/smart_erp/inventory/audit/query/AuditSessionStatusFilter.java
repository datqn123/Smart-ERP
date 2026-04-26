package com.example.smart_erp.inventory.audit.query;

import java.util.Objects;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;

/** Tham số `status` GET list — Task021 / SRS. */
public enum AuditSessionStatusFilter {
	ALL,
	PENDING,
	IN_PROGRESS,
	PENDING_OWNER_APPROVAL,
	COMPLETED,
	CANCELLED,
	RECHECK;

	public static AuditSessionStatusFilter fromParam(String raw) {
		if (raw == null || raw.isBlank() || "all".equalsIgnoreCase(raw.trim())) {
			return ALL;
		}
		String t = raw.trim();
		if ("Pending".equals(t)) {
			return PENDING;
		}
		if ("In Progress".equals(t)) {
			return IN_PROGRESS;
		}
		if ("Pending Owner Approval".equals(t)) {
			return PENDING_OWNER_APPROVAL;
		}
		if ("Completed".equals(t)) {
			return COMPLETED;
		}
		if ("Cancelled".equals(t)) {
			return CANCELLED;
		}
		if ("Re-check".equals(t)) {
			return RECHECK;
		}
		throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Tham số truy vấn không hợp lệ",
				java.util.Map.of("status",
						"Giá trị phải là all, Pending, In Progress, Pending Owner Approval, Completed, Cancelled hoặc Re-check"));
	}

	public String sqlLiteralOrNull() {
		return switch (this) {
			case ALL -> null;
			case PENDING -> "Pending";
			case IN_PROGRESS -> "In Progress";
			case PENDING_OWNER_APPROVAL -> "Pending Owner Approval";
			case COMPLETED -> "Completed";
			case CANCELLED -> "Cancelled";
			case RECHECK -> "Re-check";
		};
	}

	public boolean matches(String dbStatus) {
		if (this == ALL) {
			return true;
		}
		return Objects.equals(sqlLiteralOrNull(), dbStatus);
	}
}
