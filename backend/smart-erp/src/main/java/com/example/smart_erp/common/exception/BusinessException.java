package com.example.smart_erp.common.exception;

import java.util.Map;
import java.util.Objects;

import com.example.smart_erp.common.api.ApiErrorCode;

/**
 * Domain / business rule failure with a stable API error code and optional field details.
 */
public class BusinessException extends RuntimeException {

	private final ApiErrorCode code;
	private final Map<String, String> details;

	public BusinessException(ApiErrorCode code, String message) {
		super(message != null ? message : "");
		this.code = Objects.requireNonNull(code, "code");
		this.details = null;
	}

	public BusinessException(ApiErrorCode code, String message, Map<String, String> details) {
		super(message != null ? message : "");
		this.code = Objects.requireNonNull(code, "code");
		this.details = details;
	}

	public ApiErrorCode getCode() {
		return code;
	}

	public Map<String, String> getDetails() {
		return details;
	}
}
