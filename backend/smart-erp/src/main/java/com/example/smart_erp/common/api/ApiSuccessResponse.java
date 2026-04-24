package com.example.smart_erp.common.api;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Success envelope: {@code success}, {@code data}, {@code message} — see {@code API_RESPONSE_ENVELOPE.md}.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiSuccessResponse<T>(boolean success, T data, String message) {

	public static <T> ApiSuccessResponse<T> of(T data, String message) {
		return new ApiSuccessResponse<>(true, data, message);
	}

	public static <T> ApiSuccessResponse<T> of(T data) {
		return of(data, "Thao tác thành công");
	}
}
