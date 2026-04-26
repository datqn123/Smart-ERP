package com.example.smart_erp.inventory.receipts.query;

/**
 * PO OQ-3 — chỉ sắp xếp theo {@code id}.
 */
public final class StockReceiptListSortOrder {

	private final String orderByFragment;

	public StockReceiptListSortOrder(String orderByFragment) {
		this.orderByFragment = orderByFragment;
	}

	public String orderByFragment() {
		return orderByFragment;
	}

	public static StockReceiptListSortOrder parseOrDefault(String sort) {
		if (sort == null || sort.isBlank()) {
			return new StockReceiptListSortOrder("sr.id DESC");
		}
		int colon = sort.indexOf(':');
		if (colon <= 0 || colon == sort.length() - 1) {
			throw new IllegalArgumentException("sort: Cần dạng id:asc hoặc id:desc");
		}
		String field = sort.substring(0, colon).trim();
		String dir = sort.substring(colon + 1).trim().toLowerCase();
		if (!"asc".equals(dir) && !"desc".equals(dir)) {
			throw new IllegalArgumentException("sort: Hướng phải là asc hoặc desc");
		}
		if (!"id".equals(field)) {
			throw new IllegalArgumentException("sort: Chỉ hỗ trợ id:asc hoặc id:desc");
		}
		return new StockReceiptListSortOrder("sr.id " + dir.toUpperCase());
	}
}
