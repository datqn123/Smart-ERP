package com.example.smart_erp.inventory.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.api.ApiSuccessResponse;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.inventory.query.InventoryListQuery;
import com.example.smart_erp.inventory.response.InventoryListPageData;
import com.example.smart_erp.inventory.service.InventoryListService;

@RestController
@RequestMapping("/api/v1")
public class InventoryController {

	private static final String UNAUTHORIZED_PERMIT_ALL = "Bearer JWT không được áp dụng: backend đang permit-all (mặc định APP_SECURITY_MODE). "
			+ "Đặt APP_SECURITY_MODE=jwt-api (hoặc app.security.api-protection=jwt-api), khởi động lại, đăng nhập Task001 rồi gửi lại request.";

	private static final String UNAUTHORIZED_NO_JWT_PRINCIPAL = "Không có JWT hợp lệ trong phiên bảo mật. "
			+ "Kiểm tra Header Authorization: Bearer <accessToken>; nếu đã bật jwt-api, access token có thể đã hết hạn — đăng nhập hoặc refresh lại.";

	private final InventoryListService inventoryListService;

	public InventoryController(InventoryListService inventoryListService) {
		this.inventoryListService = inventoryListService;
	}

	/** Task005 — danh sách tồn + summary KPI, đọc SRS Task005. */
	@GetMapping("/inventory")
	@PreAuthorize("hasAuthority('can_manage_inventory')")
	public ResponseEntity<ApiSuccessResponse<InventoryListPageData>> list(Authentication authentication,
			@RequestParam(name = "search", required = false) String search,
			@RequestParam(name = "stockLevel", required = false) String stockLevel,
			@RequestParam(name = "locationId", required = false) String locationId,
			@RequestParam(name = "categoryId", required = false) String categoryId,
			@RequestParam(name = "page", required = false) String page,
			@RequestParam(name = "limit", required = false) String limit,
			@RequestParam(name = "sort", required = false) String sort) {
		requireJwt(authentication);
		InventoryListQuery q = InventoryListQuery.of(search, stockLevel, locationId, categoryId, page, limit, sort);
		InventoryListPageData data = inventoryListService.list(q);
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
