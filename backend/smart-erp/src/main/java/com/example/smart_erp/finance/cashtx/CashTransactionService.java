package com.example.smart_erp.finance.cashtx;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Iterator;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.finance.cashfunds.CashFundJdbcRepository;
import com.example.smart_erp.finance.cashtx.CashTransactionJdbcRepository.CashLockRow;
import com.example.smart_erp.finance.cashtx.request.CashTransactionCreateRequest;
import com.example.smart_erp.finance.cashtx.response.CashTransactionItemData;
import com.example.smart_erp.finance.cashtx.response.CashTransactionPageData;
import com.example.smart_erp.inventory.dispatch.StockDispatchAccessPolicy;
import com.example.smart_erp.inventory.receipts.lifecycle.StockReceiptAccessPolicy;
import com.fasterxml.jackson.databind.JsonNode;

import org.springframework.security.oauth2.jwt.Jwt;

/**
 * SRS Task064–068 — nghiệp vụ giao dịch thu chi.
 */
@Service
@SuppressWarnings("null")
public class CashTransactionService {

	private static final Set<String> PATCH_KEYS_PENDING = Set.of("amount", "category", "description", "paymentMethod",
			"transactionDate", "status");

	private static final String MSG_NOT_FOUND = "Không tìm thấy giao dịch thu chi";
	private static final String MSG_NOT_CREATOR = "Chỉ người tạo phiếu mới được thực hiện thao tác này.";
	private static final String MSG_COMPLETED_LOCKED = "Không thể sửa giao dịch đã hoàn tất";
	private static final String MSG_DELETE_CONFLICT = "Không thể xóa giao dịch đã hoàn tất hoặc đã liên kết sổ cái";
	private static final String MSG_FUND_NOT_FOUND = "Không tìm thấy quỹ được chọn.";
	private static final String MSG_PATCH_EMPTY = "Thông tin không hợp lệ: cần ít nhất một trường cập nhật";
	private static final String MSG_BAD_STATUS_POST = "Thông tin không hợp lệ: trạng thái không hợp lệ";
	private static final String MSG_CANCELLED_PATCH = "Không thể sửa giao dịch đã huỷ ngoài trường mô tả";

	private final CashTransactionJdbcRepository repo;
	private final CashFundJdbcRepository cashFundRepo;

	public CashTransactionService(CashTransactionJdbcRepository repo, CashFundJdbcRepository cashFundRepo) {
		this.repo = repo;
		this.cashFundRepo = cashFundRepo;
	}

