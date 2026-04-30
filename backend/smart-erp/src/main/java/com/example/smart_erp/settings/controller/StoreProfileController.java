package com.example.smart_erp.settings.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.api.ApiSuccessResponse;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.settings.storeprofile.StoreProfileService;
import com.example.smart_erp.settings.storeprofile.response.StoreLogoUploadData;
import com.example.smart_erp.settings.storeprofile.response.StoreProfileData;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * SRS Task073–075 — REST StoreProfiles.
 */
@RestController
@RequestMapping("/api/v1/store-profile")
@Validated
public class StoreProfileController {

	private static final String UNAUTHORIZED_PERMIT_ALL = "Bearer JWT không được áp dụng: backend đang permit-all (mặc định APP_SECURITY_MODE). "
			+ "Đặt APP_SECURITY_MODE=jwt-api (hoặc app.security.api-protection=jwt-api), khởi động lại, đăng nhập Task001 rồi gửi lại request.";

	private static final String UNAUTHORIZED_NO_JWT_PRINCIPAL = "Không có JWT hợp lệ trong phiên bảo mật. "
			+ "Kiểm tra Header Authorization: Bearer <accessToken>; nếu đã bật jwt-api, access token có thể đã hết hạn — đăng nhập hoặc refresh lại.";

	private final StoreProfileService service;

	public StoreProfileController(StoreProfileService service) {
		this.service = service;
	}

	@GetMapping
	@PreAuthorize("hasAuthority('can_view_store_profile')")
	public ResponseEntity<ApiSuccessResponse<StoreProfileData>> get(Authentication authentication) {
		Jwt jwt = requireJwt(authentication);
		StoreProfileData data = service.getOrCreate(jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	@PatchMapping
	@PreAuthorize("hasAuthority('can_view_store_profile')")
	public ResponseEntity<ApiSuccessResponse<StoreProfileData>> patch(Authentication authentication, @RequestBody JsonNode body) {
		Jwt jwt = requireJwt(authentication);
		StoreProfileData data = service.patch(body, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã cập nhật thông tin cửa hàng"));
	}

	@PostMapping(path = "/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@PreAuthorize("hasAuthority('can_view_store_profile')")
	public ResponseEntity<ApiSuccessResponse<StoreLogoUploadData>> uploadLogo(Authentication authentication,
			@RequestPart("file") MultipartFile file) {
		Jwt jwt = requireJwt(authentication);
		StoreLogoUploadData data = service.uploadLogo(file, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã cập nhật logo"));
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

