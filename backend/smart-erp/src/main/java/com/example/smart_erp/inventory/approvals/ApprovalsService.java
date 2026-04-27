package com.example.smart_erp.inventory.approvals;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.inventory.approvals.response.ApprovalsHistoryItemData;
import com.example.smart_erp.inventory.approvals.response.ApprovalsHistoryPageData;
import com.example.smart_erp.inventory.approvals.response.ApprovalsPendingItemData;
import com.example.smart_erp.inventory.approvals.response.ApprovalsPendingPageData;
import com.example.smart_erp.inventory.approvals.response.ApprovalsPendingSummaryData;

/**
 * SRS Task061–062.
 */
@Service
@Transactional(readOnly = true)
public class ApprovalsService {

	private static final DateTimeFormatter ISO_DATE = DateTimeFormatter.ISO_LOCAL_DATE;

	private final ApprovalsJdbcRepository repo;

	public ApprovalsService(ApprovalsJdbcRepository repo) {
		this.repo = repo;
	}

	public ApprovalsPendingPageData listPending(String searchRaw, String typeRaw, String fromDateRaw, String toDateRaw,
			String pageRaw, String limitRaw) {
		String type = normalizeType(typeRaw);
		LocalDate from = parseOptionalDate("fromDate", fromDateRaw);
		LocalDate to = parseOptionalDate("toDate", toDateRaw);
		assertDateOrder(from, to);
		int page = parsePositiveInt(pageRaw, 1);
		int limit = clamp(parsePositiveInt(limitRaw, 50), 1, 100);
		int offset = (page - 1) * limit;

		if (!showsInboundPending(type)) {
			return emptyPending(page, limit);
		}

		String sp = ApprovalsJdbcRepository.toSearchPatternOrNull(searchRaw);
		long total = repo.countPending(sp, from, to);
		List<ApprovalsPendingItemData> items = repo.loadPendingPage(sp, from, to, limit, offset);
		var summary = buildPendingSummary(total);
		return new ApprovalsPendingPageData(summary, items, page, limit, total);
	}

	public ApprovalsHistoryPageData listHistory(String resolutionRaw, String searchRaw, String typeRaw,
			String fromDateRaw, String toDateRaw, String pageRaw, String limitRaw) {
		String resolution = normalizeResolution(resolutionRaw);
		String type = normalizeType(typeRaw);
		LocalDate from = parseOptionalDate("fromDate", fromDateRaw);
		LocalDate to = parseOptionalDate("toDate", toDateRaw);
		assertDateOrder(from, to);
		int page = parsePositiveInt(pageRaw, 1);
		int limit = clamp(parsePositiveInt(limitRaw, 20), 1, 100);
		int offset = (page - 1) * limit;

		if (!showsInboundHistory(type)) {
			return new ApprovalsHistoryPageData(List.of(), page, limit, 0L);
		}

		String sp = ApprovalsJdbcRepository.toSearchPatternOrNull(searchRaw);
		long total = repo.countHistory(sp, from, to, resolution);
		List<ApprovalsHistoryItemData> items = repo.loadHistoryPage(sp, from, to, resolution, limit, offset);
		return new ApprovalsHistoryPageData(items, page, limit, total);
	}

	private static void assertDateOrder(LocalDate from, LocalDate to) {
		if (from != null && to != null && from.isAfter(to)) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Ngày bắt đầu không được sau ngày kết thúc.",
					Map.of("fromDate", "fromDate phải nhỏ hơn hoặc bằng toDate"));
		}
	}

	private static ApprovalsPendingPageData emptyPending(int page, int limit) {
		return new ApprovalsPendingPageData(buildPendingSummary(0L), List.of(), page, limit, 0L);
	}

	private static ApprovalsPendingSummaryData buildPendingSummary(long inboundCount) {
		Map<String, Long> byType = new LinkedHashMap<>();
		byType.put("Inbound", inboundCount);
		byType.put("Outbound", 0L);
		byType.put("Return", 0L);
		byType.put("Debt", 0L);
		return new ApprovalsPendingSummaryData(inboundCount, byType);
	}

	/** MVP: chỉ stock receipt → Inbound; các type khác không có dòng pending. */
	private static boolean showsInboundPending(String typeNormalized) {
		return "all".equals(typeNormalized) || "Inbound".equals(typeNormalized);
	}

	private static boolean showsInboundHistory(String typeNormalized) {
		return "all".equals(typeNormalized) || "Inbound".equals(typeNormalized);
	}

	private static String normalizeType(String raw) {
		if (!StringUtils.hasText(raw)) {
			return "all";
		}
		String t = raw.trim();
		if ("all".equalsIgnoreCase(t)) {
			return "all";
		}
		if ("inbound".equalsIgnoreCase(t)) {
			return "Inbound";
		}
		if ("outbound".equalsIgnoreCase(t)) {
			return "Outbound";
		}
		if ("return".equalsIgnoreCase(t)) {
			return "Return";
		}
		if ("debt".equalsIgnoreCase(t)) {
			return "Debt";
		}
		throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Tham số type không hợp lệ.");
	}

	private static String normalizeResolution(String raw) {
		if (!StringUtils.hasText(raw)) {
			return "all";
		}
		String r = raw.trim();
		if ("all".equalsIgnoreCase(r)) {
			return "all";
		}
		if ("approved".equalsIgnoreCase(r)) {
			return "Approved";
		}
		if ("rejected".equalsIgnoreCase(r)) {
			return "Rejected";
		}
		throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Tham số resolution không hợp lệ.");
	}

	private static LocalDate parseOptionalDate(String paramName, String raw) {
		if (!StringUtils.hasText(raw)) {
			return null;
		}
		try {
			return LocalDate.parse(raw.trim(), ISO_DATE);
		}
		catch (DateTimeParseException e) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Định dạng ngày không hợp lệ (" + paramName + ").");
		}
	}

	private static int parsePositiveInt(String raw, int defaultValue) {
		if (!StringUtils.hasText(raw)) {
			return defaultValue;
		}
		try {
			int v = Integer.parseInt(raw.trim());
			return v >= 1 ? v : defaultValue;
		}
		catch (NumberFormatException e) {
			return defaultValue;
		}
	}

	private static int clamp(int v, int min, int max) {
		return Math.min(max, Math.max(min, v));
	}
}
