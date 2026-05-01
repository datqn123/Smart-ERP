package com.example.smart_erp.inventory.receipts.query;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.LinkedHashMap;
import java.util.Map;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;

/**
 * Tham số GET list phiếu nhập — Task013 / SRS.
 */
public record StockReceiptListQuery(
		String search,
		StockReceiptStatusFilter status,
		LocalDate dateFrom,
		LocalDate dateTo,
		Integer supplierId,
		Integer mineStaffId,
		int page,
		int limit,
		StockReceiptListSortOrder sort) {

	public static final int DEFAULT_PAGE = 1;
	public static final int DEFAULT_LIMIT = 20;
	public static final int MAX_LIMIT = 100;

	public static StockReceiptListQuery of(String search, String status, String dateFrom, String dateTo, String supplierId,
			String page, String limit, String sort, Integer mineStaffId) {
		try {
			StockReceiptStatusFilter st = StockReceiptStatusFilter.fromParam(status);
			LocalDate df = parseOptionalLocalDate(dateFrom, "dateFrom");
			LocalDate dt = parseOptionalLocalDate(dateTo, "dateTo");
			if (df != null && dt != null && df.isAfter(dt)) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Tham số truy vấn không hợp lệ",
						Map.of("dateRange", "Ngày bắt đầu không được sau ngày kết thúc"));
			}
			Integer sup = parseOptionalPositiveId(supplierId, "supplierId");
			int p = parsePage(page);
			int l = parseLimit(limit);
			StockReceiptListSortOrder ord = StockReceiptListSortOrder.parseOrDefault(sort);
			String s = search != null && !search.isBlank() ? search.trim() : null;
			return new StockReceiptListQuery(s, st, df, dt, sup, mineStaffId, p, l, ord);
		}
		catch (BusinessException e) {
			throw e;
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
		return "status".equals(k) || "page".equals(k) || "limit".equals(k) || "sort".equals(k) || "search".equals(k)
				|| "dateFrom".equals(k) || "dateTo".equals(k) || "supplierId".equals(k);
	}

	private static LocalDate parseOptionalLocalDate(String raw, String name) {
		if (raw == null || raw.isBlank()) {
			return null;
		}
		String t = raw.trim();
		try {
			return LocalDate.parse(t);
		}
		catch (DateTimeParseException e) {
			throw new IllegalArgumentException(name + ": Định dạng phải là YYYY-MM-DD");
		}
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
