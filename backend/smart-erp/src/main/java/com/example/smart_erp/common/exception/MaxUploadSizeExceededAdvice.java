package com.example.smart_erp.common.exception;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.api.ApiErrorResponse;

/** {@code MaxUploadSizeExceededException} — multipart vượt {@code spring.servlet.multipart.*}. */
@RestControllerAdvice
@Order(Ordered.LOWEST_PRECEDENCE)
public class MaxUploadSizeExceededAdvice {

	@ExceptionHandler(MaxUploadSizeExceededException.class)
	@SuppressWarnings("unused")
	public ResponseEntity<ApiErrorResponse> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiErrorResponse.of(ApiErrorCode.BAD_REQUEST,
				"Dung lượng tải lên vượt quá giới hạn cho phép. Vui lòng giảm kích thước từng ảnh, giảm số ảnh trong một lần gửi, hoặc nén ảnh trước khi tải lên."));
	}
}
