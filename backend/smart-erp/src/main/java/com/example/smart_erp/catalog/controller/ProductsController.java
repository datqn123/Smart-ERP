package com.example.smart_erp.catalog.controller;

import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.smart_erp.catalog.dto.ProductImageCreateRequest;
import com.example.smart_erp.catalog.response.ProductImageData;
import com.example.smart_erp.catalog.service.ProductImageService;
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

	public ProductsController(ProductImageService productImageService) {
		this.productImageService = productImageService;
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
