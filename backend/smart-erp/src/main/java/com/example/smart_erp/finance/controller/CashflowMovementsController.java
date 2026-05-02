package com.example.smart_erp.finance.controller;

import org.springframework.http.ResponseEntity;
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
import com.example.smart_erp.finance.cashflow.CashflowMovementService;
import com.example.smart_erp.finance.cashflow.response.CashflowMovementPageData;
import com.example.smart_erp.finance.ledger.FinanceLedgerAccessPolicy;
import com.example.smart_erp.inventory.dispatch.StockDispatchAccessPolicy;

/**
 * PRD — dòng tiền thống nhất (Admin-only).
 */
@RestController
@RequestMapping("/api/v1/cashflow/movements")
public class CashflowMovementsController {

	private static final String FORBIDDEN_FINANCE = "Bạn không có quyền thực hiện thao tác này.";

	private final CashflowMovementService service;

	public CashflowMovementsController(CashflowMovementService service) {
		this.service = service;
	}

	@GetMapping
	public ResponseEntity<ApiSuccessResponse<CashflowMovementPageData>> list(Authentication authentication,
			@RequestParam(name = "dateFrom", required = false) String dateFrom,
			@RequestParam(name = "dateTo", required = false) String dateTo,
			@RequestParam(name = "fundId", required = false) String fundId,
			@RequestParam(name = "search", required = false) String search,
			@RequestParam(name = "page", required = false) String page,
			@RequestParam(name = "limit", required = false) String limit) {
		Jwt jwt = requireJwt(authentication);
		FinanceLedgerAccessPolicy.assertCanViewFinanceLedger(jwt, FORBIDDEN_FINANCE);
		if (!StockDispatchAccessPolicy.isAdmin(jwt)) {
			throw new BusinessException(ApiErrorCode.FORBIDDEN, FORBIDDEN_FINANCE);
		}
		CashflowMovementPageData data = service.list(dateFrom, dateTo, fundId, search, page, limit);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thao tác thành công"));
	}

	private static Jwt requireJwt(Authentication authentication) {
		if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
			throw new BusinessException(ApiErrorCode.UNAUTHORIZED, "Không có JWT hợp lệ.");
		}
		if (!(authentication.getPrincipal() instanceof Jwt jwt)) {
			throw new BusinessException(ApiErrorCode.UNAUTHORIZED, "Không có JWT hợp lệ.");
		}
		return jwt;
	}
}
