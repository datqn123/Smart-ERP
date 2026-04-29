package com.example.smart_erp.finance.ledger;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.finance.ledger.response.FinanceLedgerPageData;

/**
 * SRS Task063.
 */
@Service
@Transactional(readOnly = true)
public class FinanceLedgerService {

	private static final DateTimeFormatter ISO_DATE = DateTimeFormatter.ISO_LOCAL_DATE;

	private final FinanceLedgerJdbcRepository repo;

	public FinanceLedgerService(FinanceLedgerJdbcRepository repo) {
		this.repo = repo;
	}

	public FinanceLedgerPageData list(String dateFromRaw, String dateToRaw, String transactionTypeRaw,
			String referenceTypeRaw, String searchRaw, String pageRaw, String limitRaw) {
		LocalDate dateFrom = parseOptionalDate("dateFrom", dateFromRaw);
		LocalDate dateTo = parseOptionalDate("dateTo", dateToRaw);
		assertDateOrder(dateFrom, dateTo);

		DateWindow w = applyDefaultDateWindow(dateFrom, dateTo);

		String transactionType = normalizeTransactionTypeOrNull(transactionTypeRaw);
		String referenceType = normalizeOptionalText(referenceTypeRaw);
		String searchPattern = FinanceLedgerJdbcRepository.toSearchPatternOrNull(searchRaw);

		int page = parsePositiveInt(pageRaw, 1);
		int limit = clamp(parsePositiveInt(limitRaw, 20), 1, 100);
		int offset = (page - 1) * limit;

		long total = repo.countFiltered(w.effectiveFrom, w.effectiveTo, transactionType, referenceType, searchPattern);
		var items = repo.loadPage(w.effectiveFrom, w.effectiveTo, transactionType, referenceType, searchPattern, limit,
				offset);
		return new FinanceLedgerPageData(items, page, limit, total);
	}

	private static DateWindow applyDefaultDateWindow(LocalDate dateFrom, LocalDate dateTo) {
		if (dateFrom == null && dateTo == null) {
			LocalDate to = LocalDate.now();
			LocalDate from = to.minusDays(89);
			return new DateWindow(from, to);
		}
		return new DateWindow(dateFrom, dateTo);
	}

	private static String normalizeTransactionTypeOrNull(String raw) {
		if (!StringUtils.hasText(raw)) {
			return null;
		}
		String t = raw.trim();
		if ("SalesRevenue".equalsIgnoreCase(t)) {
			return "SalesRevenue";
		}
		if ("PurchaseCost".equalsIgnoreCase(t)) {
			return "PurchaseCost";
		}
		if ("OperatingExpense".equalsIgnoreCase(t)) {
			return "OperatingExpense";
		}
		if ("Refund".equalsIgnoreCase(t)) {
			return "Refund";
		}
		throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Tham số transactionType không hợp lệ.");
	}

	private static String normalizeOptionalText(String raw) {
		if (!StringUtils.hasText(raw)) {
			return null;
		}
		String t = raw.trim();
		return t.isEmpty() ? null : t;
	}

	private static void assertDateOrder(LocalDate from, LocalDate to) {
		if (from != null && to != null && from.isAfter(to)) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Ngày bắt đầu không được sau ngày kết thúc.",
					Map.of("dateFrom", "dateFrom phải nhỏ hơn hoặc bằng dateTo"));
		}
	}

	private static LocalDate parseOptionalDate(String field, String raw) {
		if (!StringUtils.hasText(raw)) {
			return null;
		}
		try {
			return LocalDate.parse(raw.trim(), ISO_DATE);
		}
		catch (DateTimeParseException e) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Định dạng ngày không hợp lệ.",
					Map.of(field, "Định dạng yêu cầu: YYYY-MM-DD"));
		}
	}

	private static int parsePositiveInt(String raw, int defaultValue) {
		if (!StringUtils.hasText(raw)) {
			return defaultValue;
		}
		try {
			int v = Integer.parseInt(raw.trim());
			return v;
		}
		catch (NumberFormatException e) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Tham số phân trang không hợp lệ.",
					Map.of("page", "page/limit phải là số nguyên dương"));
		}
	}

	private static int clamp(int v, int min, int max) {
		return Math.max(min, Math.min(max, v));
	}

	private record DateWindow(LocalDate effectiveFrom, LocalDate effectiveTo) {
	}
}

