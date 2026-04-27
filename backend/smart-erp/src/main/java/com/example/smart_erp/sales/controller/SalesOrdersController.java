package com.example.smart_erp.sales.controller;

import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.api.ApiSuccessResponse;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.sales.dto.RetailCheckoutRequest;
import com.example.smart_erp.sales.dto.SalesOrderCancelBody;
import com.example.smart_erp.sales.dto.SalesOrderCreateRequest;
import com.example.smart_erp.sales.response.SalesOrderCancelData;
import com.example.smart_erp.sales.response.SalesOrderDetailData;
import com.example.smart_erp.sales.response.SalesOrderListPageData;
import com.example.smart_erp.sales.service.SalesOrderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/sales-orders")
@Validated
public class SalesOrdersController {

	private static final String UNAUTHORIZED_PERMIT_ALL = "Bearer JWT không được áp dụng: backend đang permit-all (mặc định APP_SECURITY_MODE). "
			+ "Đặt APP_SECURITY_MODE=jwt-api (hoặc app.security.api-protection=jwt-api), khởi động lại, đăng nhập rồi gửi lại request.";

	private static final String UNAUTHORIZED_NO_JWT_PRINCIPAL = "Không có JWT hợp lệ trong phiên bảo mật. "
			+ "Kiểm tra Header Authorization: Bearer <accessToken>.";

	private final SalesOrderService salesOrderService;

	public SalesOrdersController(SalesOrderService salesOrderService) {
		this.salesOrderService = salesOrderService;
	}

	@GetMapping
	@PreAuthorize("hasAuthority('can_manage_orders')")
	public ResponseEntity<ApiSuccessResponse<SalesOrderListPageData>> list(Authentication authentication,
			@RequestParam(required = false) String orderChannel,
			@RequestParam(required = false) String search,
			@RequestParam(required = false, defaultValue = "all") String status,
			@RequestParam(required = false, defaultValue = "all") String paymentStatus,
			@RequestParam(required = false, defaultValue = "1") int page,
			@RequestParam(required = false, defaultValue = "20") int limit,
			@RequestParam(required = false) String sort) {
		Jwt jwt = requireJwt(authentication);
		SalesOrderListPageData data = salesOrderService.list(jwt, orderChannel, search, status, page, limit, sort,
				paymentStatus);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	@GetMapping("/{id:[0-9]+}")
	@PreAuthorize("hasAuthority('can_manage_orders')")
	public ResponseEntity<ApiSuccessResponse<SalesOrderDetailData>> getById(Authentication authentication,
			@PathVariable("id") String idRaw) {
		requireJwt(authentication);
		int id = parsePositiveIntId(idRaw);
		return ResponseEntity.ok(ApiSuccessResponse.of(salesOrderService.getById(id), "Thành công"));
	}

	@PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAuthority('can_manage_orders')")
	public ResponseEntity<ApiSuccessResponse<SalesOrderDetailData>> create(Authentication authentication,
			@Valid @RequestBody SalesOrderCreateRequest body) {
		Jwt jwt = requireJwt(authentication);
		SalesOrderDetailData data = salesOrderService.create(body, jwt);
		return ResponseEntity.status(201).body(ApiSuccessResponse.of(data, "Tạo đơn thành công"));
	}

	@PostMapping(value = "/retail/checkout", consumes = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAuthority('can_manage_orders')")
	public ResponseEntity<ApiSuccessResponse<SalesOrderDetailData>> retailCheckout(Authentication authentication,
			@Valid @RequestBody RetailCheckoutRequest body) {
		Jwt jwt = requireJwt(authentication);
		SalesOrderDetailData data = salesOrderService.retailCheckout(body, jwt);
		return ResponseEntity.status(201).body(ApiSuccessResponse.of(data, "Thanh toán thành công"));
	}

	@PatchMapping(value = "/{id:[0-9]+}", consumes = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAuthority('can_manage_orders')")
	public ResponseEntity<ApiSuccessResponse<SalesOrderDetailData>> patch(Authentication authentication,
			@PathVariable("id") String idRaw, @RequestBody JsonNode body) {
		Jwt jwt = requireJwt(authentication);
		int id = parsePositiveIntId(idRaw);
		return ResponseEntity.ok(ApiSuccessResponse.of(salesOrderService.patch(id, body, jwt), "Đã cập nhật đơn hàng"));
	}

	@PostMapping("/{id:[0-9]+}/cancel")
	@PreAuthorize("hasAuthority('can_manage_orders')")
	public ResponseEntity<ApiSuccessResponse<SalesOrderCancelData>> cancel(Authentication authentication,
			@PathVariable("id") String idRaw, @RequestBody(required = false) SalesOrderCancelBody body) {
		Jwt jwt = requireJwt(authentication);
		int id = parsePositiveIntId(idRaw);
		SalesOrderCancelData data = salesOrderService.cancel(id, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã hủy đơn hàng"));
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
