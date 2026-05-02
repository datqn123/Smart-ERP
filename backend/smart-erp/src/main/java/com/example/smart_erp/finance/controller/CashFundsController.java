package com.example.smart_erp.finance.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
import org.springframework.web.bind.annotation.RestController;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.api.ApiSuccessResponse;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.finance.cashfunds.CashFundService;
import com.example.smart_erp.finance.cashfunds.request.CashFundCreateRequest;
import com.example.smart_erp.finance.cashfunds.request.CashFundPatchRequest;
import com.example.smart_erp.finance.cashfunds.response.CashFundItemData;
import com.example.smart_erp.finance.cashfunds.response.CashFundListData;
import com.example.smart_erp.finance.ledger.FinanceLedgerAccessPolicy;
import com.example.smart_erp.inventory.dispatch.StockDispatchAccessPolicy;

import jakarta.validation.Valid;

/**
 * PRD — quỹ tiền.
 */
@RestController
@RequestMapping("/api/v1/cash-funds")
@Validated
public class CashFundsController {

	private static final String FORBIDDEN_FINANCE = "Bạn không có quyền thực hiện thao tác này.";
	private static final String FORBIDDEN_ADMIN = "Chỉ quản trị viên mới được thực hiện thao tác này.";

	private final CashFundService service;

	public CashFundsController(CashFundService service) {
		this.service = service;
	}

	@GetMapping
	public ResponseEntity<ApiSuccessResponse<CashFundListData>> list(Authentication authentication) {
		Jwt jwt = requireJwt(authentication);
		FinanceLedgerAccessPolicy.assertCanViewFinanceLedger(jwt, FORBIDDEN_FINANCE);
		return ResponseEntity.ok(ApiSuccessResponse.of(service.listActive(), "Thao tác thành công"));
	}

	@PostMapping
	public ResponseEntity<ApiSuccessResponse<CashFundItemData>> create(Authentication authentication,
			@Valid @RequestBody CashFundCreateRequest body) {
		Jwt jwt = requireJwt(authentication);
		FinanceLedgerAccessPolicy.assertCanViewFinanceLedger(jwt, FORBIDDEN_FINANCE);
		assertAdmin(jwt);
		CashFundItemData data = service.create(body);
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiSuccessResponse.of(data, "Đã tạo quỹ"));
	}

	@PatchMapping("/{id}")
	public ResponseEntity<ApiSuccessResponse<CashFundItemData>> patch(Authentication authentication, @PathVariable("id") int id,
			@RequestBody CashFundPatchRequest body) {
		Jwt jwt = requireJwt(authentication);
		FinanceLedgerAccessPolicy.assertCanViewFinanceLedger(jwt, FORBIDDEN_FINANCE);
		assertAdmin(jwt);
		CashFundItemData data = service.patch(id, body);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	private static void assertAdmin(Jwt jwt) {
		if (!StockDispatchAccessPolicy.isAdmin(jwt)) {
			throw new BusinessException(ApiErrorCode.FORBIDDEN, FORBIDDEN_ADMIN);
		}
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
