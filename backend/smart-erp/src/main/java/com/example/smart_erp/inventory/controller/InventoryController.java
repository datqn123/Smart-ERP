package com.example.smart_erp.inventory.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.api.ApiSuccessResponse;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.inventory.query.InventoryListQuery;
import com.example.smart_erp.inventory.response.InventoryBulkPatchData;
import com.example.smart_erp.inventory.response.InventoryByIdData;
import com.example.smart_erp.inventory.response.InventoryListItemData;
import com.example.smart_erp.inventory.response.InventoryListPageData;
import com.example.smart_erp.inventory.response.InventorySummaryData;
import com.example.smart_erp.inventory.service.InventoryListService;
import com.example.smart_erp.inventory.service.InventoryPatchService;

@RestController
@RequestMapping("/api/v1")
public class InventoryController {

	private static final String UNAUTHORIZED_PERMIT_ALL = "Bearer JWT không được áp dụng: backend đang permit-all (mặc định APP_SECURITY_MODE). "
			+ "Đặt APP_SECURITY_MODE=jwt-api (hoặc app.security.api-protection=jwt-api), khởi động lại, đăng nhập Task001 rồi gửi lại request.";

	private static final String UNAUTHORIZED_NO_JWT_PRINCIPAL = "Không có JWT hợp lệ trong phiên bảo mật. "
			+ "Kiểm tra Header Authorization: Bearer <accessToken>; nếu đã bật jwt-api, access token có thể đã hết hạn — đăng nhập hoặc refresh lại.";

	private final InventoryListService inventoryListService;
	private final InventoryPatchService inventoryPatchService;

	public InventoryController(InventoryListService inventoryListService, InventoryPatchService inventoryPatchService) {
		this.inventoryListService = inventoryListService;
		this.inventoryPatchService = inventoryPatchService;
	}

	/** Task009 — chỉ KPI tồn (cùng filter {@code search}/{@code stockLevel}/{@code locationId}/{@code categoryId} như Task005). */
	@GetMapping("/inventory/summary")
	@PreAuthorize("hasAuthority('can_manage_inventory')")
	public ResponseEntity<ApiSuccessResponse<InventorySummaryData>> inventorySummary(Authentication authentication,
			@RequestParam(name = "search", required = false) String search,
			@RequestParam(name = "stockLevel", required = false) String stockLevel,
			@RequestParam(name = "locationId", required = false) String locationId,
			@RequestParam(name = "categoryId", required = false) String categoryId) {
		requireJwt(authentication);
		var q = InventoryListQuery.forSummaryFilters(search, stockLevel, locationId, categoryId);
		InventorySummaryData data = inventoryListService.summary(q);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	/** Task005 — danh sách tồn + summary KPI, đọc SRS Task005. */
	@GetMapping("/inventory")
	@PreAuthorize("hasAuthority('can_manage_inventory')")
	public ResponseEntity<ApiSuccessResponse<InventoryListPageData>> list(Authentication authentication,
			@RequestParam(name = "search", required = false) String search,
			@RequestParam(name = "stockLevel", required = false) String stockLevel,
			@RequestParam(name = "locationId", required = false) String locationId,
			@RequestParam(name = "categoryId", required = false) String categoryId,
			@RequestParam(name = "productId", required = false) String productId,
			@RequestParam(name = "page", required = false) String page,
			@RequestParam(name = "limit", required = false) String limit,
			@RequestParam(name = "sort", required = false) String sort) {
		requireJwt(authentication);
		InventoryListQuery q = InventoryListQuery.of(search, stockLevel, locationId, categoryId, productId, page, limit, sort);
		InventoryListPageData data = inventoryListService.list(q);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	/** Task006 — chi tiết một dòng tồn (+ {@code relatedLines} khi {@code include=relatedLines}). */
	@GetMapping("/inventory/{id:\\d+}")
	@PreAuthorize("hasAuthority('can_manage_inventory')")
	public ResponseEntity<ApiSuccessResponse<InventoryByIdData>> getById(Authentication authentication,
			@PathVariable("id") String idRaw, @RequestParam(name = "include", required = false) String include) {
		requireJwt(authentication);
		long id = parsePositiveInventoryId(idRaw);
		boolean includeRelated = parseIncludeRelatedLines(include);
		InventoryByIdData data = inventoryListService.getById(id, includeRelated);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	/** Task007 — cập nhật meta một dòng (partial JSON). */
	@PatchMapping("/inventory/{id:\\d+}")
	@PreAuthorize("hasAuthority('can_manage_inventory')")
	public ResponseEntity<ApiSuccessResponse<InventoryListItemData>> patchInventory(Authentication authentication,
			@PathVariable("id") String idRaw, @RequestBody JsonNode body) {
		Jwt jwt = requireJwt(authentication);
		long id = parsePositiveInventoryId(idRaw);
		InventoryListItemData data = inventoryPatchService.patchInventory(id, body, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã cập nhật thông tin tồn kho"));
	}

	/** Task008 — cập nhật meta nhiều dòng (all-or-nothing, tối đa 100 phần tử có thay đổi). */
	@PatchMapping("/inventory/bulk")
	@PreAuthorize("hasAuthority('can_manage_inventory')")
	public ResponseEntity<ApiSuccessResponse<InventoryBulkPatchData>> patchInventoryBulk(Authentication authentication,
			@RequestBody JsonNode body) {
		Jwt jwt = requireJwt(authentication);
		InventoryBulkPatchData data = inventoryPatchService.patchBulkInventory(body, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã cập nhật thông tin tồn kho (hàng loạt)"));
	}

	private static long parsePositiveInventoryId(String raw) {
		if (raw == null || raw.isBlank()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Tham số yêu cầu không hợp lệ",
					Map.of("id", "Giá trị phải là số nguyên dương"));
		}
		try {
			long v = Long.parseLong(raw.trim());
			if (v <= 0L) {
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

	private static boolean parseIncludeRelatedLines(String include) {
		if (include == null) {
			return false;
		}
		String t = include.trim();
		if (t.isEmpty()) {
			return false;
		}
		if ("relatedLines".equals(t)) {
			return true;
		}
		throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Tham số yêu cầu không hợp lệ",
				Map.of("include", "Giá trị hợp lệ: relatedLines (hoặc bỏ qua tham số)"));
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
