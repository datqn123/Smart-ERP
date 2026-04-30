package com.example.smart_erp.settings.storeprofile;

import java.net.URI;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.example.smart_erp.catalog.media.CloudinaryMediaService;
import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.inventory.receipts.lifecycle.StockReceiptAccessPolicy;
import com.example.smart_erp.settings.storeprofile.response.StoreLogoUploadData;
import com.example.smart_erp.settings.storeprofile.response.StoreProfileData;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * Task073–075 — nghiệp vụ StoreProfiles.
 */
@Service
@SuppressWarnings("null")
public class StoreProfileService {

	private static final String DEFAULT_STORE_NAME = "Cửa hàng mặc định";

	private static final Set<String> PATCH_KEYS = Set.of("name", "businessCategory", "address", "phone", "email", "website", "taxCode",
			"footerNote", "logoUrl", "facebookUrl", "instagramHandle", "defaultRetailLocationId");

	private static final String MSG_PATCH_EMPTY = "Thông tin không hợp lệ: cần ít nhất một trường cập nhật";
	private static final String MSG_BAD_FIELD = "Thông tin không hợp lệ: trường không được phép";

	private final StoreProfileJdbcRepository repo;
	private final CloudinaryMediaService media;

	public StoreProfileService(StoreProfileJdbcRepository repo, CloudinaryMediaService media) {
		this.repo = repo;
		this.media = media;
	}

	@Transactional
	public StoreProfileData getOrCreate(Jwt jwt) {
		int ownerId = StockReceiptAccessPolicy.parseUserId(jwt);
		repo.ensureExists(ownerId, DEFAULT_STORE_NAME);
		return repo.findByOwnerId(ownerId).orElseThrow(() -> new IllegalStateException("Không load được store profile"));
	}

	@Transactional
	public StoreProfileData patch(JsonNode body, Jwt jwt) {
		if (body == null || !body.isObject() || body.isEmpty()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, MSG_PATCH_EMPTY, Map.of("body", "Cần ít nhất một trường"));
		}
		int ownerId = StockReceiptAccessPolicy.parseUserId(jwt);
		repo.ensureExists(ownerId, DEFAULT_STORE_NAME);

		Iterator<String> it = body.fieldNames();
		while (it.hasNext()) {
			String k = it.next();
			if (!PATCH_KEYS.contains(k)) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, MSG_BAD_FIELD + ": " + k);
			}
		}

		Map<String, Object> patch = StoreProfileJdbcRepository.newOrderedPatchMap();
		if (body.has("name")) {
			patch.put("name", readRequiredNonBlank(body.get("name"), "name"));
		}
		if (body.has("businessCategory")) {
			patch.put("business_category", readNullableMax(body.get("businessCategory"), 255, "businessCategory"));
		}
		if (body.has("address")) {
			patch.put("address", readNullableMax(body.get("address"), 2000, "address"));
		}
		if (body.has("phone")) {
			patch.put("phone", readNullableMax(body.get("phone"), 30, "phone"));
		}
		if (body.has("email")) {
			String email = readNullableMax(body.get("email"), 255, "email");
			if (email != null && !email.isBlank() && !email.contains("@")) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of("email", "Email không hợp lệ"));
			}
			patch.put("email", emptyToNull(email));
		}
		if (body.has("website")) {
			String website = readNullableMax(body.get("website"), 500, "website");
			website = emptyToNull(website);
			if (website != null) {
				validateUrl(website, "website");
			}
			patch.put("website", website);
		}
		if (body.has("taxCode")) {
			patch.put("tax_code", readNullableMax(body.get("taxCode"), 50, "taxCode"));
		}
		if (body.has("footerNote")) {
			patch.put("footer_note", readNullableMax(body.get("footerNote"), 5000, "footerNote"));
		}
		if (body.has("logoUrl")) {
			String url = readNullableMax(body.get("logoUrl"), 500, "logoUrl");
			url = emptyToNull(url);
			if (url != null) {
				validateUrl(url, "logoUrl");
			}
			patch.put("logo_url", url);
		}
		if (body.has("facebookUrl")) {
			String url = readNullableMax(body.get("facebookUrl"), 500, "facebookUrl");
			url = emptyToNull(url);
			if (url != null) {
				validateUrl(url, "facebookUrl");
			}
			patch.put("facebook_url", url);
		}
		if (body.has("instagramHandle")) {
			patch.put("instagram_handle", readNullableMax(body.get("instagramHandle"), 255, "instagramHandle"));
		}
		if (body.has("defaultRetailLocationId")) {
			Integer id = readNullablePositiveInt(body.get("defaultRetailLocationId"), "defaultRetailLocationId");
			if (id != null && !repo.existsWarehouseLocation(id)) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ",
						Map.of("defaultRetailLocationId", "Không tìm thấy vị trí kho"));
			}
			patch.put("default_retail_location_id", id);
		}

		repo.updatePartial(ownerId, patch);
		return repo.findByOwnerId(ownerId).orElseThrow(() -> new IllegalStateException("Không load được store profile"));
	}

	@Transactional
	public StoreLogoUploadData uploadLogo(MultipartFile file, Jwt jwt) {
		int ownerId = StockReceiptAccessPolicy.parseUserId(jwt);
		repo.ensureExists(ownerId, DEFAULT_STORE_NAME);
		String url = media.uploadStoreProfileLogo(file, ownerId);
		repo.updateLogoUrl(ownerId, url);
		StoreProfileData p = repo.findByOwnerId(ownerId).orElseThrow(() -> new IllegalStateException("Không load được store profile"));
		return new StoreLogoUploadData(p.logoUrl(), p.updatedAt());
	}

	private static String readRequiredNonBlank(JsonNode n, String field) {
		if (n == null || n.isNull()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of(field, "Không được để trống"));
		}
		if (!n.isTextual()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of(field, "Không hợp lệ"));
		}
		String t = n.asText();
		if (!StringUtils.hasText(t)) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of(field, "Không được để trống"));
		}
		return t.trim();
	}

	private static String readNullableMax(JsonNode n, int max, String field) {
		if (n == null || n.isNull()) {
			return null;
		}
		if (!n.isTextual()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of(field, "Không hợp lệ"));
		}
		String t = n.asText();
		if (t != null && t.length() > max) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of(field, "Quá dài"));
		}
		return t != null ? t.trim() : null;
	}

	private static Integer readNullablePositiveInt(JsonNode n, String field) {
		if (n == null || n.isNull()) {
			return null;
		}
		if (!n.isInt() && !n.isLong()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of(field, "Không hợp lệ"));
		}
		long v = n.asLong();
		if (v <= 0 || v > Integer.MAX_VALUE) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of(field, "Không hợp lệ"));
		}
		return (int) v;
	}

	private static String emptyToNull(String s) {
		if (s == null) {
			return null;
		}
		String t = s.trim();
		return t.isEmpty() ? null : t;
	}

	private static void validateUrl(String raw, String field) {
		try {
			URI u = URI.create(raw.trim());
			String scheme = u.getScheme();
			if (!("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme))) {
				throw new IllegalArgumentException("bad scheme");
			}
		}
		catch (Exception e) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of(field, "URL không hợp lệ"));
		}
	}
}

