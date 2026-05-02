package com.example.smart_erp.finance.cashflow;

import java.time.LocalDate;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.finance.cashflow.response.CashflowMovementPageData;

@Service
@SuppressWarnings("null")
public class CashflowMovementService {

	private final CashflowMovementJdbcRepository repo;

	public CashflowMovementService(CashflowMovementJdbcRepository repo) {
		this.repo = repo;
	}

	public CashflowMovementPageData list(String dateFromRaw, String dateToRaw, String fundIdRaw, String searchRaw, String pageRaw,
			String limitRaw) {
		LocalDate[] range = resolveDateRange(dateFromRaw, dateToRaw);
		LocalDate dateFrom = range[0];
		LocalDate dateTo = range[1];
		if (dateFrom.isAfter(dateTo)) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Ngày bắt đầu không được sau ngày kết thúc.");
		}
		Integer fundId = parseFundIdOrNull(fundIdRaw);
		String sp = CashflowMovementJdbcRepository.toSearchPatternOrNull(searchRaw);
		int page = parsePositiveInt(pageRaw, 1, 1, 1_000_000, "page");
		int limit = parsePositiveInt(limitRaw, 20, 1, 100, "limit");
		long total = repo.count(dateFrom, dateTo, fundId, sp);
		int offset = (page - 1) * limit;
		var items = repo.loadPage(dateFrom, dateTo, fundId, sp, limit, offset);
		var summary = repo.summarize(dateFrom, dateTo, fundId, sp);
		return new CashflowMovementPageData(items, page, limit, total, summary);
	}

	private static LocalDate[] resolveDateRange(String dateFromRaw, String dateToRaw) {
		boolean hasFrom = StringUtils.hasText(dateFromRaw);
		boolean hasTo = StringUtils.hasText(dateToRaw);
		if (!hasFrom && !hasTo) {
			LocalDate t = LocalDate.now();
			return new LocalDate[] { t, t };
		}
		if (hasFrom && !hasTo) {
			LocalDate f = LocalDate.parse(dateFromRaw.trim());
			return new LocalDate[] { f, f };
		}
		if (!hasFrom) {
			LocalDate t = LocalDate.parse(dateToRaw.trim());
			return new LocalDate[] { t, t };
		}
		return new LocalDate[] { LocalDate.parse(dateFromRaw.trim()), LocalDate.parse(dateToRaw.trim()) };
	}

	private static Integer parseFundIdOrNull(String raw) {
		if (!StringUtils.hasText(raw)) {
			return null;
		}
		try {
			return Integer.parseInt(raw.trim());
		}
		catch (NumberFormatException e) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: fundId");
		}
	}

	private static int parsePositiveInt(String raw, int defaultVal, int min, int max, String name) {
		if (!StringUtils.hasText(raw)) {
			return defaultVal;
		}
		try {
			int v = Integer.parseInt(raw.trim());
			if (v < min || v > max) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: " + name);
			}
			return v;
		}
		catch (NumberFormatException e) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: " + name);
		}
	}
}
