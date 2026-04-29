package com.example.smart_erp.finance.controller;

import org.springframework.http.ResponseEntity;
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
import com.example.smart_erp.finance.ledger.FinanceLedgerAccessPolicy;
import com.example.smart_erp.finance.ledger.FinanceLedgerService;
import com.example.smart_erp.finance.ledger.response.FinanceLedgerPageData;

/**
 * Task063 — SRS Task063 §8.
 */
@RestController
@RequestMapping("/api/v1")
@Validated
public class FinanceLedgerController {

	private static final String UNAUTHORIZED_PERMIT_ALL = "Bearer JWT không được áp dụng: backend đang permit-all (mặc định APP_SECURITY_MODE). "
			+ "Đặt APP_SECURITY_MODE=jwt-api (hoặc app.security.api-protection=jwt-api), khởi động lại, đăng nhập Task001 rồi gửi lại request.";

	private static final String UNAUTHORIZED_NO_JWT_PRINCIPAL = "Không có JWT hợp lệ trong phiên bảo mật. "
			+ "Kiểm tra Header Authorization: Bearer <accessToken>; nếu đã bật jwt-api, access token có thể đã hết hạn — đăng nhập hoặc refresh lại.";

	private static final String FORBIDDEN_VIEW_FINANCE = "Bạn không có quyền xem sổ cái tài chính.";

	private final FinanceLedgerService service;

	public FinanceLedgerController(FinanceLedgerService service) {
		this.service = service;
	}

	@GetMapping("/finance-ledger")
	public ResponseEntity<ApiSuccessResponse<FinanceLedgerPageData>> list(Authentication authentication,
			@RequestParam(name = "dateFrom", required = false) String dateFrom,
			@RequestParam(name = "dateTo", required = false) String dateTo,
			@RequestParam(name = "transactionType", required = false) String transactionType,
			@RequestParam(name = "referenceType", required = false) String referenceType,
			@RequestParam(name = "search", required = false) String search,
			@RequestParam(name = "page", required = false) String page,
			@RequestParam(name = "limit", required = false) String limit) {
		Jwt jwt = requireJwt(authentication);
		FinanceLedgerAccessPolicy.assertCanViewFinanceLedger(jwt, FORBIDDEN_VIEW_FINANCE);
		FinanceLedgerPageData data = service.list(dateFrom, dateTo, transactionType, referenceType, search, page, limit);
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

