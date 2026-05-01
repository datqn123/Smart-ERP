package com.example.smart_erp.inventory.receipts.query;

/**
 * Whitelist sort cho GET danh sách phiếu nhập — Task013.
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
			return new StockReceiptListSortOrder("sr.created_at DESC, sr.id DESC");
		}
		int colon = sort.indexOf(':');
		if (colon <= 0 || colon == sort.length() - 1) {
			throw new IllegalArgumentException("sort: Cần dạng field:asc hoặc field:desc (field = id | createdAt)");
		}
		String field = sort.substring(0, colon).trim();
		String dir = sort.substring(colon + 1).trim().toLowerCase();
		if (!"asc".equals(dir) && !"desc".equals(dir)) {
			throw new IllegalArgumentException("sort: Hướng phải là asc hoặc desc");
		}
		String dirSql = dir.toUpperCase();
		if ("id".equals(field)) {
			return new StockReceiptListSortOrder("sr.id " + dirSql + ", sr.created_at DESC");
		}
		if ("createdAt".equals(field)) {
			return new StockReceiptListSortOrder("sr.created_at " + dirSql + ", sr.id DESC");
		}
		throw new IllegalArgumentException("sort: Chỉ hỗ trợ id:asc|id:desc hoặc createdAt:asc|createdAt:desc");
	}
}
