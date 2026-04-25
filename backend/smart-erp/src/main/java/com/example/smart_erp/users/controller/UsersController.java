package com.example.smart_erp.users.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.api.ApiSuccessResponse;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.users.dto.UserCreateRequest;
import com.example.smart_erp.users.response.NextStaffCodeData;
import com.example.smart_erp.users.response.UserResponseData;
import com.example.smart_erp.users.service.NextStaffCodeService;
import com.example.smart_erp.users.service.UserCreationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
public class UsersController {

	private static final String UNAUTHORIZED_PERMIT_ALL = "Bearer JWT không được áp dụng: backend đang permit-all (mặc định APP_SECURITY_MODE). "
			+ "Đặt APP_SECURITY_MODE=jwt-api (hoặc app.security.api-protection=jwt-api), khởi động lại, đăng nhập Task001 rồi gửi lại request.";

	private static final String UNAUTHORIZED_NO_JWT_PRINCIPAL = "Không có JWT hợp lệ trong phiên bảo mật. "
			+ "Kiểm tra Header Authorization: Bearer <accessToken>; nếu đã bật jwt-api, access token có thể đã hết hạn — đăng nhập hoặc refresh lại.";

	private final UserCreationService userCreationService;

	private final NextStaffCodeService nextStaffCodeService;

	public UsersController(UserCreationService userCreationService, NextStaffCodeService nextStaffCodeService) {
		this.userCreationService = userCreationService;
		this.nextStaffCodeService = nextStaffCodeService;
	}

	/** Task078_02 — gợi ý {@code staff_code} tiếp theo theo prefix suy ra từ {@code roleId} / {@code staffFamily}. */
	@GetMapping("/users/next-staff-code")
	public ResponseEntity<ApiSuccessResponse<NextStaffCodeData>> nextStaffCode(Authentication authentication,
			@RequestParam("roleId") int roleId, @RequestParam(value = "staffFamily", required = false) String staffFamily) {
		Jwt jwt = requireJwt(authentication);
		int actorUserId = Integer.parseInt(jwt.getSubject());
		NextStaffCodeData data = nextStaffCodeService.suggest(actorUserId, roleId, staffFamily);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	@PostMapping("/users")
	public ResponseEntity<ApiSuccessResponse<UserResponseData>> createUser(Authentication authentication,
			@Valid @RequestBody UserCreateRequest request) {
		Jwt jwt = requireJwt(authentication);
		int actorUserId = Integer.parseInt(jwt.getSubject());
		UserResponseData data = userCreationService.createUser(actorUserId, request);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiSuccessResponse.of(data, "Tạo nhân viên thành công"));
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
