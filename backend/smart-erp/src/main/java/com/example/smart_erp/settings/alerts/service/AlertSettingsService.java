package com.example.smart_erp.settings.alerts.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.inventory.receipts.lifecycle.StockReceiptAccessPolicy;
import com.example.smart_erp.settings.alerts.dto.AlertSettingCreateRequest;
import com.example.smart_erp.settings.alerts.model.AlertFrequency;
import com.example.smart_erp.settings.alerts.model.AlertType;
import com.example.smart_erp.settings.alerts.repository.AlertSettingsJdbcRepository;
import com.example.smart_erp.settings.alerts.response.AlertSettingItemData;
import com.example.smart_erp.settings.alerts.response.AlertSettingsListData;
import com.example.smart_erp.users.repository.UsersListJdbcRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Task082–085 — alert settings CRUD.
 */
@Service
@SuppressWarnings("null")
public class AlertSettingsService {

	private static final Set<String> PATCH_KEYS = Set.of("thresholdValue", "channel", "frequency", "isEnabled", "recipients");

	private static final String MSG_PATCH_EMPTY = "Thông tin không hợp lệ: cần ít nhất một trường cập nhật";
	private static final String MSG_BAD_FIELD = "Thông tin không hợp lệ: trường không được phép";

	private final AlertSettingsJdbcRepository repo;
	private final UsersListJdbcRepository usersRepo;
	private final ObjectMapper objectMapper;

	public AlertSettingsService(AlertSettingsJdbcRepository repo, UsersListJdbcRepository usersRepo, ObjectMapper objectMapper) {
		this.repo = repo;
		this.usersRepo = usersRepo;
		this.objectMapper = objectMapper;
	}

	@Transactional(readOnly = true)
	public AlertSettingsListData list(Integer ownerId, String alertType, Boolean isEnabled, Jwt jwt) {
		String role = requireRole(jwt);
		if ("Owner".equalsIgnoreCase(role)) {
			int effectiveOwnerId = StockReceiptAccessPolicy.parseUserId(jwt);
			return AlertSettingsListData.of(repo.list(effectiveOwnerId, alertType, isEnabled));
		}
		if ("Admin".equalsIgnoreCase(role)) {
			return AlertSettingsListData.of(repo.list(ownerId, alertType, isEnabled));
		}
		throw new BusinessException(ApiErrorCode.FORBIDDEN, "Bạn không có quyền thực hiện thao tác này");
	}

	@Transactional
	public AlertSettingItemData create(AlertSettingCreateRequest req, Jwt jwt) {
		assertOwnerOnly(jwt);
		int ownerId = StockReceiptAccessPolicy.parseUserId(jwt);

		AlertType type = req.alertType();
		BigDecimal threshold = normalizeThreshold(type, req.thresholdValue());

		String frequency = req.frequency() != null ? req.frequency().name() : AlertFrequency.Realtime.name();
		boolean enabled = req.isEnabled() != null ? req.isEnabled().booleanValue() : true;
		String recipientsJson = encodeRecipients(req.recipients());

		try {
			return repo.insert(ownerId, type.name(), threshold, req.channel().name(), frequency, enabled, recipientsJson)
					.orElseThrow(() -> new IllegalStateException("Không tạo được cấu hình cảnh báo"));
		}
		catch (DataIntegrityViolationException e) {
			throw new BusinessException(ApiErrorCode.CONFLICT, "Bạn đã có cấu hình cho loại cảnh báo này");
		}
	}

	@Transactional
	public AlertSettingItemData patch(long id, JsonNode body, Jwt jwt) {
		assertOwnerOnly(jwt);
		if (body == null || !body.isObject() || body.isEmpty()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, MSG_PATCH_EMPTY, Map.of("body", "Cần ít nhất một trường"));
		}

