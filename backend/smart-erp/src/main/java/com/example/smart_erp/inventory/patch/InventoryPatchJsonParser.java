package com.example.smart_erp.inventory.patch;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import com.fasterxml.jackson.databind.JsonNode;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;

/**
 * Validate body PATCH theo SRS Task007 / API_Task007.
 */
public final class InventoryPatchJsonParser {

	private static final Set<String> ALLOWED = Set.of("locationId", "minQuantity", "batchNumber", "expiryDate",
			"unitId");

	private static final Map<String, String> DENY_DETAILS = Map.of(
			"quantity", "Thay đổi số lượng thực tế phải dùng POST /api/v1/inventory/adjustments (Task010)",
			"costPrice", "Không được phép cập nhật trường này qua API này",
			"productId", "Không được phép cập nhật trường này qua API này");

	private InventoryPatchJsonParser() {
	}

	public static ParsedInventoryPatch parse(JsonNode body) {
		if (body == null || body.isNull() || !body.isObject()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
					Map.of("body", "Nội dung JSON phải là object"));
		}
		var names = new HashSet<String>();
		body.fieldNames().forEachRemaining(names::add);
		for (String name : names) {
			if (ALLOWED.contains(name)) {
				continue;
			}
			if (DENY_DETAILS.containsKey(name)) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Không được phép cập nhật trường này qua API này",
						Map.of(name, DENY_DETAILS.get(name)));
			}
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
					Map.of(name, "Trường không được hỗ trợ"));
		}

		Optional<Integer> locationId = Optional.empty();
		if (body.has("locationId")) {
			JsonNode n = body.get("locationId");
			if (n.isNull()) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
						Map.of("locationId", "Giá trị không hợp lệ"));
			}
			locationId = Optional.of(readPositiveInt(n, "locationId"));
		}

		Optional<Integer> minQuantity = Optional.empty();
		if (body.has("minQuantity")) {
			JsonNode n = body.get("minQuantity");
			if (n.isNull()) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
						Map.of("minQuantity", "minQuantity là bắt buộc kiểu số không âm"));
			}
			int v = readNonNegativeInt(n, "minQuantity");
			minQuantity = Optional.of(v);
		}

		Optional<Optional<String>> batchNumber = Optional.empty();
		if (body.has("batchNumber")) {
			JsonNode n = body.get("batchNumber");
			if (n.isNull()) {
				batchNumber = Optional.of(Optional.empty());
			}
			else if (!n.isTextual()) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
						Map.of("batchNumber", "Phải là chuỗi hoặc null"));
			}
			else {
				String s = n.asText();
				if (s.length() > 100) {
					throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
							Map.of("batchNumber", "Tối đa 100 ký tự"));
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
						Map.of("expiryDate", "Định dạng phải là YYYY-MM-DD"));
			}
			else {
				String t = n.asText().trim();
				try {
					expiryDate = Optional.of(Optional.of(LocalDate.parse(t)));
				}
				catch (DateTimeParseException e) {
					throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
							Map.of("expiryDate", "Định dạng phải là YYYY-MM-DD"));
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
				unitId = Optional.of(Optional.of(readPositiveInt(n, "unitId")));
			}
		}

		var parsed = new ParsedInventoryPatch(locationId, minQuantity, batchNumber, expiryDate, unitId);
		if (parsed.hasNoUpdates()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of("body",
					"Cần ít nhất một trường để cập nhật"));
		}
		return parsed;
	}

	private static int readPositiveInt(JsonNode n, String field) {
		int v = readIntStrict(n, field);
		if (v <= 0) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
					Map.of(field, "Phải là số nguyên dương"));
		}
		return v;
	}

	private static int readNonNegativeInt(JsonNode n, String field) {
		int v = readIntStrict(n, field);
		if (v < 0) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
					Map.of(field, "Phải >= 0"));
		}
		return v;
	}

	private static int readIntStrict(JsonNode n, String field) {
		if (!n.isNumber() || !n.isIntegralNumber()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
					Map.of(field, "Phải là số nguyên"));
		}
		long lv = n.longValue();
		if (lv > Integer.MAX_VALUE || lv < Integer.MIN_VALUE) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
					Map.of(field, "Giá trị vượt phạm vi"));
		}
		return (int) lv;
	}
}
