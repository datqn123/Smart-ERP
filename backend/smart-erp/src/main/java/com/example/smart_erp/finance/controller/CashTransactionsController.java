package com.example.smart_erp.finance.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.api.ApiSuccessResponse;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.finance.cashtx.CashTransactionService;
import com.example.smart_erp.finance.cashtx.request.CashTransactionCreateRequest;
import com.example.smart_erp.finance.cashtx.response.CashTransactionItemData;
import com.example.smart_erp.finance.cashtx.response.CashTransactionPageData;
import com.example.smart_erp.finance.ledger.FinanceLedgerAccessPolicy;
import com.fasterxml.jackson.databind.JsonNode;

import jakarta.validation.Valid;

/**
 * SRS Task064–068 — REST giao dịch thu chi.
 */
@RestController
@RequestMapping("/api/v1/cash-transactions")
@Validated
public class CashTransactionsController {

	private static final String UNAUTHORIZED_PERMIT_ALL = "Bearer JWT không được áp dụng: backend đang permit-all (mặc định APP_SECURITY_MODE). "
			+ "Đặt APP_SECURITY_MODE=jwt-api (hoặc app.security.api-protection=jwt-api), khởi động lại, đăng nhập Task001 rồi gửi lại request.";

	private static final String UNAUTHORIZED_NO_JWT_PRINCIPAL = "Không có JWT hợp lệ trong phiên bảo mật. "
			+ "Kiểm tra Header Authorization: Bearer <accessToken>; nếu đã bật jwt-api, access token có thể đã hết hạn — đăng nhập hoặc refresh lại.";

	private static final String FORBIDDEN_FINANCE = "Bạn không có quyền thực hiện thao tác này.";

	private final CashTransactionService service;

	public CashTransactionsController(CashTransactionService service) {
		this.service = service;
	}

	@GetMapping
	public ResponseEntity<ApiSuccessResponse<CashTransactionPageData>> list(Authentication authentication,
			@RequestParam(name = "type", required = false) String type,
			@RequestParam(name = "status", required = false) String status,
			@RequestParam(name = "dateFrom", required = false) String dateFrom,
			@RequestParam(name = "dateTo", required = false) String dateTo,
			@RequestParam(name = "fundId", required = false) String fundId,
			@RequestParam(name = "search", required = false) String search,
			@RequestParam(name = "page", required = false) String page,
			@RequestParam(name = "limit", required = false) String limit) {
		Jwt jwt = requireJwt(authentication);
		FinanceLedgerAccessPolicy.assertCanViewFinanceLedger(jwt, FORBIDDEN_FINANCE);
		CashTransactionPageData data = service.list(type, status, dateFrom, dateTo, fundId, search, page, limit);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	@PostMapping
	public ResponseEntity<ApiSuccessResponse<CashTransactionItemData>> create(Authentication authentication,
			@Valid @RequestBody CashTransactionCreateRequest body) {
		Jwt jwt = requireJwt(authentication);
		FinanceLedgerAccessPolicy.assertCanViewFinanceLedger(jwt, FORBIDDEN_FINANCE);
		CashTransactionItemData data = service.create(body, jwt);
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiSuccessResponse.of(data, "Đã tạo giao dịch"));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiSuccessResponse<CashTransactionItemData>> getById(Authentication authentication, @PathVariable("id") long id) {
		Jwt jwt = requireJwt(authentication);
		FinanceLedgerAccessPolicy.assertCanViewFinanceLedger(jwt, FORBIDDEN_FINANCE);
		CashTransactionItemData data = service.getById(id);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	@PatchMapping("/{id}")
	public ResponseEntity<ApiSuccessResponse<CashTransactionItemData>> patch(Authentication authentication, @PathVariable("id") long id,
			@RequestBody JsonNode body) {
		Jwt jwt = requireJwt(authentication);
		FinanceLedgerAccessPolicy.assertCanViewFinanceLedger(jwt, FORBIDDEN_FINANCE);
		CashTransactionItemData data = service.patch(id, body, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<ApiSuccessResponse<Object>> delete(Authentication authentication, @PathVariable("id") long id) {
		Jwt jwt = requireJwt(authentication);
		FinanceLedgerAccessPolicy.assertCanViewFinanceLedger(jwt, FORBIDDEN_FINANCE);
		service.delete(id, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(null, "Đã xóa giao dịch"));
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
