package com.example.smart_erp.inventory.patch;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import com.fasterxml.jackson.databind.JsonNode;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;

/**
 * Parse body bulk PATCH — SRS Task008 (OQ-2 max 100, OQ-4 bỏ phần tử chỉ có {@code id}).
 */
public final class InventoryBulkPatchJsonParser {

	public static final int MAX_ITEMS = 100;

	private static final Set<String> ALLOWED = Set.of("id", "locationId", "minQuantity", "batchNumber", "expiryDate",
			"unitId");

	private static final Map<String, String> DENY_DETAILS = Map.of(
			"quantity", "Thay đổi số lượng thực tế phải dùng POST /api/v1/inventory/adjustments",
			"costPrice", "Không được phép cập nhật trường này qua API này",
			"productId", "Không được phép cập nhật trường này qua API này");

	private InventoryBulkPatchJsonParser() {
	}

	public record BulkWorkItem(int requestIndex, long inventoryId, ParsedInventoryPatch patch) {
	}

	/**
	 * Trả danh sách công việc đã lọc (bỏ phần tử chỉ id), sắp xếp {@code inventoryId} tăng dần; ném 400 nếu không còn
	 * phần tử nào cần cập nhật / trùng id / vượt ngưỡng.
	 */
	public static List<BulkWorkItem> parseAndPrepare(JsonNode root) {
		if (root == null || root.isNull() || !root.isObject()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
					Map.of("body", "Nội dung JSON phải là object"));
		}
		if (!root.has("items") || !root.get("items").isArray()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
					Map.of("items", "Thiếu mảng items"));
		}
		JsonNode arr = root.get("items");
		if (arr.isEmpty()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
					Map.of("items", "Cần ít nhất một phần tử"));
		}
		var raw = new ArrayList<BulkWorkItem>();
		for (int i = 0; i < arr.size(); i++) {
			JsonNode el = arr.get(i);
			if (el == null || el.isNull() || !el.isObject()) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
						Map.of("items[" + i + "]", "Mỗi phần tử phải là object"));
			}
			Optional<BulkWorkItem> opt = tryParseItem(el, i);
			opt.ifPresent(raw::add);
		}
		if (raw.isEmpty()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of("items",
					"Không có phần tử nào chứa thông tin cần cập nhật (mỗi phần tử cần ít nhất một trường ngoài id)"));
		}
		if (raw.size() > MAX_ITEMS) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
					Map.of("items", "Vượt quá " + MAX_ITEMS + " phần tử cho một lần gọi"));
		}
		// trùng id
		var seen = new HashSet<Long>();
		for (BulkWorkItem w : raw) {
			if (!seen.add(w.inventoryId())) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
						Map.of("items[" + w.requestIndex() + "].id", "Trùng id trong danh sách"));
			}
		}
		raw.sort(Comparator.comparingLong(BulkWorkItem::inventoryId));
		return raw;
	}

	private static Optional<BulkWorkItem> tryParseItem(JsonNode body, int index) {
		String pfx = "items[" + index + "].";
		var names = new HashSet<String>();
		body.fieldNames().forEachRemaining(names::add);
		for (String name : names) {
			if (ALLOWED.contains(name)) {
				continue;
			}
			if (DENY_DETAILS.containsKey(name)) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Không được phép cập nhật trường này qua API này",
						Map.of(pfx + name, DENY_DETAILS.get(name)));
			}
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
					Map.of(pfx + name, "Trường không được hỗ trợ"));
		}
		if (!body.has("id") || body.get("id").isNull()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
					Map.of(pfx + "id", "Trường id là bắt buộc"));
		}
		long id = readPositiveLong(body.get("id"), pfx + "id");

		Optional<Integer> locationId = Optional.empty();
		if (body.has("locationId")) {
			JsonNode n = body.get("locationId");
			if (n.isNull()) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
						Map.of(pfx + "locationId", "Giá trị không hợp lệ"));
			}
			locationId = Optional.of(readPositiveInt(n, pfx + "locationId"));
		}

		Optional<Integer> minQuantity = Optional.empty();
		if (body.has("minQuantity")) {
			JsonNode n = body.get("minQuantity");
			if (n.isNull()) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
						Map.of(pfx + "minQuantity", "minQuantity là bắt buộc kiểu số không âm"));
			}
			minQuantity = Optional.of(readNonNegativeInt(n, pfx + "minQuantity"));
		}

		Optional<Optional<String>> batchNumber = Optional.empty();
		if (body.has("batchNumber")) {
			JsonNode n = body.get("batchNumber");
			if (n.isNull()) {
				batchNumber = Optional.of(Optional.empty());
			}
			else if (!n.isTextual()) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
						Map.of(pfx + "batchNumber", "Phải là chuỗi hoặc null"));
			}
			else {
				String s = n.asText();
				if (s.length() > 100) {
					throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
							Map.of(pfx + "batchNumber", "Tối đa 100 ký tự"));
				}
				batchNumber = Optional.of(Optional.of(s));
			}
		}

		Optional<Optional<LocalDate>> expiryDate = Optional.empty();
		if (body.has("expiryDate")) {
			JsonNode n = body.get("expiryDate");
			if (n.isNull()) {
				expiryDate = Optional.of(Optional.empty());
			}
			else if (!n.isTextual()) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
						Map.of(pfx + "expiryDate", "Định dạng phải là YYYY-MM-DD"));
			}
			else {
				String t = n.asText().trim();
				try {
					expiryDate = Optional.of(Optional.of(LocalDate.parse(t)));
				}
				catch (DateTimeParseException e) {
					throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
							Map.of(pfx + "expiryDate", "Định dạng phải là YYYY-MM-DD"));
				}
			}
		}

		Optional<Optional<Integer>> unitId = Optional.empty();
		if (body.has("unitId")) {
			JsonNode n = body.get("unitId");
			if (n.isNull()) {
				unitId = Optional.of(Optional.empty());
			}
			else {
				unitId = Optional.of(Optional.of(readPositiveInt(n, pfx + "unitId")));
			}
		}

		var parsed = new ParsedInventoryPatch(locationId, minQuantity, batchNumber, expiryDate, unitId);
		if (parsed.hasNoUpdates()) {
			return Optional.empty();
		}
		return Optional.of(new BulkWorkItem(index, id, parsed));
	}

	private static long readPositiveLong(JsonNode n, String fieldKey) {
		if (!n.isNumber() || !n.isIntegralNumber()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
					Map.of(fieldKey, "Phải là số nguyên dương"));
		}
		long v = n.longValue();
		if (v <= 0 || v > Integer.MAX_VALUE) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
					Map.of(fieldKey, "Phải là số nguyên dương"));
		}
		return v;
	}

	private static int readPositiveInt(JsonNode n, String fieldKey) {
		int v = readIntStrict(n, fieldKey);
		if (v <= 0) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
					Map.of(fieldKey, "Phải là số nguyên dương"));
		}
		return v;
	}

	private static int readNonNegativeInt(JsonNode n, String fieldKey) {
		int v = readIntStrict(n, fieldKey);
		if (v < 0) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of(fieldKey, "Phải >= 0"));
		}
		return v;
	}

	private static int readIntStrict(JsonNode n, String fieldKey) {
		if (!n.isNumber() || !n.isIntegralNumber()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
					Map.of(fieldKey, "Phải là số nguyên"));
		}
		long lv = n.longValue();
		if (lv > Integer.MAX_VALUE || lv < Integer.MIN_VALUE) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
					Map.of(fieldKey, "Giá trị vượt phạm vi"));
		}
		return (int) lv;
	}

	/** Tiện test: map key prefix → message. */
	public static Map<String, String> prefixedDetails(BusinessException ex, String prefix) {
		if (ex.getDetails() == null) {
			return Map.of();
		}
		var m = new LinkedHashMap<String, String>();
		ex.getDetails().forEach((k, v) -> m.put(prefix + k, v));
		return m;
	}
}
