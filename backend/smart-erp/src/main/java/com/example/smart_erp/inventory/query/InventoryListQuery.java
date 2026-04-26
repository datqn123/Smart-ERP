package com.example.smart_erp.inventory.query;

import java.util.LinkedHashMap;
import java.util.Map;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;

/**
 * Tham số thống nhất cho 3 tầng truy vấn Task005: summary, count, page.
 * Task009 — {@link #forSummaryFilters}: cùng WHERE, aggregate bỏ qua LIMIT.
 */
public record InventoryListQuery(
		String search,
		InventoryStockLevel stockLevel,
		Integer locationId,
		Integer categoryId,
		int page,
		int limit,
		InventoryListSortOrder sort) {

	public static final int DEFAULT_PAGE = 1;
	public static final int DEFAULT_LIMIT = 20;
	public static final int MAX_LIMIT = 100;

	/**
	 * Task009 — chỉ cần filter giống Task005; {@code page}, {@code limit}, {@code sort} mặc định nội bộ (aggregate không dùng LIMIT).
	 */
	public static InventoryListQuery forSummaryFilters(String search, String stockLevel, String locationId, String categoryId) {
		return of(search, stockLevel, locationId, categoryId, null, null, null);
	}

	public static InventoryListQuery of(String search, String stockLevel, String locationId, String categoryId, String page,
			String limit, String sort) {
		try {
			InventoryStockLevel sl = InventoryStockLevel.fromParam(stockLevel);
			InventoryListSortOrder ord = InventoryListSortOrder.parseOrDefault(sort);
			int p = parsePage(page);
			int l = parseLimit(limit);
			Integer loc = parseOptionalPositiveId(locationId, "locationId");
			Integer cat = parseOptionalPositiveId(categoryId, "categoryId");
			String s = search != null && !search.isBlank() ? search.trim() : null;
			return new InventoryListQuery(s, sl, loc, cat, p, l, ord);
		}
		catch (IllegalArgumentException e) {
			throw toBadRequest(e);
		}
	}

	private static BusinessException toBadRequest(IllegalArgumentException e) {
		String msg = e.getMessage() != null ? e.getMessage() : "Không hợp lệ";
		if (e.getMessage() != null) {
			int idx = e.getMessage().indexOf(':');
			if (idx > 0) {
				String key = e.getMessage().substring(0, idx);
				String val = e.getMessage().substring(idx + 1).trim();
				if (isKnownFieldKey(key)) {
					return new BusinessException(ApiErrorCode.BAD_REQUEST, "Tham số truy vấn không hợp lệ",
							Map.of(key, val));
				}
			}
		}
		Map<String, String> m = new LinkedHashMap<>();
		m.put("query", msg);
		return new BusinessException(ApiErrorCode.BAD_REQUEST, "Tham số truy vấn không hợp lệ", m);
	}

	private static boolean isKnownFieldKey(String k) {
		return "stockLevel".equals(k) || "page".equals(k) || "limit".equals(k) || "locationId".equals(k)
				|| "categoryId".equals(k) || "sort".equals(k) || "search".equals(k);
	}

	private static Integer parseOptionalPositiveId(String raw, String name) {
		if (raw == null || raw.isBlank()) {
			return null;
		}
		try {
			int v = Integer.parseInt(raw.trim());
			if (v <= 0) {
				throw new IllegalArgumentException(name + ": Giá trị phải lớn hơn 0");
			}
			return v;
		}
		catch (NumberFormatException e) {
			throw new IllegalArgumentException(name + ": Không phải số nguyên hợp lệ");
		}
	}

	private static int parsePage(String raw) {
		if (raw == null || raw.isBlank()) {
			return DEFAULT_PAGE;
		}
		int v;
		try {
			v = Integer.parseInt(raw.trim());
		}
		catch (NumberFormatException e) {
			throw new IllegalArgumentException("page" + ": Không phải số nguyên hợp lệ");
		}
		if (v < 1) {
			throw new IllegalArgumentException("page" + ": Số trang tối thiểu là 1");
		}
		return v;
	}

	private static int parseLimit(String raw) {
		if (raw == null || raw.isBlank()) {
			return DEFAULT_LIMIT;
		}
		int v;
		try {
			v = Integer.parseInt(raw.trim());
		}
		catch (NumberFormatException e) {
			throw new IllegalArgumentException("limit" + ": Không phải số nguyên hợp lệ");
		}
		if (v < 1 || v > MAX_LIMIT) {
			throw new IllegalArgumentException("limit" + ": Giá trị phải từ 1 đến 100");
		}
		return v;
	}
}
