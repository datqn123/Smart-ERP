package com.example.smart_erp.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Đăng nhập Task001 — message lỗi nằm trên constraint; {@link com.example.smart_erp.common.exception.GlobalExceptionHandler}
 * chỉ đóng envelope 400 + {@code details}, không map lại nội dung.
 * <p>
 * Email được {@link String#strip()} trong compact constructor <strong>trước</strong> Bean Validation,
 * khớp spec “server chuẩn hóa”. Mật khẩu không strip (tránh đổi nghĩa); “chỉ khoảng trắng” do {@code @NotBlank}.
 */
public record LoginRequest(
		@NotBlank(message = "Email là bắt buộc") @Email(message = "Email không hợp lệ") String email,
		@NotBlank(message = "Mật khẩu là bắt buộc") @Size(min = 6,
				message = "Mật khẩu phải có ít nhất 6 ký tự") String password) {

	public LoginRequest {
		email = email == null ? null : email.strip();
	}
}
