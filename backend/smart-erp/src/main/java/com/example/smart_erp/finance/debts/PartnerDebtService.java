package com.example.smart_erp.finance.debts;

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
import com.example.smart_erp.finance.debts.PartnerDebtJdbcRepository.DebtLockRow;
import com.example.smart_erp.finance.debts.request.DebtCreateRequest;
import com.example.smart_erp.finance.debts.response.PartnerDebtItemData;
import com.example.smart_erp.finance.debts.response.PartnerDebtPageData;
import com.example.smart_erp.inventory.receipts.lifecycle.StockReceiptAccessPolicy;
import com.fasterxml.jackson.databind.JsonNode;

import org.springframework.security.oauth2.jwt.Jwt;

/**
 * SRS Task069–072 — nghiệp vụ sổ nợ.
 */
@Service
@SuppressWarnings("null")
public class PartnerDebtService {

	private static final Set<String> PATCH_KEYS_IN_DEBT = Set.of("totalAmount", "paidAmount", "paymentAmount", "dueDate", "notes");
	private static final Set<String> PATCH_KEYS_CLEARED = Set.of("dueDate", "notes");

	private static final String MSG_NOT_FOUND = "Không tìm thấy khoản nợ";
	private static final String MSG_FORBIDDEN = "Bạn không có quyền thực hiện thao tác này.";
	private static final String MSG_PATCH_EMPTY = "Thông tin không hợp lệ: cần ít nhất một trường cập nhật";
	private static final String MSG_CLEARED_MONEY = "Khoản nợ đã được thanh toán đủ. Không thể thay đổi số tiền trên phiếu này. Bạn vẫn có thể cập nhật ghi chú hoặc hạn thanh toán nếu cần.";
	private static final String MSG_BAD_PARTNER = "Thông tin đối tác không hợp lệ hoặc không tồn tại.";
	private static final String MSG_PAID_BOTH = "Thông tin không hợp lệ: chỉ được dùng một trong hai trường paidAmount hoặc paymentAmount.";
	private static final String MSG_BAD_FIELD = "Thông tin không hợp lệ: trường không được phép";

	private final PartnerDebtJdbcRepository repo;

	public PartnerDebtService(PartnerDebtJdbcRepository repo) {
		this.repo = repo;
	}

