package com.example.smart_erp.inventory.query;

/**
 * Sắp xếp danh sách: SRS Task005 mục 12 — mặc định {@code i.id} ASC; nếu có tham
 * số thì chuỗi {@code field:direction} với allowlist tại đây.
 */
public final class InventoryListSortOrder {

	private final String orderByFragment;

	public InventoryListSortOrder(String orderByFragment) {
		this.orderByFragment = orderByFragment;
	}

	public String orderByFragment() {
		return orderByFragment;
	}

	/**
	 * @param sort từ query; rỗng/blank → mặc định
	 * @throws IllegalArgumentException khi format hoặc giá trị không hợp lệ
	 */
	public static InventoryListSortOrder parseOrDefault(String sort) {
		if (sort == null || sort.isBlank()) {
			return new InventoryListSortOrder("i.id ASC");
		}
		int colon = sort.indexOf(':');
		if (colon <= 0 || colon == sort.length() - 1) {
			throw new IllegalArgumentException("sort: Cần dạng tênCột:asc|desc, ví dụ id:asc hoặc updatedAt:desc");
		}
		String field = sort.substring(0, colon).trim();
		String dir = sort.substring(colon + 1).trim().toLowerCase();
		if (!"asc".equals(dir) && !"desc".equals(dir)) {
			throw new IllegalArgumentException("sort: Hướng phải là asc hoặc desc");
		}
		return switch (field) {
		case "id" -> new InventoryListSortOrder("i.id " + dir.toUpperCase());
		case "updatedAt" -> new InventoryListSortOrder("i.updated_at " + dir.toUpperCase());
		default -> throw new IllegalArgumentException("sort: Tên cột hợp lệ: id, updatedAt");
		};
	}
}
