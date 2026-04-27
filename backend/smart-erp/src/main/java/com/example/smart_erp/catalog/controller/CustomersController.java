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

import com.example.smart_erp.catalog.dto.CustomerCreateRequest;
import com.example.smart_erp.catalog.dto.CustomersBulkDeleteRequest;
import com.example.smart_erp.catalog.response.CustomerBulkDeleteData;
import com.example.smart_erp.catalog.response.CustomerData;
import com.example.smart_erp.catalog.response.CustomerDeleteData;
import com.example.smart_erp.catalog.response.CustomerListPageData;
import com.example.smart_erp.catalog.service.CustomerService;
import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.api.ApiSuccessResponse;
import com.example.smart_erp.common.exception.BusinessException;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/customers")
@Validated
public class CustomersController {

	private static final String UNAUTHORIZED_PERMIT_ALL = "Bearer JWT không được áp dụng: backend đang permit-all (mặc định APP_SECURITY_MODE). "
			+ "Đặt APP_SECURITY_MODE=jwt-api (hoặc app.security.api-protection=jwt-api), khởi động lại, đăng nhập Task001 rồi gửi lại request.";

	private static final String UNAUTHORIZED_NO_JWT_PRINCIPAL = "Không có JWT hợp lệ trong phiên bảo mật. "
			+ "Kiểm tra Header Authorization: Bearer <accessToken>; nếu đã bật jwt-api, access token có thể đã hết hạn — đăng nhập hoặc refresh lại.";

	private final CustomerService customerService;

	public CustomersController(CustomerService customerService) {
		this.customerService = customerService;
	}

	@GetMapping
	@PreAuthorize("hasAuthority('can_manage_customers')")
	public ResponseEntity<ApiSuccessResponse<CustomerListPageData>> list(Authentication authentication,
			@RequestParam(required = false) String search,
			@RequestParam(required = false, defaultValue = "all") String status,
			@RequestParam(required = false, defaultValue = "1") int page,
			@RequestParam(required = false, defaultValue = "20") int limit,
			@RequestParam(required = false) String sort) {
		requireJwt(authentication);
		CustomerListPageData data = customerService.list(search, status, page, limit, sort);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	@PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAuthority('can_manage_customers')")
	public ResponseEntity<ApiSuccessResponse<CustomerData>> create(Authentication authentication,
			@Valid @RequestBody CustomerCreateRequest body) {
		requireJwt(authentication);
		CustomerData data = customerService.create(body);
		return ResponseEntity.status(201).body(ApiSuccessResponse.of(data, "Đã tạo khách hàng"));
	}

	@GetMapping("/{id:\\d+}")
	@PreAuthorize("hasAuthority('can_manage_customers')")
	public ResponseEntity<ApiSuccessResponse<CustomerData>> getById(Authentication authentication,
			@PathVariable("id") String idRaw) {
		requireJwt(authentication);
		int id = parsePositiveIntId(idRaw);
		return ResponseEntity.ok(ApiSuccessResponse.of(customerService.getById(id), "Thành công"));
	}

	@PatchMapping(value = "/{id:\\d+}", consumes = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAuthority('can_manage_customers')")
	public ResponseEntity<ApiSuccessResponse<CustomerData>> patch(Authentication authentication,
			@PathVariable("id") String idRaw, @RequestBody JsonNode body) {
		Jwt jwt = requireJwt(authentication);
		int id = parsePositiveIntId(idRaw);
		return ResponseEntity.ok(ApiSuccessResponse.of(customerService.patch(id, body, jwt), "Đã cập nhật khách hàng"));
	}

	@DeleteMapping("/{id:\\d+}")
	@PreAuthorize("hasAuthority('can_manage_customers')")
	public ResponseEntity<ApiSuccessResponse<CustomerDeleteData>> delete(Authentication authentication,
			@PathVariable("id") String idRaw) {
		Jwt jwt = requireJwt(authentication);
		int id = parsePositiveIntId(idRaw);
		CustomerDeleteData data = customerService.delete(id, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã xóa khách hàng"));
	}

	@PostMapping(value = "/bulk-delete", consumes = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAuthority('can_manage_customers')")
	public ResponseEntity<ApiSuccessResponse<CustomerBulkDeleteData>> bulkDelete(Authentication authentication,
			@Valid @RequestBody CustomersBulkDeleteRequest body) {
		Jwt jwt = requireJwt(authentication);
		CustomerBulkDeleteData data = customerService.bulkDelete(body, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã xóa các khách hàng"));
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