	public PartnerDebtPageData list(String partnerTypeRaw, String statusRaw, String dueDateFromRaw, String dueDateToRaw, String searchRaw,
			String pageRaw, String limitRaw) {
		String partnerType = normalizePartnerTypeOrNull(partnerTypeRaw);
		String status = normalizeStatusOrNull(statusRaw);
		LocalDate dueFrom = parseDateOrNull(dueDateFromRaw, "dueDateFrom");
		LocalDate dueTo = parseDateOrNull(dueDateToRaw, "dueDateTo");
		if (dueFrom != null && dueTo != null && dueFrom.isAfter(dueTo)) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Khoảng ngày không hợp lệ: ngày bắt đầu không được sau ngày kết thúc.");
		}
		int page = parsePositiveInt(pageRaw, 1, 1, 1_000_000, "page");
		int limit = parsePositiveInt(limitRaw, 20, 1, 100, "limit");
		String sp = PartnerDebtJdbcRepository.toSearchPatternOrNull(searchRaw);
		long total = repo.countList(partnerType, status, dueFrom, dueTo, sp);
		int offset = (page - 1) * limit;
		var items = repo.loadPage(partnerType, status, dueFrom, dueTo, sp, limit, offset);
		return new PartnerDebtPageData(items, page, limit, total);
	}

	public PartnerDebtItemData getById(long id) {
		return repo.findItemById(id).orElseThrow(() -> new BusinessException(ApiErrorCode.NOT_FOUND, MSG_NOT_FOUND));
	}

	@Transactional
	public PartnerDebtItemData create(DebtCreateRequest req, Jwt jwt) {
		int uid = StockReceiptAccessPolicy.parseUserId(jwt);
		String ptype = normalizePartnerTypeRequired(req.partnerType());
		validatePartnerIds(repo, ptype, req.customerId(), req.supplierId());
		BigDecimal paid = req.paidAmount() != null ? req.paidAmount().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2);
		BigDecimal total = req.totalAmount().setScale(2, RoundingMode.HALF_UP);
		if (paid.compareTo(total) > 0) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: paidAmount không được vượt totalAmount");
		}
		String notes = normalizeNotes(req.notes());
		String st = paid.compareTo(total) >= 0 ? "Cleared" : "InDebt";
		int year = LocalDate.now().getYear();
		int cust = req.customerId() != null ? req.customerId() : 0;
		int supp = req.supplierId() != null ? req.supplierId() : 0;
		int next = repo.nextDebtCodeSequenceSuffix(year) + 1;
		String code = String.format("NO-%d-%04d", year, next);
		long id = repo.insert(code, ptype, cust, supp, total, paid, req.dueDate(), st, notes, uid);
		return repo.findItemById(id).orElseThrow(() -> new IllegalStateException("Không load được bản ghi vừa tạo"));
	}

	@Transactional
	public PartnerDebtItemData patch(long id, JsonNode body, Jwt jwt) {
		if (body == null || !body.isObject() || body.isEmpty()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, MSG_PATCH_EMPTY);
		}
		int uid = StockReceiptAccessPolicy.parseUserId(jwt);
		Iterator<String> it = body.fieldNames();
		while (it.hasNext()) {
			String k = it.next();
			if (!PATCH_KEYS_IN_DEBT.contains(k)) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, MSG_BAD_FIELD + ": " + k);
			}
		}
		DebtLockRow row = repo.lockForUpdate(id).orElseThrow(() -> new BusinessException(ApiErrorCode.NOT_FOUND, MSG_NOT_FOUND));
		if (row.createdBy() != uid) {
			throw new BusinessException(ApiErrorCode.FORBIDDEN, MSG_FORBIDDEN);
		}
		boolean hasMoneyField = body.has("totalAmount") || body.has("paidAmount") || body.has("paymentAmount");
		if ("Cleared".equals(row.status())) {
			if (hasMoneyField) {
				throw new BusinessException(ApiErrorCode.CONFLICT, MSG_CLEARED_MONEY);
			}
			Iterator<String> it2 = body.fieldNames();
			while (it2.hasNext()) {
				if (!PATCH_KEYS_CLEARED.contains(it2.next())) {
					throw new BusinessException(ApiErrorCode.BAD_REQUEST, MSG_BAD_FIELD);
				}
			}
			LocalDate due = row.dueDate();
			if (body.has("dueDate")) {
				due = readDueDateOrNull(body.get("dueDate"));
			}
			String notes = row.notes();
			if (body.has("notes")) {
				notes = readNotes(body.get("notes"));
			}
			repo.updateRow(id, row.totalAmount(), row.paidAmount(), due, notes, "Cleared");
			return repo.findItemById(id).orElseThrow();
		}
		// InDebt
		if (body.has("paidAmount") && body.has("paymentAmount")) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, MSG_PAID_BOTH);
		}
		BigDecimal newTotal = row.totalAmount();
		if (body.has("totalAmount")) {
			newTotal = readNonNegativeMoney(body.get("totalAmount"), "totalAmount");
		}
		BigDecimal newPaid = row.paidAmount();
		if (body.has("paymentAmount")) {
			BigDecimal add = readPositiveMoney(body.get("paymentAmount"), "paymentAmount");
			BigDecimal sum = row.paidAmount().add(add);
			newPaid = (sum.compareTo(newTotal) > 0 ? newTotal : sum).setScale(2, RoundingMode.HALF_UP);
		}
		else if (body.has("paidAmount")) {
			newPaid = readNonNegativeMoney(body.get("paidAmount"), "paidAmount");
		}
		if (newPaid.compareTo(newTotal) > 0) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: paidAmount không được vượt totalAmount");
		}
		LocalDate due = row.dueDate();
		if (body.has("dueDate")) {
			due = readDueDateOrNull(body.get("dueDate"));
		}
		String notes = row.notes();
		if (body.has("notes")) {
			notes = readNotes(body.get("notes"));
		}
		String newStatus = newPaid.compareTo(newTotal) >= 0 ? "Cleared" : "InDebt";
		repo.updateRow(id, newTotal, newPaid, due, notes, newStatus);
		return repo.findItemById(id).orElseThrow();
	}

	private static void validatePartnerIds(PartnerDebtJdbcRepository repo, String ptype, Integer customerId, Integer supplierId) {
		if ("Customer".equals(ptype)) {
			if (customerId == null || customerId <= 0 || !repo.existsCustomer(customerId)) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, MSG_BAD_PARTNER);
			}
		}
		else if ("Supplier".equals(ptype)) {
			if (supplierId == null || supplierId <= 0 || !repo.existsSupplier(supplierId)) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, MSG_BAD_PARTNER);
			}
		}
	}

	private static String normalizePartnerTypeOrNull(String raw) {
		if (!StringUtils.hasText(raw)) {
			return null;
		}
		return normalizePartnerTypeRequired(raw);
	}

	private static String normalizePartnerTypeRequired(String raw) {
		String t = raw.trim();
		if ("Customer".equalsIgnoreCase(t)) {
			return "Customer";
		}
		if ("Supplier".equalsIgnoreCase(t)) {
			return "Supplier";
		}
		throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: partnerType");
	}

	private static String normalizeStatusOrNull(String raw) {
		if (!StringUtils.hasText(raw)) {
			return null;
		}
		String t = raw.trim();
		if ("InDebt".equalsIgnoreCase(t)) {
			return "InDebt";
		}
		if ("Cleared".equalsIgnoreCase(t)) {
			return "Cleared";
		}
		throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: status");
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

	private static String normalizeNotes(String notes) {
		if (!StringUtils.hasText(notes)) {
			return null;
		}
		String t = notes.trim();
		if (t.length() > 5000) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: notes quá dài");
		}
		return t;
	}

	private static LocalDate readDueDateOrNull(JsonNode n) {
		if (n == null || n.isNull()) {
			return null;
		}
		if (!n.isTextual()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: dueDate");
		}
		return LocalDate.parse(n.asText().trim());
	}

	private static String readNotes(JsonNode n) {
		if (n == null || n.isNull()) {
			return null;
		}
		if (!n.isTextual()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: notes");
		}
		String t = n.asText();
		if (t.length() > 5000) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: notes quá dài");
		}
		return t.isEmpty() ? null : t;
	}

	private static BigDecimal readPositiveMoney(JsonNode n, String field) {
		if (n == null || !n.isNumber()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: " + field);
		}
		BigDecimal v = n.decimalValue().setScale(2, RoundingMode.HALF_UP);
		if (v.compareTo(BigDecimal.ZERO) <= 0) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: " + field);
		}
		return v;
	}

	private static BigDecimal readNonNegativeMoney(JsonNode n, String field) {
		if (n == null || !n.isNumber()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: " + field);
		}
		BigDecimal v = n.decimalValue().setScale(2, RoundingMode.HALF_UP);
		if (v.compareTo(BigDecimal.ZERO) < 0) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: " + field);
		}
		return v;
	}
}
