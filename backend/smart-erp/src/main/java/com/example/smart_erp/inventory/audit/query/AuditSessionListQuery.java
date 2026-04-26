package com.example.smart_erp.inventory.audit.query;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.LinkedHashMap;
import java.util.Map;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;

/** Tham số GET `/inventory/audit-sessions` — Task021. */
public record AuditSessionListQuery(
		String search,
		AuditSessionStatusFilter status,
		LocalDate dateFrom,
		LocalDate dateTo,
		int page,
		int limit) {

	public static final int DEFAULT_PAGE = 1;
	public static final int DEFAULT_LIMIT = 20;
	public static final int MAX_LIMIT = 100;

	public static AuditSessionListQuery of(String search, String status, String dateFrom, String dateTo, String page,
			String limit) {
		try {
			AuditSessionStatusFilter st = AuditSessionStatusFilter.fromParam(status);
			LocalDate df = parseOptionalLocalDate(dateFrom, "dateFrom");
			LocalDate dt = parseOptionalLocalDate(dateTo, "dateTo");
			if (df != null && dt != null && df.isAfter(dt)) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Tham số truy vấn không hợp lệ",
						Map.of("dateRange", "Ngày bắt đầu không được sau ngày kết thúc"));
			}
			int p = parsePage(page);
			int l = parseLimit(limit);
			String s = search != null && !search.isBlank() ? search.trim() : null;
			return new AuditSessionListQuery(s, st, df, dt, p, l);
		}
		catch (BusinessException e) {
			throw e;
		}
		catch (IllegalArgumentException e) {
			throw badRequestFromParse(e);
		}
	}

	private static BusinessException badRequestFromParse(IllegalArgumentException e) {
		String msg = e.getMessage() != null ? e.getMessage() : "Không hợp lệ";
		Map<String, String> m = new LinkedHashMap<>();
		m.put("query", msg);
		return new BusinessException(ApiErrorCode.BAD_REQUEST, "Tham số truy vấn không hợp lệ", m);
	}

	private static LocalDate parseOptionalLocalDate(String raw, String name) {
		if (raw == null || raw.isBlank()) {
			return null;
		}
		try {
			return LocalDate.parse(raw.trim());
		}
		catch (DateTimeParseException e) {
			throw new IllegalArgumentException(name + ": Định dạng phải là YYYY-MM-DD");
		}
	}

	private static int parsePage(String raw) {
		if (raw == null || raw.isBlank()) {
			return DEFAULT_PAGE;
		}
		int v = Integer.parseInt(raw.trim());
		if (v < 1) {
			throw new IllegalArgumentException("page: Số trang tối thiểu là 1");
		}
		return v;
	}

	private static int parseLimit(String raw) {
		if (raw == null || raw.isBlank()) {
			return DEFAULT_LIMIT;
		}
		int v = Integer.parseInt(raw.trim());
		if (v < 1 || v > MAX_LIMIT) {
			throw new IllegalArgumentException("limit: Giá trị phải từ 1 đến 100");
		}
		return v;
	}
}
