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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.api.ApiSuccessResponse;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.finance.debts.PartnerDebtService;
import com.example.smart_erp.finance.debts.request.DebtCreateRequest;
import com.example.smart_erp.finance.debts.response.PartnerDebtItemData;
import com.example.smart_erp.finance.debts.response.PartnerDebtPageData;
import com.example.smart_erp.finance.ledger.FinanceLedgerAccessPolicy;
import com.fasterxml.jackson.databind.JsonNode;

import jakarta.validation.Valid;

/**
 * SRS Task069–072 — REST sổ nợ đối tác.
 */
@RestController
@RequestMapping("/api/v1/debts")
@Validated
public class DebtsController {

	private static final String UNAUTHORIZED_PERMIT_ALL = "Bearer JWT không được áp dụng: backend đang permit-all (mặc định APP_SECURITY_MODE). "
			+ "Đặt APP_SECURITY_MODE=jwt-api (hoặc app.security.api-protection=jwt-api), khởi động lại, đăng nhập Task001 rồi gửi lại request.";

	private static final String UNAUTHORIZED_NO_JWT_PRINCIPAL = "Không có JWT hợp lệ trong phiên bảo mật. "
			+ "Kiểm tra Header Authorization: Bearer <accessToken>; nếu đã bật jwt-api, access token có thể đã hết hạn — đăng nhập hoặc refresh lại.";

	private static final String FORBIDDEN_FINANCE = "Bạn không có quyền thực hiện thao tác này.";

	private final PartnerDebtService service;

	public DebtsController(PartnerDebtService service) {
		this.service = service;
	}

	@GetMapping
	public ResponseEntity<ApiSuccessResponse<PartnerDebtPageData>> list(Authentication authentication,
			@RequestParam(name = "partnerType", required = false) String partnerType,
			@RequestParam(name = "status", required = false) String status,
			@RequestParam(name = "dueDateFrom", required = false) String dueDateFrom,
			@RequestParam(name = "dueDateTo", required = false) String dueDateTo,
			@RequestParam(name = "search", required = false) String search,
			@RequestParam(name = "page", required = false) String page,
			@RequestParam(name = "limit", required = false) String limit) {
		Jwt jwt = requireJwt(authentication);
		FinanceLedgerAccessPolicy.assertCanViewFinanceLedger(jwt, FORBIDDEN_FINANCE);
		PartnerDebtPageData data = service.list(partnerType, status, dueDateFrom, dueDateTo, search, page, limit);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	@PostMapping
	public ResponseEntity<ApiSuccessResponse<PartnerDebtItemData>> create(Authentication authentication,
			@Valid @RequestBody DebtCreateRequest body) {
		Jwt jwt = requireJwt(authentication);
		FinanceLedgerAccessPolicy.assertCanViewFinanceLedger(jwt, FORBIDDEN_FINANCE);
		PartnerDebtItemData data = service.create(body, jwt);
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiSuccessResponse.of(data, "Đã tạo khoản nợ"));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiSuccessResponse<PartnerDebtItemData>> getById(Authentication authentication, @PathVariable("id") long id) {
		Jwt jwt = requireJwt(authentication);
		FinanceLedgerAccessPolicy.assertCanViewFinanceLedger(jwt, FORBIDDEN_FINANCE);
		PartnerDebtItemData data = service.getById(id);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	@PatchMapping("/{id}")
	public ResponseEntity<ApiSuccessResponse<PartnerDebtItemData>> patch(Authentication authentication, @PathVariable("id") long id,
			@RequestBody JsonNode body) {
		Jwt jwt = requireJwt(authentication);
		FinanceLedgerAccessPolicy.assertCanViewFinanceLedger(jwt, FORBIDDEN_FINANCE);
		PartnerDebtItemData data = service.patch(id, body, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã cập nhật khoản nợ"));
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