		int ownerId = StockReceiptAccessPolicy.parseUserId(jwt);
		for (var it = body.fieldNames(); it.hasNext();) {
			String k = it.next();
			if (!PATCH_KEYS.contains(k)) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, MSG_BAD_FIELD + ": " + k);
			}
		}

		boolean setThreshold = body.has("thresholdValue");
		BigDecimal threshold = null;
		if (setThreshold) {
			threshold = readNullableNonNegativeDecimal(body.get("thresholdValue"), "thresholdValue");
		}

		String channel = body.has("channel") ? readNullableEnumString(body.get("channel"), "channel") : null;
		String frequency = body.has("frequency") ? readNullableEnumString(body.get("frequency"), "frequency") : null;
		Boolean isEnabled = body.has("isEnabled") ? readNullableBoolean(body.get("isEnabled"), "isEnabled") : null;

		boolean setRecipients = body.has("recipients");
		String recipientsJson = null;
		if (setRecipients) {
			recipientsJson = encodeRecipients(readNullableRecipients(body.get("recipients")));
		}

		if (setThreshold) {
			String typeRaw = repo.findAlertTypeByIdAndOwner(id, ownerId)
					.orElseThrow(() -> new BusinessException(ApiErrorCode.NOT_FOUND, "Không tìm thấy cấu hình cảnh báo"));
			AlertType t;
			try {
				t = AlertType.valueOf(typeRaw);
			}
			catch (Exception e) {
				t = null;
			}
			if (t != null) {
				threshold = normalizeThreshold(t, threshold);
			}
			else {
				threshold = null;
			}
		}

		return repo.patchByIdAndOwner(id, ownerId, threshold, setThreshold, channel, frequency, isEnabled, recipientsJson, setRecipients)
				.orElseThrow(() -> new BusinessException(ApiErrorCode.NOT_FOUND, "Không tìm thấy cấu hình cảnh báo"));
	}

	@Transactional
	public void softDisable(long id, Jwt jwt) {
		assertOwnerOnly(jwt);
		int ownerId = StockReceiptAccessPolicy.parseUserId(jwt);
		int n = repo.softDisableByIdAndOwner(id, ownerId);
		if (n <= 0) {
			throw new BusinessException(ApiErrorCode.NOT_FOUND, "Không tìm thấy cấu hình cảnh báo");
		}
	}

	private static String requireRole(Jwt jwt) {
		String role = jwt.getClaimAsString("role");
		if (!StringUtils.hasText(role)) {
			throw new BusinessException(ApiErrorCode.FORBIDDEN, "Bạn không có quyền thực hiện thao tác này");
		}
		return role.trim();
	}

	private static void assertOwnerOnly(Jwt jwt) {
		String role = jwt.getClaimAsString("role");
		if (!StringUtils.hasText(role) || !"Owner".equalsIgnoreCase(role.trim())) {
			throw new BusinessException(ApiErrorCode.FORBIDDEN, "Chỉ tài khoản Owner mới được cấu hình cảnh báo");
		}
	}

	private static BigDecimal normalizeThreshold(AlertType alertType, BigDecimal threshold) {
		if (threshold == null) {
			return null;
		}
		if (threshold.signum() < 0) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of("thresholdValue", "Không hợp lệ"));
		}
		// allow only some types; other types ignore threshold
		return switch (alertType) {
			case LowStock, ExpiryDate, HighValueTransaction, PartnerDebtDueSoon -> threshold;
			default -> null;
		};
	}

	private String encodeRecipients(List<String> recipients) {
		if (recipients == null) {
			return null;
		}
		if (!recipients.isEmpty()) {
			assertUsernamesExist(recipients);
		}
		try {
			return objectMapper.writeValueAsString(recipients);
		}
		catch (JsonProcessingException e) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of("recipients", "Không hợp lệ"));
		}
	}

	private void assertUsernamesExist(List<String> usernames) {
		var normalized = usernames.stream()
				.filter(StringUtils::hasText)
				.map(s -> s.trim())
				.filter(s -> !s.isEmpty())
				.collect(Collectors.toList());
		if (normalized.isEmpty()) {
			return;
		}
		var exists = usersRepo.findExistingUsernames(normalized);
		var missing = normalized.stream().filter(u -> !exists.contains(u)).distinct().limit(10).toList();
		if (!missing.isEmpty()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
					Map.of("recipients", "Không tìm thấy username: " + String.join(", ", missing)));
		}
	}

	private static BigDecimal readNullableNonNegativeDecimal(JsonNode n, String field) {
		if (n == null || n.isNull()) {
			return null;
		}
		if (!n.isNumber()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of(field, "Không hợp lệ"));
		}
		BigDecimal v = n.decimalValue();
		if (v.signum() < 0) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of(field, "Không hợp lệ"));
		}
		return v;
	}

	private static Boolean readNullableBoolean(JsonNode n, String field) {
		if (n == null || n.isNull()) {
			return null;
		}
		if (!n.isBoolean()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of(field, "Không hợp lệ"));
		}
		return n.booleanValue();
	}

	private static String readNullableEnumString(JsonNode n, String field) {
		if (n == null || n.isNull()) {
			return null;
		}
		if (!n.isTextual()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of(field, "Không hợp lệ"));
		}
		String t = n.asText();
		if (!StringUtils.hasText(t)) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of(field, "Không hợp lệ"));
		}
		return t.trim();
	}

	private static List<String> readNullableRecipients(JsonNode n) {
		if (n == null || n.isNull()) {
			return null;
		}
		if (!n.isArray()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of("recipients", "Không hợp lệ"));
		}
		if (n.size() > 50) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of("recipients", "Quá nhiều người nhận"));
		}
		var out = new java.util.ArrayList<String>();
		for (JsonNode it : n) {
			if (it == null || it.isNull() || !it.isTextual() || !StringUtils.hasText(it.asText())) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of("recipients", "Không hợp lệ"));
			}
			String u = it.asText().trim();
			if (u.length() > 100) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of("recipients", "Không hợp lệ"));
			}
			out.add(u);
		}
		return out;
	}
}

