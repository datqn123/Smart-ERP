package com.example.smart_erp.sales.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.api.ApiSuccessResponse;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.sales.response.PosProductSearchData;
import com.example.smart_erp.sales.service.SalesOrderService;

@RestController
@RequestMapping("/api/v1/pos/products")
@Validated
public class PosProductsController {

	private static final String UNAUTHORIZED_PERMIT_ALL = "Bearer JWT không được áp dụng: backend đang permit-all (mặc định APP_SECURITY_MODE). "
			+ "Đặt APP_SECURITY_MODE=jwt-api (hoặc app.security.api-protection=jwt-api), khởi động lại, đăng nhập rồi gửi lại request.";

	private static final String UNAUTHORIZED_NO_JWT_PRINCIPAL = "Không có JWT hợp lệ trong phiên bảo mật. "
			+ "Kiểm tra Header Authorization: Bearer <accessToken>.";

	private final SalesOrderService salesOrderService;

	public PosProductsController(SalesOrderService salesOrderService) {
		this.salesOrderService = salesOrderService;
	}

	@GetMapping
	@PreAuthorize("hasAuthority('can_manage_orders')")
	public ResponseEntity<ApiSuccessResponse<PosProductSearchData>> search(Authentication authentication,
			@RequestParam(required = false) String search,
			@RequestParam(required = false) Integer categoryId,
			@RequestParam(required = false) Integer locationId,
			@RequestParam(required = false, defaultValue = "40") int limit) {
		requireJwt(authentication);
		PosProductSearchData data = salesOrderService.searchPosProducts(search, categoryId, locationId, limit);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
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
