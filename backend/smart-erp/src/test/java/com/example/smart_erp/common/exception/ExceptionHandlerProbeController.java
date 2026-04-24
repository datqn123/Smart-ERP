package com.example.smart_erp.common.exception;

import com.example.smart_erp.common.api.ApiErrorCode;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Minimal controller for {@link GlobalExceptionHandlerWebMvcTest} only.
 */
@RestController
@RequestMapping("/api/v1/_probe")
public class ExceptionHandlerProbeController {

	@GetMapping("/business")
	public void business() {
		throw new BusinessException(ApiErrorCode.NOT_FOUND, "Không tìm thấy");
	}

	@GetMapping("/forbidden")
	public void forbidden() {
		throw new org.springframework.security.access.AccessDeniedException("denied");
	}
}
