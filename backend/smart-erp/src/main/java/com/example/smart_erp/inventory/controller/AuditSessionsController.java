package com.example.smart_erp.inventory.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
import com.example.smart_erp.inventory.audit.AuditApplyVarianceRequest;
import com.example.smart_erp.inventory.audit.AuditLinesPatchRequest;
import com.example.smart_erp.inventory.audit.AuditSessionCancelRequest;
import com.example.smart_erp.inventory.audit.AuditSessionCompleteRequest;
import com.example.smart_erp.inventory.audit.AuditSessionCreateRequest;
import com.example.smart_erp.inventory.audit.AuditSessionPatchRequest;
import com.example.smart_erp.inventory.audit.query.AuditSessionListQuery;
import com.example.smart_erp.inventory.audit.response.AuditApplyVarianceData;
import com.example.smart_erp.inventory.audit.response.AuditSessionDetailData;
import com.example.smart_erp.inventory.audit.response.AuditSessionListPageData;
import com.example.smart_erp.inventory.audit.service.AuditSessionService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/api/v1/inventory/audit-sessions")
@Validated
public class AuditSessionsController {

	private static final String UNAUTHORIZED_PERMIT_ALL = "Bearer JWT không được áp dụng: backend đang permit-all (mặc định APP_SECURITY_MODE). "
			+ "Đặt APP_SECURITY_MODE=jwt-api (hoặc app.security.api-protection=jwt-api), khởi động lại, đăng nhập Task001 rồi gửi lại request.";

	private static final String UNAUTHORIZED_NO_JWT_PRINCIPAL = "Không có JWT hợp lệ trong phiên bảo mật. "
			+ "Kiểm tra Header Authorization: Bearer <accessToken>; nếu đã bật jwt-api, access token có thể đã hết hạn — đăng nhập hoặc refresh lại.";

	private final AuditSessionService auditSessionService;

	public AuditSessionsController(AuditSessionService auditSessionService) {
		this.auditSessionService = auditSessionService;
	}

	@GetMapping
	@PreAuthorize("hasAuthority('can_manage_inventory')")
	public ResponseEntity<ApiSuccessResponse<AuditSessionListPageData>> list(Authentication authentication,
			@RequestParam(name = "search", required = false) String search,
			@RequestParam(name = "status", required = false) String status,
			@RequestParam(name = "dateFrom", required = false) String dateFrom,
			@RequestParam(name = "dateTo", required = false) String dateTo,
			@RequestParam(name = "page", required = false) String page,
			@RequestParam(name = "limit", required = false) String limit) {
		requireJwt(authentication);
		AuditSessionListQuery q = AuditSessionListQuery.of(search, status, dateFrom, dateTo, page, limit);
		AuditSessionListPageData data = auditSessionService.list(q);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	@PostMapping
	@PreAuthorize("hasAuthority('can_manage_inventory')")
	public ResponseEntity<ApiSuccessResponse<AuditSessionDetailData>> create(Authentication authentication,
			@Valid @RequestBody AuditSessionCreateRequest body) {
		Jwt jwt = requireJwt(authentication);
		AuditSessionDetailData data = auditSessionService.create(body, jwt);
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiSuccessResponse.of(data, "Đã tạo đợt kiểm kê"));
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasAuthority('can_manage_inventory')")
	public ResponseEntity<ApiSuccessResponse<AuditSessionDetailData>> getById(Authentication authentication,
			@PathVariable("id") @Positive long id) {
		requireJwt(authentication);
		AuditSessionDetailData data = auditSessionService.getById(id);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	@PatchMapping("/{id}")
	@PreAuthorize("hasAuthority('can_manage_inventory')")
	public ResponseEntity<ApiSuccessResponse<AuditSessionDetailData>> patch(Authentication authentication,
			@PathVariable("id") @Positive long id, @Valid @RequestBody AuditSessionPatchRequest body) {
		requireJwt(authentication);
		AuditSessionDetailData data = auditSessionService.patch(id, body);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã cập nhật đợt kiểm kê"));
	}

	@PatchMapping("/{id}/lines")
	@PreAuthorize("hasAuthority('can_manage_inventory')")
	public ResponseEntity<ApiSuccessResponse<AuditSessionDetailData>> patchLines(Authentication authentication,
			@PathVariable("id") @Positive long id, @Valid @RequestBody AuditLinesPatchRequest body) {
		requireJwt(authentication);
		AuditSessionDetailData data = auditSessionService.patchLines(id, body);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã cập nhật dòng kiểm kê"));
	}

	@PostMapping("/{id}/complete")
	@PreAuthorize("hasAuthority('can_manage_inventory')")
	public ResponseEntity<ApiSuccessResponse<AuditSessionDetailData>> complete(Authentication authentication,
			@PathVariable("id") @Positive long id, @Valid @RequestBody(required = false) AuditSessionCompleteRequest body) {
		Jwt jwt = requireJwt(authentication);
		AuditSessionCompleteRequest b = body != null ? body : new AuditSessionCompleteRequest(null);
		AuditSessionDetailData data = auditSessionService.complete(id, b, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã hoàn tất đợt kiểm kê"));
	}

	@PostMapping("/{id}/cancel")
	@PreAuthorize("hasAuthority('can_manage_inventory')")
	public ResponseEntity<ApiSuccessResponse<AuditSessionDetailData>> cancel(Authentication authentication,
			@PathVariable("id") @Positive long id, @Valid @RequestBody(required = false) AuditSessionCancelRequest body) {
		requireJwt(authentication);
		AuditSessionDetailData data = auditSessionService.cancel(id, body);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã hủy đợt kiểm kê"));
	}

	@PostMapping("/{id}/apply-variance")
	@PreAuthorize("hasAuthority('can_manage_inventory')")
	public ResponseEntity<ApiSuccessResponse<AuditApplyVarianceData>> applyVariance(Authentication authentication,
			@PathVariable("id") @Positive long id, @Valid @RequestBody AuditApplyVarianceRequest body) {
		Jwt jwt = requireJwt(authentication);
		AuditApplyVarianceData data = auditSessionService.applyVariance(id, body, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã áp chênh lệch kiểm kê lên tồn kho"));
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
