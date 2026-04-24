package com.example.smart_erp.common.exception;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.api.ApiErrorResponse;

import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
@Order(Ordered.LOWEST_PRECEDENCE)
public class GlobalExceptionHandler {

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
		Map<String, String> details = ex.getBindingResult().getFieldErrors().stream()
				.collect(Collectors.toMap(FieldError::getField,
						fe -> Objects.requireNonNullElse(fe.getDefaultMessage(), "Không hợp lệ"), (a, b) -> a,
						LinkedHashMap::new));
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(ApiErrorResponse.of(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", details));
	}

	@ExceptionHandler(ConstraintViolationException.class)
	public ResponseEntity<ApiErrorResponse> handleConstraint(ConstraintViolationException ex) {
		Map<String, String> details = new LinkedHashMap<>();
		ex.getConstraintViolations().forEach(v -> {
			String path = v.getPropertyPath() != null ? v.getPropertyPath().toString() : "value";
			details.put(path, Objects.requireNonNullElse(v.getMessage(), "Không hợp lệ"));
		});
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(ApiErrorResponse.of(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ", details));
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ApiErrorResponse> handleNotReadable(HttpMessageNotReadableException ex) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(ApiErrorResponse.of(ApiErrorCode.BAD_REQUEST, "Không đọc được nội dung yêu cầu (JSON)"));
	}

	@ExceptionHandler(BusinessException.class)
	public ResponseEntity<ApiErrorResponse> handleBusiness(BusinessException ex) {
		ApiErrorCode code = Objects.requireNonNull(ex.getCode(), "BusinessException.code");
		String message = Objects.requireNonNullElse(ex.getMessage(), "Không thể xử lý yêu cầu");
		return ResponseEntity.status(code.statusCodeValue())
				.body(ApiErrorResponse.of(code, message, ex.getDetails()));
	}

	@ExceptionHandler(NoResourceFoundException.class)
	public ResponseEntity<ApiErrorResponse> handleNoResource(NoResourceFoundException ex) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(ApiErrorResponse.of(ApiErrorCode.NOT_FOUND, "Không tìm thấy tài nguyên yêu cầu"));
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ApiErrorResponse> handleAccessDenied(AccessDeniedException ex) {
		return ResponseEntity.status(HttpStatus.FORBIDDEN)
				.body(ApiErrorResponse.of(ApiErrorCode.FORBIDDEN, "Bạn không có quyền thực hiện thao tác này"));
	}

	@ExceptionHandler(AuthenticationException.class)
	public ResponseEntity<ApiErrorResponse> handleAuth(AuthenticationException ex) {
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
				ApiErrorResponse.of(ApiErrorCode.UNAUTHORIZED, "Phiên đăng nhập hết hạn hoặc token không hợp lệ"));
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<ApiErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex) {
		return ResponseEntity.status(HttpStatus.CONFLICT)
				.body(ApiErrorResponse.of(ApiErrorCode.CONFLICT, "Dữ liệu xung đột với ràng buộc hệ thống"));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiErrorResponse> handleGeneric(Exception ex) {
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiErrorResponse.of(
				ApiErrorCode.INTERNAL_SERVER_ERROR, "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau"));
	}
}
