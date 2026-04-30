package com.example.smart_erp.settings.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.api.ApiSuccessResponse;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.settings.systemlogs.SystemLogsService;
import com.example.smart_erp.settings.systemlogs.response.SystemLogDetailData;
import com.example.smart_erp.settings.systemlogs.response.SystemLogsListData;

import jakarta.validation.constraints.Positive;

/**
 * Task086–088 — System Logs (list + delete).
 */
@RestController
@RequestMapping("/api/v1/system-logs")
@Validated
public class SystemLogsController {

	private static final String UNAUTHORIZED_PERMIT_ALL = "Bearer JWT không được áp dụng: backend đang permit-all (mặc định APP_SECURITY_MODE). "
			+ "Đặt APP_SECURITY_MODE=jwt-api (hoặc app.security.api-protection=jwt-api), khởi động lại, đăng nhập Task001 rồi gửi lại request.";

	private static final String UNAUTHORIZED_NO_JWT_PRINCIPAL = "Không có JWT hợp lệ trong phiên bảo mật. "
			+ "Kiểm tra Header Authorization: Bearer <accessToken>; nếu đã bật jwt-api, access token có thể đã hết hạn — đăng nhập hoặc refresh lại.";

	private final SystemLogsService service;

	public SystemLogsController(SystemLogsService service) {
		this.service = service;
	}

	@GetMapping
	public ResponseEntity<ApiSuccessResponse<SystemLogsListData>> list(Authentication authentication,
			@RequestParam(required = false) String search,
			@RequestParam(required = false) String module,
			@RequestParam(required = false) String logLevel,
			@RequestParam(required = false) String dateFrom,
			@RequestParam(required = false) String dateTo,
			@RequestParam(required = false) Integer page,
			@RequestParam(required = false) Integer limit) {
		Jwt jwt = requireJwt(authentication);
		SystemLogsListData data = service.list(search, module, logLevel, dateFrom, dateTo, page, limit, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiSuccessResponse<SystemLogDetailData>> getDetail(Authentication authentication,
			@PathVariable("id") @Positive long id) {
		Jwt jwt = requireJwt(authentication);
		SystemLogDetailData data = service.getDetail(id, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Thành công"));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(Authentication authentication, @PathVariable("id") @Positive long id) {
		Jwt jwt = requireJwt(authentication);
		service.deleteById(id, jwt);
		return ResponseEntity.noContent().build();
	}

	@PostMapping(path = "/bulk-delete", consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ApiSuccessResponse<Map<String, Integer>>> bulkDelete(Authentication authentication,
			@RequestBody Map<String, Object> body) {
		Jwt jwt = requireJwt(authentication);
		List<Long> ids = parseIds(body);
		service.bulkDelete(ids, jwt);
		return ResponseEntity.ok(ApiSuccessResponse.of(Map.of("deletedCount", 0), "Thành công"));
	}

	private static List<Long> parseIds(Map<String, Object> body) {
		if (body == null || !body.containsKey("ids")) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of("ids", "Bắt buộc"));
		}
		Object ids = body.get("ids");
		if (!(ids instanceof List<?> list) || list.isEmpty()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of("ids", "Không hợp lệ"));
		}
		if (list.size() > 100) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of("ids", "Danh sách id tối đa 100 phần tử"));
		}
		var out = new java.util.ArrayList<Long>();
		for (Object it : list) {
			if (it instanceof Number n) {
				long v = n.longValue();
				if (v <= 0) {
					throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of("ids", "Không hợp lệ"));
				}
				out.add(v);
			}
			else {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", Map.of("ids", "Không hợp lệ"));
			}
		}
		return out;
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

