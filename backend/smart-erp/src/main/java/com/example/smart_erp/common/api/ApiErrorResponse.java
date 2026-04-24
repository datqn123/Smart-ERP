package com.example.smart_erp.common.api;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Error envelope: {@code success}, {@code error}, {@code message}, optional {@code details}.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiErrorResponse(boolean success, String error, String message, Map<String, String> details) {

	public static ApiErrorResponse of(ApiErrorCode code, String message, Map<String, String> details) {
		return new ApiErrorResponse(false, code.name(), message, details);
	}

	public static ApiErrorResponse of(ApiErrorCode code, String message) {
		return of(code, message, null);
	}
}
