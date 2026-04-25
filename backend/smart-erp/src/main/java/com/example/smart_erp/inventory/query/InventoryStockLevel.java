package com.example.smart_erp.inventory.query;

/**
 * Bộ lọc {@code stockLevel} — API Task005 / SRS Task005 mục 6.
 */
public enum InventoryStockLevel {
	ALL,
	IN_STOCK,
	LOW_STOCK,
	OUT_OF_STOCK;

	/** Giá trị mặc định tài liệu API. */
	public static final String DEFAULT = "all";

	/**
	 * @throws IllegalArgumentException nếu không hợp lệ
	 */
	public static InventoryStockLevel fromParam(String raw) {
		if (raw == null || raw.isBlank()) {
			return ALL;
		}
		String s = raw.trim().toLowerCase();
		return switch (s) {
		case "all" -> ALL;
		case "in_stock" -> IN_STOCK;
		case "low_stock" -> LOW_STOCK;
		case "out_of_stock" -> OUT_OF_STOCK;
		default -> throw new IllegalArgumentException(
				"stockLevel: Giá trị phải là all, in_stock, low_stock hoặc out_of_stock");
		};
	}
}
