package com.example.smart_erp.sales.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.api.ApiSuccessResponse;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.sales.response.VoucherListItemData;
import com.example.smart_erp.sales.response.VoucherListPageData;
import com.example.smart_erp.sales.service.VoucherService;

@RestController
@RequestMapping("/api/v1/vouchers")
@Validated
public class VouchersController {

	private static final String UNAUTHORIZED_PERMIT_ALL = "Bearer JWT không được áp dụng: backend đang permit-all (mặc định APP_SECURITY_MODE). "
			+ "Đặt APP_SECURITY_MODE=jwt-api (hoặc app.security.api-protection=jwt-api), khởi động lại, đăng nhập rồi gửi lại request.";

	private static final String UNAUTHORIZED_NO_JWT_PRINCIPAL = "Không có JWT hợp lệ trong phiên bảo mật. "
			+ "Kiểm tra Header Authorization: Bearer <accessToken>.";

	private final VoucherService voucherService;

	public VouchersController(VoucherService voucherService) {
		this.voucherService = voucherService;
	}

	@GetMapping
	@PreAuthorize("hasAuthority('can_manage_orders')")
	public ResponseEntity<ApiSuccessResponse<VoucherListPageData>> list(Authentication authentication,
			@RequestParam(required = false, defaultValue = "1") int page,
			@RequestParam(required = false) Integer limit) {
		requireJwt(authentication);
		VoucherListPageData data = voucherService.listRetailApplicable(page, limit);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thao tác thành công"));
	}

	@GetMapping("/{id:[0-9]+}")
	@PreAuthorize("hasAuthority('can_manage_orders')")
	public ResponseEntity<ApiSuccessResponse<VoucherListItemData>> getById(Authentication authentication,
			@PathVariable("id") String idRaw) {
		requireJwt(authentication);
		int id = parsePositiveIntId(idRaw);
		return ResponseEntity.ok(ApiSuccessResponse.of(voucherService.getById(id), "Thao tác thành công"));
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
