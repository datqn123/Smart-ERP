package com.example.smart_erp.settings.alerts.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.api.ApiSuccessResponse;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.settings.alerts.dto.AlertSettingCreateRequest;
import com.example.smart_erp.settings.alerts.response.AlertSettingItemData;
import com.example.smart_erp.settings.alerts.response.AlertSettingsListData;
import com.example.smart_erp.settings.alerts.service.AlertSettingsService;
import com.fasterxml.jackson.databind.JsonNode;

import jakarta.validation.Valid;

/**
 * Task082–085 — REST alert-settings.
 */
@RestController
@RequestMapping("/api/v1/alert-settings")
@Validated
public class AlertSettingsController {

	private static final String UNAUTHORIZED_PERMIT_ALL = "Bearer JWT không được áp dụng: backend đang permit-all (mặc định APP_SECURITY_MODE). "
			+ "Đặt APP_SECURITY_MODE=jwt-api (hoặc app.security.api-protection=jwt-api), khởi động lại, đăng nhập Task001 rồi gửi lại request.";

	private static final String UNAUTHORIZED_NO_JWT_PRINCIPAL = "Không có JWT hợp lệ trong phiên bảo mật. "
			+ "Kiểm tra Header Authorization: Bearer <accessToken>; nếu đã bật jwt-api, access token có thể đã hết hạn — đăng nhập hoặc refresh lại.";

	private final AlertSettingsService service;

	public AlertSettingsController(AlertSettingsService service) {
		this.service = service;
	}

	@GetMapping
	public ResponseEntity<ApiSuccessResponse<AlertSettingsListData>> list(Authentication authentication,
			@RequestParam(value = "ownerId", required = false) Integer ownerId,
			@RequestParam(value = "alertType", required = false) String alertType,
			@RequestParam(value = "isEnabled", required = false) Boolean isEnabled) {
		Jwt jwt = requireJwt(authentication);
		AlertSettingsListData data = service.list(ownerId, alertType, isEnabled, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	@PostMapping
	public ResponseEntity<ApiSuccessResponse<AlertSettingItemData>> create(Authentication authentication,
			@Valid @RequestBody AlertSettingCreateRequest request) {
		Jwt jwt = requireJwt(authentication);
		AlertSettingItemData data = service.create(request, jwt);
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiSuccessResponse.of(data, "Thao tác thành công"));
	}

	@PatchMapping("/{id}")
	public ResponseEntity<ApiSuccessResponse<AlertSettingItemData>> patch(Authentication authentication,
			@PathVariable("id") long id, @RequestBody JsonNode body) {
		Jwt jwt = requireJwt(authentication);
		AlertSettingItemData data = service.patch(id, body, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thao tác thành công"));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> softDisable(Authentication authentication, @PathVariable("id") long id) {
		Jwt jwt = requireJwt(authentication);
		service.softDisable(id, jwt);
		return ResponseEntity.noContent().build();
	}

	private static Jwt requireJwt(Authentication authentication) {
		if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
			throw new BusinessException(ApiErrorCode.UNAUTHORIZED, UNAUTHORIZED_PERMIT_ALL);
		}
		if (!(authentication.getPrincipal() instanceof Jwt jwt)) {
			throw new BusinessException(ApiErrorCode.UNAUTHORIZED, UNAUTHORIZED_NO_JWT_PRINCIPAL);
		}
		return jwt;
	}
}

