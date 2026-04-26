package com.example.smart_erp.catalog.controller;

import java.util.Map;

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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;

import com.example.smart_erp.catalog.dto.CategoryCreateRequest;
import com.example.smart_erp.catalog.response.CategoryDeleteData;
import com.example.smart_erp.catalog.response.CategoryDetailData;
import com.example.smart_erp.catalog.response.CategoryListPageData;
import com.example.smart_erp.catalog.response.CategoryNodeResponse;
import com.example.smart_erp.catalog.service.CategoryService;
import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.api.ApiSuccessResponse;
import com.example.smart_erp.common.exception.BusinessException;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/categories")
@Validated
public class CategoriesController {

	private static final String UNAUTHORIZED_PERMIT_ALL = "Bearer JWT không được áp dụng: backend đang permit-all (mặc định APP_SECURITY_MODE). "
			+ "Đặt APP_SECURITY_MODE=jwt-api (hoặc app.security.api-protection=jwt-api), khởi động lại, đăng nhập Task001 rồi gửi lại request.";

	private static final String UNAUTHORIZED_NO_JWT_PRINCIPAL = "Không có JWT hợp lệ trong phiên bảo mật. "
			+ "Kiểm tra Header Authorization: Bearer <accessToken>; nếu đã bật jwt-api, access token có thể đã hết hạn — đăng nhập hoặc refresh lại.";

	private final CategoryService categoryService;

	public CategoriesController(CategoryService categoryService) {
		this.categoryService = categoryService;
	}

	@GetMapping
	@PreAuthorize("hasAuthority('can_manage_products')")
	public ResponseEntity<ApiSuccessResponse<CategoryListPageData>> list(Authentication authentication,
			@RequestParam(name = "format", required = false) String format,
			@RequestParam(name = "search", required = false) String search,
			@RequestParam(name = "status", required = false) String status) {
		requireJwt(authentication);
		CategoryListPageData data = categoryService.list(format, search, status);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	@GetMapping("/{id:\\d+}")
	@PreAuthorize("hasAuthority('can_manage_products')")
	public ResponseEntity<ApiSuccessResponse<CategoryDetailData>> getById(Authentication authentication,
			@PathVariable("id") String idRaw) {
		requireJwt(authentication);
		long id = parsePositiveId(idRaw);
		return ResponseEntity.ok(ApiSuccessResponse.of(categoryService.getById(id), "Thành công"));
	}

	@PostMapping
	@PreAuthorize("hasAuthority('can_manage_products')")
	public ResponseEntity<ApiSuccessResponse<CategoryNodeResponse>> create(Authentication authentication,
			@Valid @RequestBody CategoryCreateRequest body) {
		requireJwt(authentication);
		CategoryNodeResponse data = categoryService.create(body);
		return ResponseEntity.status(201).body(ApiSuccessResponse.of(data, "Đã tạo danh mục"));
	}

	@PatchMapping("/{id:\\d+}")
	@PreAuthorize("hasAuthority('can_manage_products')")
	public ResponseEntity<ApiSuccessResponse<CategoryNodeResponse>> patch(Authentication authentication,
			@PathVariable("id") String idRaw, @RequestBody JsonNode body) {
		requireJwt(authentication);
		long id = parsePositiveId(idRaw);
		CategoryNodeResponse data = categoryService.patch(id, body);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã cập nhật danh mục"));
	}

	@DeleteMapping("/{id:\\d+}")
	@PreAuthorize("hasAuthority('can_manage_products')")
	public ResponseEntity<ApiSuccessResponse<CategoryDeleteData>> delete(Authentication authentication,
			@PathVariable("id") String idRaw) {
		Jwt jwt = requireJwt(authentication);
		long id = parsePositiveId(idRaw);
		CategoryDeleteData data = categoryService.delete(id, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã xóa danh mục"));
	}

	private static long parsePositiveId(String raw) {
		if (raw == null || raw.isBlank()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Tham số yêu cầu không hợp lệ",
					Map.of("id", "Giá trị phải là số nguyên dương"));
		}
		try {
			long v = Long.parseLong(raw.trim());
			if (v <= 0L) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Tham số yêu cầu không hợp lệ",
						Map.of("id", "Giá trị phải là số nguyên dương"));
			}
			return v;
		}
		catch (NumberFormatException e) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Tham số yêu cầu không hợp lệ",
					Map.of("id", "Giá trị phải là số nguyên dương"));
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
