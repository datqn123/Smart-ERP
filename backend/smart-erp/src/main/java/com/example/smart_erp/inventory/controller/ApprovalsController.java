package com.example.smart_erp.inventory.controller;

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
import com.example.smart_erp.inventory.approvals.ApprovalsAccessPolicy;
import com.example.smart_erp.inventory.approvals.ApprovalsService;
import com.example.smart_erp.inventory.approvals.response.ApprovalsHistoryPageData;
import com.example.smart_erp.inventory.approvals.response.ApprovalsPendingPageData;

@RestController
@RequestMapping("/api/v1")
@Validated
public class ApprovalsController {

	private static final String UNAUTHORIZED_PERMIT_ALL = "Bearer JWT không được áp dụng: backend đang permit-all (mặc định APP_SECURITY_MODE). "
			+ "Đặt APP_SECURITY_MODE=jwt-api (hoặc app.security.api-protection=jwt-api), khởi động lại, đăng nhập Task001 rồi gửi lại request.";

	private static final String UNAUTHORIZED_NO_JWT_PRINCIPAL = "Không có JWT hợp lệ trong phiên bảo mật. "
			+ "Kiểm tra Header Authorization: Bearer <accessToken>; nếu đã bật jwt-api, access token có thể đã hết hạn — đăng nhập hoặc refresh lại.";

	private static final String FORBIDDEN_PENDING = "Bạn không có quyền xem danh sách chờ phê duyệt.";
	private static final String FORBIDDEN_HISTORY = "Bạn không có quyền xem lịch sử phê duyệt.";

	private final ApprovalsService approvalsService;

	public ApprovalsController(ApprovalsService approvalsService) {
		this.approvalsService = approvalsService;
	}

	/** Task061 — SRS Task061–062 §8.A. */
	@GetMapping("/approvals/pending")
	public ResponseEntity<ApiSuccessResponse<ApprovalsPendingPageData>> pending(Authentication authentication,
			@RequestParam(name = "search", required = false) String search,
			@RequestParam(name = "type", required = false) String type,
			@RequestParam(name = "fromDate", required = false) String fromDate,
			@RequestParam(name = "toDate", required = false) String toDate,
			@RequestParam(name = "page", required = false) String page,
			@RequestParam(name = "limit", required = false) String limit) {
		Jwt jwt = requireJwt(authentication);
		ApprovalsAccessPolicy.assertOwnerOrAdmin(jwt, FORBIDDEN_PENDING);
		ApprovalsPendingPageData data = approvalsService.listPending(search, type, fromDate, toDate, page, limit);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	/** Task062 — SRS Task061–062 §8.B. */
	@GetMapping("/approvals/history")
	public ResponseEntity<ApiSuccessResponse<ApprovalsHistoryPageData>> history(Authentication authentication,
			@RequestParam(name = "resolution", required = false) String resolution,
			@RequestParam(name = "search", required = false) String search,
			@RequestParam(name = "type", required = false) String type,
			@RequestParam(name = "fromDate", required = false) String fromDate,
			@RequestParam(name = "toDate", required = false) String toDate,
			@RequestParam(name = "page", required = false) String page,
			@RequestParam(name = "limit", required = false) String limit) {
		Jwt jwt = requireJwt(authentication);
		ApprovalsAccessPolicy.assertOwnerOrAdmin(jwt, FORBIDDEN_HISTORY);
		ApprovalsHistoryPageData data = approvalsService.listHistory(resolution, search, type, fromDate, toDate, page,
				limit);
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