	public CashTransactionPageData list(String type, String status, String dateFromRaw, String dateToRaw, String fundIdRaw,
			String searchRaw, String pageRaw, String limitRaw) {
		String direction = mapTypeToDirection(type);
		LocalDate dateFrom = parseDateOrNull(dateFromRaw, "dateFrom");
		LocalDate dateTo = parseDateOrNull(dateToRaw, "dateTo");
		if (dateFrom != null && dateTo != null && dateFrom.isAfter(dateTo)) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: khoảng ngày không đúng");
		}
		boolean sortByCreatedAt = dateFrom == null && dateTo == null;
		Integer fundId = parseOptionalFundId(fundIdRaw);
		int page = parsePositiveInt(pageRaw, 1, 1, 1_000_000, "page");
		int limit = parsePositiveInt(limitRaw, 20, 1, 100, "limit");
		long total = repo.countList(direction, status, dateFrom, dateTo, fundId,
				CashTransactionJdbcRepository.toSearchPatternOrNull(searchRaw));
		int offset = (page - 1) * limit;
		var items = repo.loadPage(direction, status, dateFrom, dateTo, fundId,
				CashTransactionJdbcRepository.toSearchPatternOrNull(searchRaw), limit, offset, sortByCreatedAt);
		return new CashTransactionPageData(items, page, limit, total);
	}

	public CashTransactionItemData getById(long id) {
		return repo.findItemById(id).orElseThrow(() -> new BusinessException(ApiErrorCode.NOT_FOUND, MSG_NOT_FOUND));
	}

	@Transactional
	public CashTransactionItemData create(CashTransactionCreateRequest req, Jwt jwt) {
		int uid = StockReceiptAccessPolicy.parseUserId(jwt);
		String dir = normalizeDirection(req.direction());
		if (req.status() != null && !req.status().isBlank() && !"Pending".equalsIgnoreCase(req.status().trim())) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, MSG_BAD_STATUS_POST);
		}
		int fundId = req.fundId();
		if (!cashFundRepo.existsActiveById(fundId)) {
			throw new BusinessException(ApiErrorCode.NOT_FOUND, MSG_FUND_NOT_FOUND);
		}
		String pm = StringUtils.hasText(req.paymentMethod()) ? req.paymentMethod().trim() : "Cash";
		if (pm.length() > 30) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: paymentMethod quá dài");
		}
		BigDecimal amt = req.amount().setScale(2, RoundingMode.HALF_UP);
		int year = req.transactionDate().getYear();
		String prefix = "Income".equals(dir) ? "PT" : "PC";
		int next = repo.nextCodeSequenceSuffix(year, prefix) + 1;
		String code = String.format("%s-%d-%04d", prefix, year, next);
		String desc = req.description() != null ? req.description() : null;
		long id = repo.insert(code, dir, amt, req.category().trim(), desc, pm, req.transactionDate(), fundId, uid);
		return repo.findItemById(id).orElseThrow(() -> new IllegalStateException("Không load được bản ghi vừa tạo"));
	}

	@Transactional
	public CashTransactionItemData patch(long id, JsonNode body, Jwt jwt) {
		if (body == null || !body.isObject() || body.isEmpty()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, MSG_PATCH_EMPTY);
		}
		int uid = StockReceiptAccessPolicy.parseUserId(jwt);
		CashLockRow row = repo.lockForUpdate(id).orElseThrow(() -> new BusinessException(ApiErrorCode.NOT_FOUND, MSG_NOT_FOUND));
		assertCanMutateCashTx(row.createdBy(), uid, jwt);
		Iterator<String> names = body.fieldNames();
		while (names.hasNext()) {
			String k = names.next();
			switch (row.status()) {
				case "Pending" -> {
					if (!PATCH_KEYS_PENDING.contains(k)) {
						throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: trường không được phép: " + k);
					}
				}
				case "Completed" -> {
					if (!"status".equals(k)) {
						throw new BusinessException(ApiErrorCode.CONFLICT, MSG_COMPLETED_LOCKED);
					}
				}
				case "Cancelled" -> {
					if (!"description".equals(k)) {
						throw new BusinessException(ApiErrorCode.CONFLICT, MSG_CANCELLED_PATCH);
					}
				}
				default -> throw new BusinessException(ApiErrorCode.CONFLICT, MSG_COMPLETED_LOCKED);
			}
		}
		return switch (row.status()) {
			case "Pending" -> patchPending(row, body, uid);
			case "Completed" -> patchCompletedIdempotent(body, row.id());
			case "Cancelled" -> patchCancelledDescription(row, body, uid);
			default -> throw new BusinessException(ApiErrorCode.CONFLICT, MSG_COMPLETED_LOCKED);
		};
	}

	private CashTransactionItemData patchCancelledDescription(CashLockRow row, JsonNode body, int uid) {
		String desc = readDescription(body.get("description"));
		repo.updateRowAfterPatch(row.id(), row.amount(), row.category(), desc, row.paymentMethod(), row.transactionDate(),
				row.status(), row.financeLedgerId(), uid);
		return repo.findItemById(row.id()).orElseThrow();
	}

	private CashTransactionItemData patchCompletedIdempotent(JsonNode body, long id) {
		JsonNode st = body.get("status");
		if (st == null || !st.isTextual() || !"Completed".equalsIgnoreCase(st.asText().trim()) || body.size() != 1) {
			throw new BusinessException(ApiErrorCode.CONFLICT, MSG_COMPLETED_LOCKED);
		}
		return repo.findItemById(id).orElseThrow();
	}

	private CashTransactionItemData patchPending(CashLockRow row, JsonNode body, int uid) {
		BigDecimal amount = row.amount();
		if (body.has("amount")) {
			amount = readPositiveMoney(body.get("amount"));
		}
		String category = row.category();
		if (body.has("category")) {
			category = readNonBlankText(body.get("category"), "category", 500);
		}
		String description = row.description();
		if (body.has("description")) {
			description = readDescription(body.get("description"));
		}
		String paymentMethod = row.paymentMethod();
		if (body.has("paymentMethod")) {
			paymentMethod = readNonBlankText(body.get("paymentMethod"), "paymentMethod", 30);
		}
		LocalDate td = row.transactionDate();
		if (body.has("transactionDate")) {
			td = LocalDate.parse(body.get("transactionDate").asText().trim());
		}
		String newStatus = row.status();
		if (body.has("status")) {
			newStatus = readStatusTransition(body.get("status"));
		}
		if ("Completed".equals(newStatus)) {
			return completeCashTx(row, amount, category, description, paymentMethod, td, uid);
		}
		if ("Cancelled".equals(newStatus)) {
			if (row.financeLedgerId() != null) {
				throw new BusinessException(ApiErrorCode.CONFLICT, "Không thể huỷ giao dịch đã liên kết sổ cái");
			}
			repo.updateRowAfterPatch(row.id(), amount, category, description, paymentMethod, td, "Cancelled", null, uid);
			return repo.findItemById(row.id()).orElseThrow();
		}
		repo.updateRowAfterPatch(row.id(), amount, category, description, paymentMethod, td, "Pending", null, uid);
		return repo.findItemById(row.id()).orElseThrow();
	}

	private CashTransactionItemData completeCashTx(CashLockRow row, BigDecimal amount, String category, String description,
			String paymentMethod, LocalDate td, int uid) {
		if (row.financeLedgerId() != null) {
			return repo.findItemById(row.id()).orElseThrow();
		}
		String dir = row.direction();
		BigDecimal signed = "Income".equals(dir) ? amount : amount.negate();
		String ledgerType = "Income".equals(dir) ? "SalesRevenue" : "OperatingExpense";
		String descLedger = StringUtils.hasText(description) ? description : category;
		int ledgerId = repo.insertFinanceLedgerAndReturnId(td, ledgerType, Math.toIntExact(row.id()), signed, descLedger, row.fundId(),
				uid);
		repo.updateRowAfterPatch(row.id(), amount, category, description, paymentMethod, td, "Completed", ledgerId, uid);
		return repo.findItemById(row.id()).orElseThrow();
	}

	@Transactional
	public void delete(long id, Jwt jwt) {
		int uid = StockReceiptAccessPolicy.parseUserId(jwt);
		CashLockRow row = repo.lockForUpdate(id).orElseThrow(() -> new BusinessException(ApiErrorCode.NOT_FOUND, MSG_NOT_FOUND));
		assertCanMutateCashTx(row.createdBy(), uid, jwt);
		if (row.financeLedgerId() != null || "Completed".equals(row.status())) {
			throw new BusinessException(ApiErrorCode.CONFLICT, MSG_DELETE_CONFLICT);
		}
		if (!"Pending".equals(row.status()) && !"Cancelled".equals(row.status())) {
			throw new BusinessException(ApiErrorCode.CONFLICT, MSG_DELETE_CONFLICT);
		}
		int n = repo.deleteIfAllowed(id);
		if (n == 0) {
			throw new BusinessException(ApiErrorCode.CONFLICT, MSG_DELETE_CONFLICT);
		}
	}

	private static String readDescription(JsonNode n) {
		if (n == null || n.isNull()) {
			return null;
		}
		if (!n.isTextual()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: description");
		}
		String t = n.asText();
		if (t.length() > 2000) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: description quá dài");
		}
		return t;
	}

	private static String readNonBlankText(JsonNode n, String field, int maxLen) {
		if (n == null || !n.isTextual()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: " + field);
		}
		String t = n.asText().trim();
		if (t.isEmpty() || t.length() > maxLen) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: " + field);
		}
		return t;
	}

	private static BigDecimal readPositiveMoney(JsonNode n) {
		if (n == null || !n.isNumber()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: amount");
		}
		BigDecimal v = n.decimalValue().setScale(2, RoundingMode.HALF_UP);
		if (v.compareTo(BigDecimal.ZERO) <= 0) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: amount");
		}
		return v;
	}

	private static String readStatusTransition(JsonNode n) {
		if (n == null || !n.isTextual()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: status");
		}
		String s = n.asText().trim();
		if (!"Pending".equals(s) && !"Completed".equals(s) && !"Cancelled".equals(s)) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: status");
		}
		return s;
	}

	private static String mapTypeToDirection(String type) {
		if (!StringUtils.hasText(type)) {
			return null;
		}
		String t = type.trim();
		if ("Income".equalsIgnoreCase(t)) {
			return "Income";
		}
		if ("Expense".equalsIgnoreCase(t)) {
			return "Expense";
		}
		throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: type");
	}

	private static String normalizeDirection(String direction) {
		if (!StringUtils.hasText(direction)) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: direction");
		}
		String d = direction.trim();
		if ("Income".equalsIgnoreCase(d)) {
			return "Income";
		}
		if ("Expense".equalsIgnoreCase(d)) {
			return "Expense";
		}
		throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: direction");
	}

	private static LocalDate parseDateOrNull(String raw, String name) {
		if (!StringUtils.hasText(raw)) {
			return null;
		}
		try {
			return LocalDate.parse(raw.trim());
		}
		catch (Exception e) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: " + name);
		}
	}

	private static void assertCanMutateCashTx(int createdBy, int currentUserId, Jwt jwt) {
		if (createdBy == currentUserId) {
			return;
		}
		if (StockDispatchAccessPolicy.isAdmin(jwt)) {
			return;
		}
		throw new BusinessException(ApiErrorCode.FORBIDDEN, MSG_NOT_CREATOR);
	}

	private static Integer parseOptionalFundId(String raw) {
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
