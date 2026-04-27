package com.example.smart_erp.catalog.controller;

import java.util.Map;

import org.springframework.http.MediaType;
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
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.JsonNode;

import com.example.smart_erp.catalog.dto.ProductCreateRequest;
import com.example.smart_erp.catalog.dto.ProductImageCreateRequest;
import com.example.smart_erp.catalog.dto.ProductsBulkDeleteRequest;
import com.example.smart_erp.catalog.response.ProductBulkDeleteData;
import com.example.smart_erp.catalog.response.ProductCreatedData;
import com.example.smart_erp.catalog.response.ProductDeleteData;
import com.example.smart_erp.catalog.response.ProductDetailData;
import com.example.smart_erp.catalog.response.ProductImageData;
import com.example.smart_erp.catalog.response.ProductListPageData;
import com.example.smart_erp.catalog.service.ProductImageService;
import com.example.smart_erp.catalog.service.ProductService;
import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.api.ApiSuccessResponse;
import com.example.smart_erp.common.exception.BusinessException;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/products")
@Validated
public class ProductsController {

	private static final String UNAUTHORIZED_PERMIT_ALL = "Bearer JWT không được áp dụng: backend đang permit-all (mặc định APP_SECURITY_MODE). "
			+ "Đặt APP_SECURITY_MODE=jwt-api (hoặc app.security.api-protection=jwt-api), khởi động lại, đăng nhập Task001 rồi gửi lại request.";

	private static final String UNAUTHORIZED_NO_JWT_PRINCIPAL = "Không có JWT hợp lệ trong phiên bảo mật. "
			+ "Kiểm tra Header Authorization: Bearer <accessToken>; nếu đã bật jwt-api, access token có thể đã hết hạn — đăng nhập hoặc refresh lại.";

	private final ProductImageService productImageService;
	private final ProductService productService;

	public ProductsController(ProductImageService productImageService, ProductService productService) {
		this.productImageService = productImageService;
		this.productService = productService;
	}

	@GetMapping
	@PreAuthorize("hasAuthority('can_manage_products')")
	public ResponseEntity<ApiSuccessResponse<ProductListPageData>> list(Authentication authentication,
			@RequestParam(required = false) String search, @RequestParam(required = false) Integer categoryId,
			@RequestParam(required = false, defaultValue = "all") String status,
			@RequestParam(required = false, defaultValue = "1") int page,
			@RequestParam(required = false, defaultValue = "20") int limit,
			@RequestParam(required = false) String sort) {
		requireJwt(authentication);
		ProductListPageData data = productService.list(search, categoryId, status, page, limit, sort);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	@PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAuthority('can_manage_products')")
	public ResponseEntity<ApiSuccessResponse<ProductCreatedData>> create(Authentication authentication,
			@Valid @RequestBody ProductCreateRequest body) {
		requireJwt(authentication);
		ProductCreatedData data = productService.create(body);
		return ResponseEntity.status(201).body(ApiSuccessResponse.of(data, "Đã tạo sản phẩm"));
	}

	@GetMapping("/{id:\\d+}")
	@PreAuthorize("hasAuthority('can_manage_products')")
	public ResponseEntity<ApiSuccessResponse<ProductDetailData>> getById(Authentication authentication,
			@PathVariable("id") String idRaw) {
		requireJwt(authentication);
		int productId = parsePositiveIntId(idRaw);
		ProductDetailData data = productService.getById(productId);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	@PatchMapping(value = "/{id:\\d+}", consumes = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAuthority('can_manage_products')")
	public ResponseEntity<ApiSuccessResponse<ProductDetailData>> patch(Authentication authentication,
			@PathVariable("id") String idRaw, @RequestBody JsonNode body) {
		requireJwt(authentication);
		int productId = parsePositiveIntId(idRaw);
		ProductDetailData data = productService.patch(productId, body);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	@DeleteMapping("/{id:\\d+}")
	@PreAuthorize("hasAuthority('can_manage_products')")
	public ResponseEntity<ApiSuccessResponse<ProductDeleteData>> delete(Authentication authentication,
			@PathVariable("id") String idRaw) {
		Jwt jwt = requireJwt(authentication);
		int productId = parsePositiveIntId(idRaw);
		ProductDeleteData data = productService.delete(productId, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã xóa sản phẩm"));
	}

	@PostMapping(value = "/bulk-delete", consumes = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAuthority('can_manage_products')")
	public ResponseEntity<ApiSuccessResponse<ProductBulkDeleteData>> bulkDelete(Authentication authentication,
			@Valid @RequestBody ProductsBulkDeleteRequest body) {
		Jwt jwt = requireJwt(authentication);
		ProductBulkDeleteData data = productService.bulkDelete(body, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đã xóa các sản phẩm"));
	}

	@PostMapping(value = "/{id:\\d+}/images", consumes = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAuthority('can_manage_products')")
	public ResponseEntity<ApiSuccessResponse<ProductImageData>> addImageJson(Authentication authentication,
			@PathVariable("id") String idRaw, @Valid @RequestBody ProductImageCreateRequest body) {
		requireJwt(authentication);
		int productId = parsePositiveIntId(idRaw);
		ProductImageData data = productImageService.addImageFromJson(productId, body);
		return ResponseEntity.status(201).body(ApiSuccessResponse.of(data, "Đã thêm ảnh"));
	}

	@PostMapping(value = "/{id:\\d+}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@PreAuthorize("hasAuthority('can_manage_products')")
	public ResponseEntity<ApiSuccessResponse<ProductImageData>> addImageMultipart(Authentication authentication,
			@PathVariable("id") String idRaw, @RequestParam("file") MultipartFile file,
			@RequestParam(value = "sortOrder", required = false) Integer sortOrder,
			@RequestParam(value = "isPrimary", required = false) Boolean isPrimary) {
		requireJwt(authentication);
		int productId = parsePositiveIntId(idRaw);
		if (file == null || file.isEmpty()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thiếu file",
					Map.of("file", "Multipart part 'file' là bắt buộc"));
		}
		int sort = sortOrder != null ? sortOrder : 0;
		if (sort < 0) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "sortOrder không hợp lệ",
					Map.of("sortOrder", "Phải >= 0"));
		}
		boolean primary = Boolean.TRUE.equals(isPrimary);
		ProductImageData data = productImageService.addImageFromMultipart(productId, file, sort, primary);
		return ResponseEntity.status(201).body(ApiSuccessResponse.of(data, "Đã thêm ảnh"));
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
