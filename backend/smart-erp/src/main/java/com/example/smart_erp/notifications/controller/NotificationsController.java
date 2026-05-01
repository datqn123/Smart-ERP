package com.example.smart_erp.notifications.controller;

import java.util.Collections;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.api.ApiSuccessResponse;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.notifications.response.NotificationsPageData;
import com.example.smart_erp.notifications.service.NotificationsService;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@RestController
@RequestMapping("/api/v1/notifications")
@Validated
public class NotificationsController {

	private static final String UNAUTHORIZED_PERMIT_ALL = "Bearer JWT không được áp dụng: backend đang permit-all (mặc định APP_SECURITY_MODE). "
			+ "Đặt APP_SECURITY_MODE=jwt-api (hoặc app.security.api-protection=jwt-api), khởi động lại, đăng nhập Task001 rồi gửi lại request.";

	private static final String UNAUTHORIZED_NO_JWT_PRINCIPAL = "Không có JWT hợp lệ trong phiên bảo mật.";

	private final NotificationsService notificationsService;

	public NotificationsController(NotificationsService notificationsService) {
		this.notificationsService = notificationsService;
	}

	@GetMapping
	public ResponseEntity<ApiSuccessResponse<NotificationsPageData>> list(Authentication authentication,
			@RequestParam(required = false) Boolean unreadOnly,
			@RequestParam(required = false, defaultValue = "1") @Min(value = 1, message = "page phải >= 1") int page,
			@RequestParam(required = false, defaultValue = "20") @Min(value = 1, message = "limit phải >= 1")
			@Max(value = 100, message = "limit tối đa 100") int limit) {
		int uid = requireUserId(authentication);
		NotificationsPageData data = notificationsService.list(uid, page, limit, unreadOnly);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	@PatchMapping("/{id:\\d+}")
	public ResponseEntity<ApiSuccessResponse<java.util.Map<String, Object>>> markOneRead(Authentication authentication,
			@PathVariable("id") long notificationId) {
		int uid = requireUserId(authentication);
		notificationsService.markOwnedAsRead(uid, notificationId);
		return ResponseEntity.ok(ApiSuccessResponse.of(Collections.emptyMap(), "Đã đánh dấu đã đọc"));
	}

	@PostMapping("/mark-all-read")
	public ResponseEntity<ApiSuccessResponse<java.util.Map<String, Object>>> markAllRead(Authentication authentication) {
		int uid = requireUserId(authentication);
		notificationsService.markAllAsRead(uid);
		return ResponseEntity.ok(ApiSuccessResponse.of(Collections.emptyMap(), "Đã đọc hết"));
	}

	private static int requireUserId(Authentication authentication) {
		if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
			throw new BusinessException(ApiErrorCode.UNAUTHORIZED, UNAUTHORIZED_PERMIT_ALL);
		}
		if (!(authentication.getPrincipal() instanceof Jwt jwt)) {
			throw new BusinessException(ApiErrorCode.UNAUTHORIZED, UNAUTHORIZED_NO_JWT_PRINCIPAL);
		}
		return Integer.parseInt(jwt.getSubject());
	}
}
