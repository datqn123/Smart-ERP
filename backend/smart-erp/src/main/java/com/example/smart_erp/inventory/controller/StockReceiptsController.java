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
import com.example.smart_erp.inventory.receipts.query.StockReceiptListQuery;
import com.example.smart_erp.inventory.receipts.response.StockReceiptListPageData;
import com.example.smart_erp.inventory.receipts.service.StockReceiptListService;

@RestController
@RequestMapping("/api/v1")
public class StockReceiptsController {

	private static final String UNAUTHORIZED_PERMIT_ALL = "Bearer JWT không được áp dụng: backend đang permit-all (mặc định APP_SECURITY_MODE). "
			+ "Đặt APP_SECURITY_MODE=jwt-api (hoặc app.security.api-protection=jwt-api), khởi động lại, đăng nhập Task001 rồi gửi lại request.";

	private static final String UNAUTHORIZED_NO_JWT_PRINCIPAL = "Không có JWT hợp lệ trong phiên bảo mật. "
			+ "Kiểm tra Header Authorization: Bearer <accessToken>; nếu đã bật jwt-api, access token có thể đã hết hạn — đăng nhập hoặc refresh lại.";

	private final StockReceiptListService stockReceiptListService;

	public StockReceiptsController(StockReceiptListService stockReceiptListService) {
		this.stockReceiptListService = stockReceiptListService;
	}

	/** Task013 — danh sách phiếu nhập kho (SRS / API §4.8). */
	@GetMapping("/stock-receipts")
	@PreAuthorize("hasAuthority('can_manage_inventory')")
	public ResponseEntity<ApiSuccessResponse<StockReceiptListPageData>> list(Authentication authentication,
			@RequestParam(name = "search", required = false) String search,
			@RequestParam(name = "status", required = false) String status,
			@RequestParam(name = "dateFrom", required = false) String dateFrom,
			@RequestParam(name = "dateTo", required = false) String dateTo,
			@RequestParam(name = "supplierId", required = false) String supplierId,
			@RequestParam(name = "page", required = false) String page,
			@RequestParam(name = "limit", required = false) String limit,
			@RequestParam(name = "sort", required = false) String sort) {
		requireJwt(authentication);
		StockReceiptListQuery q = StockReceiptListQuery.of(search, status, dateFrom, dateTo, supplierId, page, limit, sort);
		StockReceiptListPageData data = stockReceiptListService.list(q);
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
