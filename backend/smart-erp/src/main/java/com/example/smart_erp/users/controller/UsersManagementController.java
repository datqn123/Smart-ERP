package com.example.smart_erp.users.controller;

import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.api.ApiSuccessResponse;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.users.dto.UserPatchRequest;
import com.example.smart_erp.users.response.UserDetailData;
import com.example.smart_erp.users.response.UsersListPageData;
import com.example.smart_erp.users.service.UsersManagementService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/api/v1/users")
@Validated
public class UsersManagementController {

	private static final String UNAUTHORIZED_PERMIT_ALL = "Bearer JWT không được áp dụng: backend đang permit-all (mặc định APP_SECURITY_MODE). "
			+ "Đặt APP_SECURITY_MODE=jwt-api (hoặc app.security.api-protection=jwt-api), khởi động lại, đăng nhập Task001 rồi gửi lại request.";

	private static final String UNAUTHORIZED_NO_JWT_PRINCIPAL = "Không có JWT hợp lệ trong phiên bảo mật. "
			+ "Kiểm tra Header Authorization: Bearer <accessToken>; nếu đã bật jwt-api, access token có thể đã hết hạn — đăng nhập hoặc refresh lại.";

	private final UsersManagementService usersManagementService;

	public UsersManagementController(UsersManagementService usersManagementService) {
		this.usersManagementService = usersManagementService;
	}

	@GetMapping
	@PreAuthorize("hasAuthority('can_manage_staff')")
	public ResponseEntity<ApiSuccessResponse<UsersListPageData>> list(Authentication authentication,
			@RequestParam(required = false) String search,
			@RequestParam(required = false, defaultValue = "all") String status,
			@RequestParam(required = false) Integer roleId,
			@RequestParam(required = false, defaultValue = "1") @Min(value = 1, message = "page phải >= 1") int page,
			@RequestParam(required = false, defaultValue = "20") @Min(value = 1, message = "limit phải >= 1")
			@Max(value = 100, message = "limit tối đa 100") int limit) {
		Jwt jwt = requireJwt(authentication);
		int actorUserId = Integer.parseInt(jwt.getSubject());
		UsersListPageData data = usersManagementService.list(actorUserId, search, status, roleId, page, limit);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	@GetMapping("/{userId:\\d+}")
	public ResponseEntity<ApiSuccessResponse<UserDetailData>> getById(Authentication authentication,
			@PathVariable("userId") String idRaw) {
		Jwt jwt = requireJwt(authentication);
		int actorUserId = Integer.parseInt(jwt.getSubject());
		int userId = parsePositiveIntId(idRaw, "userId");
		UserDetailData data = usersManagementService.getById(actorUserId, userId);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	@PatchMapping(value = "/{userId:\\d+}", consumes = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAuthority('can_manage_staff')")
	public ResponseEntity<ApiSuccessResponse<UserDetailData>> patch(Authentication authentication,
			@PathVariable("userId") String idRaw, @Valid @RequestBody UserPatchRequest body) {
		Jwt jwt = requireJwt(authentication);
		int actorUserId = Integer.parseInt(jwt.getSubject());
		int userId = parsePositiveIntId(idRaw, "userId");
		UserDetailData data = usersManagementService.patch(actorUserId, userId, body);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã cập nhật nhân viên"));
	}

	@DeleteMapping("/{userId:\\d+}")
	@PreAuthorize("hasAuthority('can_manage_staff')")
	public ResponseEntity<Void> delete(Authentication authentication, @PathVariable("userId") String idRaw) {
		Jwt jwt = requireJwt(authentication);
		int actorUserId = Integer.parseInt(jwt.getSubject());
		int userId = parsePositiveIntId(idRaw, "userId");
		usersManagementService.softDelete(actorUserId, userId);
		return ResponseEntity.noContent().build();
	}

	private static int parsePositiveIntId(String raw, String key) {
		if (raw == null || raw.isBlank()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Tham số yêu cầu không hợp lệ",
					Map.of(key, "Giá trị phải là số nguyên dương"));
		}
		try {
			int v = Integer.parseInt(raw.trim());
			if (v <= 0) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Tham số yêu cầu không hợp lệ",
						Map.of(key, "Giá trị phải là số nguyên dương"));
			}
			return v;
		}
		catch (NumberFormatException e) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Tham số yêu cầu không hợp lệ",
					Map.of(key, "Giá trị phải là số nguyên dương"));
		}
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

