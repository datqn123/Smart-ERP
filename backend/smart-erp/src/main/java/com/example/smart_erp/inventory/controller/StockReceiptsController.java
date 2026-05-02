package com.example.smart_erp.inventory.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

import java.util.Map;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.api.ApiSuccessResponse;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.inventory.receipts.lifecycle.StockReceiptApproveRequest;
import com.example.smart_erp.inventory.receipts.lifecycle.StockReceiptCreateRequest;
import com.example.smart_erp.inventory.receipts.lifecycle.StockReceiptLifecycleService;
import com.example.smart_erp.inventory.receipts.lifecycle.StockReceiptPatchRequest;
import com.example.smart_erp.inventory.receipts.lifecycle.StockReceiptRejectRequest;
import com.example.smart_erp.inventory.receipts.query.StockReceiptListQuery;
import com.example.smart_erp.inventory.receipts.response.StockReceiptListPageData;
import com.example.smart_erp.inventory.receipts.response.StockReceiptViewData;
import com.example.smart_erp.inventory.receipts.service.StockReceiptListService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/api/v1")
@Validated
public class StockReceiptsController {

	private static final String UNAUTHORIZED_PERMIT_ALL = "Bearer JWT không được áp dụng: backend đang permit-all (mặc định APP_SECURITY_MODE). "
			+ "Đặt APP_SECURITY_MODE=jwt-api (hoặc app.security.api-protection=jwt-api), khởi động lại, đăng nhập Task001 rồi gửi lại request.";

	private static final String UNAUTHORIZED_NO_JWT_PRINCIPAL = "Không có JWT hợp lệ trong phiên bảo mật. "
			+ "Kiểm tra Header Authorization: Bearer <accessToken>; nếu đã bật jwt-api, access token có thể đã hết hạn — đăng nhập hoặc refresh lại.";

	private final StockReceiptListService stockReceiptListService;
	private final StockReceiptLifecycleService stockReceiptLifecycleService;

	public StockReceiptsController(StockReceiptListService stockReceiptListService,
			StockReceiptLifecycleService stockReceiptLifecycleService) {
		this.stockReceiptListService = stockReceiptListService;
		this.stockReceiptLifecycleService = stockReceiptLifecycleService;
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
			@RequestParam(name = "mine", required = false) String mine,
			@RequestParam(name = "page", required = false) String page,
			@RequestParam(name = "limit", required = false) String limit,
			@RequestParam(name = "sort", required = false) String sort) {
		Jwt jwt = requireJwt(authentication);
		Integer mineStaffId = resolveMineStaffId(mine, jwt);
		StockReceiptListQuery q = StockReceiptListQuery.of(search, status, dateFrom, dateTo, supplierId, page, limit, sort,
				mineStaffId);
		StockReceiptListPageData data = stockReceiptListService.list(q);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	/** Task014 */
	@PostMapping("/stock-receipts")
	@PreAuthorize("hasAuthority('can_manage_inventory')")
	public ResponseEntity<ApiSuccessResponse<StockReceiptViewData>> create(Authentication authentication,
			@Valid @RequestBody StockReceiptCreateRequest body) {
		Jwt jwt = requireJwt(authentication);
		StockReceiptViewData data = stockReceiptLifecycleService.create(body, jwt);
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiSuccessResponse.of(data, "Đã tạo phiếu nhập kho"));
	}

	/** Task015 */
	@GetMapping("/stock-receipts/{id}")
	@PreAuthorize("hasAuthority('can_manage_inventory')")
	public ResponseEntity<ApiSuccessResponse<StockReceiptViewData>> getById(Authentication authentication,
			@PathVariable("id") @Positive long id) {
		requireJwt(authentication);
		StockReceiptViewData data = stockReceiptLifecycleService.getById(id);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	/** Task016 */
	@PatchMapping("/stock-receipts/{id}")
	@PreAuthorize("hasAuthority('can_manage_inventory')")
	public ResponseEntity<ApiSuccessResponse<StockReceiptViewData>> patch(Authentication authentication,
			@PathVariable("id") @Positive long id, @Valid @RequestBody StockReceiptPatchRequest body) {
		Jwt jwt = requireJwt(authentication);
		StockReceiptViewData data = stockReceiptLifecycleService.patch(id, body, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã cập nhật phiếu nhập kho"));
	}

	/** Task017 */
	@DeleteMapping("/stock-receipts/{id}")
	@PreAuthorize("hasAuthority('can_manage_inventory')")
	public ResponseEntity<ApiSuccessResponse<Object>> delete(Authentication authentication,
			@PathVariable("id") @Positive long id) {
		Jwt jwt = requireJwt(authentication);
		stockReceiptLifecycleService.delete(id, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(null, "Đã xóa phiếu nhập kho"));
	}

	/** Task018 */
	@PostMapping("/stock-receipts/{id}/submit")
	@PreAuthorize("hasAuthority('can_manage_inventory')")
	public ResponseEntity<ApiSuccessResponse<StockReceiptViewData>> submit(Authentication authentication,
			@PathVariable("id") @Positive long id) {
		Jwt jwt = requireJwt(authentication);
		StockReceiptViewData data = stockReceiptLifecycleService.submit(id, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã gửi yêu cầu duyệt"));
	}

	/** Task019 — {@code can_approve} + JWT {@code role} Admin hoặc Owner. */
	@PostMapping("/stock-receipts/{id}/approve")
	@PreAuthorize("hasAuthority('can_approve')")
	public ResponseEntity<ApiSuccessResponse<StockReceiptViewData>> approve(Authentication authentication,
			@PathVariable("id") @Positive long id, @Valid @RequestBody StockReceiptApproveRequest body) {
		Jwt jwt = requireJwt(authentication);
		StockReceiptViewData data = stockReceiptLifecycleService.approve(id, body, jwt, authentication);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã phê duyệt phiếu nhập kho"));
	}

	/** Task020 — cùng rule Admin/Owner với Task019. */
	@PostMapping("/stock-receipts/{id}/reject")
	@PreAuthorize("hasAuthority('can_approve')")
	public ResponseEntity<ApiSuccessResponse<StockReceiptViewData>> reject(Authentication authentication,
			@PathVariable("id") @Positive long id, @Valid @RequestBody StockReceiptRejectRequest body) {
		Jwt jwt = requireJwt(authentication);
		StockReceiptViewData data = stockReceiptLifecycleService.reject(id, body, jwt, authentication);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã từ chối phiếu nhập kho"));
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

	/** {@code mine=true} → lọc {@code staff_id} = JWT subject (không tin staffId từ client). */
	private static Integer resolveMineStaffId(String mineRaw, Jwt jwt) {
		if (!parseTruthLike(mineRaw)) {
			return null;
		}
		String sub = jwt.getSubject();
		if (sub == null || sub.isBlank()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Tham số yêu cầu không hợp lệ",
					Map.of("mine", "Không xác định được người dùng từ JWT"));
		}
		try {
			int v = Integer.parseInt(sub.trim());
			if (v <= 0) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Tham số yêu cầu không hợp lệ",
						Map.of("mine", "JWT subject phải là id nhân viên dương"));
			}
			return v;
		}
		catch (NumberFormatException e) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Tham số yêu cầu không hợp lệ",
					Map.of("mine", "JWT subject phải là số nguyên (staff id)"));
		}
	}

	private static boolean parseTruthLike(String raw) {
		if (raw == null || raw.isBlank()) {
			return false;
		}
		String s = raw.trim().toLowerCase();
		return "true".equals(s) || "1".equals(s) || "yes".equals(s);
	}
}
