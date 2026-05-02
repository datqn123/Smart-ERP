package com.example.smart_erp.inventory.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import java.util.Map;

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
import com.example.smart_erp.inventory.dispatch.ManualStockDispatchService;
import com.example.smart_erp.inventory.dispatch.OrderLinkedDispatchService;
import com.example.smart_erp.inventory.dispatch.StockDispatchCreateRequest;
import com.example.smart_erp.inventory.dispatch.StockDispatchFromOrderRequest;
import com.example.smart_erp.inventory.dispatch.StockDispatchPatchRequest;
import com.example.smart_erp.inventory.dispatch.StockDispatchSoftDeleteRequest;
import com.example.smart_erp.inventory.dispatch.response.StockDispatchCreatedData;
import com.example.smart_erp.inventory.dispatch.response.StockDispatchDetailData;
import com.example.smart_erp.inventory.dispatch.response.StockDispatchListPageData;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
@Validated
public class StockDispatchesController {

	private static final String UNAUTHORIZED_NO_JWT_PRINCIPAL = "Không có JWT hợp lệ trong phiên bảo mật.";

	private final ManualStockDispatchService manualStockDispatchService;
	private final OrderLinkedDispatchService orderLinkedDispatchService;

	public StockDispatchesController(ManualStockDispatchService manualStockDispatchService,
			OrderLinkedDispatchService orderLinkedDispatchService) {
		this.manualStockDispatchService = manualStockDispatchService;
		this.orderLinkedDispatchService = orderLinkedDispatchService;
	}

	@GetMapping("/stock-dispatches")
	@PreAuthorize("hasAuthority('can_manage_inventory')")
	public ResponseEntity<ApiSuccessResponse<StockDispatchListPageData>> list(Authentication authentication,
			@RequestParam(name = "search", required = false) String search,
			@RequestParam(name = "status", required = false) String status,
			@RequestParam(name = "dateFrom", required = false) String dateFrom,
			@RequestParam(name = "dateTo", required = false) String dateTo,
			@RequestParam(name = "mine", required = false, defaultValue = "false") boolean mine,
			@RequestParam(name = "page", required = false, defaultValue = "1") int page,
			@RequestParam(name = "limit", required = false, defaultValue = "20") int limit) {
		Jwt jwt = requireJwt(authentication);
		StockDispatchListPageData data = manualStockDispatchService.list(search, status, dateFrom, dateTo, mine, page,
				limit, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	@GetMapping("/stock-dispatches/{id:\\d+}")
	@PreAuthorize("hasAuthority('can_manage_inventory')")
	public ResponseEntity<ApiSuccessResponse<StockDispatchDetailData>> getById(Authentication authentication,
			@PathVariable long id) {
		Jwt jwt = requireJwt(authentication);
		var data = manualStockDispatchService.getDetail(id, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	/** Xuất kho thủ công từ dòng tồn (màn Tồn kho). */
	@PostMapping("/stock-dispatches")
	@PreAuthorize("hasAuthority('can_manage_inventory')")
	public ResponseEntity<ApiSuccessResponse<StockDispatchCreatedData>> create(Authentication authentication,
			@Valid @RequestBody StockDispatchCreateRequest body) {
		Jwt jwt = requireJwt(authentication);
		StockDispatchCreatedData data = manualStockDispatchService.createManual(body, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã tạo phiếu xuất kho"));
	}

	/** Phiếu xuất gắn đơn hàng — Pending / Partial (thiếu tồn), chờ Owner/Admin duyệt hoặc xử lý. */
	@PostMapping("/stock-dispatches/from-order")
	@PreAuthorize("hasAuthority('can_manage_inventory')")
	public ResponseEntity<ApiSuccessResponse<StockDispatchCreatedData>> createFromOrder(Authentication authentication,
			@Valid @RequestBody StockDispatchFromOrderRequest body) {
		Jwt jwt = requireJwt(authentication);
		StockDispatchCreatedData data = orderLinkedDispatchService.createFromOrder(body, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã tạo phiếu xuất kho gắn đơn"));
	}

	@PostMapping("/stock-dispatches/{id:\\d+}/approve")
	@PreAuthorize("hasAuthority('can_manage_inventory')")
	public ResponseEntity<ApiSuccessResponse<StockDispatchDetailData>> approve(Authentication authentication,
			@PathVariable long id) {
		Jwt jwt = requireJwt(authentication);
		StockDispatchDetailData data = manualStockDispatchService.approveOrderLinkedDispatch(id, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã duyệt phiếu — chuyển sang chờ xuất"));
	}

	@PatchMapping("/stock-dispatches/{id:\\d+}")
	@PreAuthorize("hasAuthority('can_manage_inventory')")
	public ResponseEntity<ApiSuccessResponse<StockDispatchDetailData>> patchDispatch(Authentication authentication,
			@PathVariable long id, @Valid @RequestBody StockDispatchPatchRequest body) {
		Jwt jwt = requireJwt(authentication);
		var data = manualStockDispatchService.patchManual(id, body, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã cập nhật phiếu xuất kho"));
	}

	/** Xóa mềm — body gồm lý do (ghi cho người tạo khi tra cứu). */
	@PostMapping("/stock-dispatches/{id:\\d+}/soft-delete")
	@PreAuthorize("hasAuthority('can_manage_inventory')")
	public ResponseEntity<ApiSuccessResponse<Object>> softDelete(Authentication authentication, @PathVariable long id,
			@Valid @RequestBody StockDispatchSoftDeleteRequest body) {
		Jwt jwt = requireJwt(authentication);
		manualStockDispatchService.softDeleteManual(id, body, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(Map.of(), "Đã xóa mềm phiếu xuất kho"));
	}

	private static Jwt requireJwt(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()
				|| authentication instanceof AnonymousAuthenticationToken) {
			throw new BusinessException(ApiErrorCode.UNAUTHORIZED, UNAUTHORIZED_NO_JWT_PRINCIPAL);
		}
		Object p = authentication.getPrincipal();
		if (!(p instanceof Jwt jwt)) {
			throw new BusinessException(ApiErrorCode.UNAUTHORIZED, UNAUTHORIZED_NO_JWT_PRINCIPAL);
		}
		return jwt;
	}
}
