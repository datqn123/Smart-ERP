package com.example.smart_erp.inventory.receipts.query;

/**
 * Lọc {@code status} — API Task013.
 */
public enum StockReceiptStatusFilter {
	ALL,
	DRAFT,
	PENDING,
	APPROVED,
	REJECTED;

	public static StockReceiptStatusFilter fromParam(String raw) {
		if (raw == null || raw.isBlank()) {
			return ALL;
		}
		String s = raw.trim();
		return switch (s) {
		case "all" -> ALL;
		case "Draft" -> DRAFT;
		case "Pending" -> PENDING;
		case "Approved" -> APPROVED;
		case "Rejected" -> REJECTED;
		default -> throw new IllegalArgumentException(
				"status: Giá trị phải là all, Draft, Pending, Approved hoặc Rejected");
		};
	}
}
