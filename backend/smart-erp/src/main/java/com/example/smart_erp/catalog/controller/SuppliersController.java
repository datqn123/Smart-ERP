package com.example.smart_erp.catalog.controller;

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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;

import com.example.smart_erp.catalog.dto.SupplierCreateRequest;
import com.example.smart_erp.catalog.dto.SuppliersBulkDeleteRequest;
import com.example.smart_erp.catalog.response.SupplierBulkDeleteData;
import com.example.smart_erp.catalog.response.SupplierDeleteData;
import com.example.smart_erp.catalog.response.SupplierDetailData;
import com.example.smart_erp.catalog.response.SupplierListPageData;
import com.example.smart_erp.catalog.service.SupplierService;
import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.api.ApiSuccessResponse;
import com.example.smart_erp.common.exception.BusinessException;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/suppliers")
@Validated
public class SuppliersController {

	private static final String UNAUTHORIZED_PERMIT_ALL = "Bearer JWT không được áp dụng: backend đang permit-all (mặc định APP_SECURITY_MODE). "
			+ "Đặt APP_SECURITY_MODE=jwt-api (hoặc app.security.api-protection=jwt-api), khởi động lại, đăng nhập Task001 rồi gửi lại request.";

	private static final String UNAUTHORIZED_NO_JWT_PRINCIPAL = "Không có JWT hợp lệ trong phiên bảo mật. "
			+ "Kiểm tra Header Authorization: Bearer <accessToken>; nếu đã bật jwt-api, access token có thể đã hết hạn — đăng nhập hoặc refresh lại.";

	private final SupplierService supplierService;

	public SuppliersController(SupplierService supplierService) {
		this.supplierService = supplierService;
	}

	@GetMapping
	@PreAuthorize("hasAuthority('can_manage_products')")
	public ResponseEntity<ApiSuccessResponse<SupplierListPageData>> list(Authentication authentication,
			@RequestParam(required = false) String search,
			@RequestParam(required = false, defaultValue = "all") String status,
			@RequestParam(required = false, defaultValue = "1") int page,
			@RequestParam(required = false, defaultValue = "20") int limit,
			@RequestParam(required = false) String sort) {
		requireJwt(authentication);
		SupplierListPageData data = supplierService.list(search, status, page, limit, sort);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	@PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAuthority('can_manage_products')")
	public ResponseEntity<ApiSuccessResponse<SupplierDetailData>> create(Authentication authentication,
			@Valid @RequestBody SupplierCreateRequest body) {
		requireJwt(authentication);
		SupplierDetailData data = supplierService.create(body);
		return ResponseEntity.status(201).body(ApiSuccessResponse.of(data, "Đã tạo nhà cung cấp"));
	}

	@GetMapping("/{id:\\d+}")
	@PreAuthorize("hasAuthority('can_manage_products')")
	public ResponseEntity<ApiSuccessResponse<SupplierDetailData>> getById(Authentication authentication,
			@PathVariable("id") String idRaw) {
		requireJwt(authentication);
		int id = parsePositiveIntId(idRaw);
		return ResponseEntity.ok(ApiSuccessResponse.of(supplierService.getById(id), "Thành công"));
	}

	@PatchMapping(value = "/{id:\\d+}", consumes = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAuthority('can_manage_products')")
	public ResponseEntity<ApiSuccessResponse<SupplierDetailData>> patch(Authentication authentication,
			@PathVariable("id") String idRaw, @RequestBody JsonNode body) {
		requireJwt(authentication);
		int id = parsePositiveIntId(idRaw);
		return ResponseEntity.ok(ApiSuccessResponse.of(supplierService.patch(id, body), "Đã cập nhật nhà cung cấp"));
	}

	@DeleteMapping("/{id:\\d+}")
	@PreAuthorize("hasAuthority('can_manage_products')")
	public ResponseEntity<ApiSuccessResponse<SupplierDeleteData>> delete(Authentication authentication,
			@PathVariable("id") String idRaw) {
		Jwt jwt = requireJwt(authentication);
		int id = parsePositiveIntId(idRaw);
		SupplierDeleteData data = supplierService.delete(id, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã xóa nhà cung cấp"));
	}

	@PostMapping(value = "/bulk-delete", consumes = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAuthority('can_manage_products')")
	public ResponseEntity<ApiSuccessResponse<SupplierBulkDeleteData>> bulkDelete(Authentication authentication,
			@Valid @RequestBody SuppliersBulkDeleteRequest body) {
		Jwt jwt = requireJwt(authentication);
		SupplierBulkDeleteData data = supplierService.bulkDelete(body, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã xóa các nhà cung cấp"));
	}

	private static int parsePositiveIntId(String raw) {
		if (raw == null || raw.isBlank()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Tham số yêu cầu không hợp lệ",
					Map.of("id", "Giá trị phải là số nguyên dương"));
		}
		try {
			int v = Integer.parseInt(raw.trim());
			if (v <= 0) {
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
