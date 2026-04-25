package com.example.smart_erp.users.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Body {@code POST /api/v1/users} — khớp Zod {@code UserCreateBodySchema} (Task078) + SRS Task078_01.
 * Trim username/email/fullName/phone/staffCode; mật khẩu không trim; {@code status} rỗng → {@code null} (mặc định Active ở tầng service).
 */
public record UserCreateRequest(
		@NotBlank(message = "Tên đăng nhập không được để trống")
		@Size(min = 3, max = 100, message = "Tên đăng nhập phải từ 3 đến 100 ký tự")
		String username,
		@NotBlank(message = "Mật khẩu không được để trống")
		@Size(min = 8, max = 128, message = "Mật khẩu phải từ 8 đến 128 ký tự")
		String password,
		@NotBlank(message = "Họ tên không được để trống")
		@Size(min = 1, max = 255, message = "Họ tên phải từ 1 đến 255 ký tự")
		String fullName,
		@NotBlank(message = "Email không được để trống")
		@Email(message = "Email không đúng định dạng")
		String email,
		@Size(max = 20, message = "Số điện thoại tối đa 20 ký tự")
		String phone,
		@Size(max = 50, message = "Mã nhân viên (staffCode) tối đa 50 ký tự")
		String staffCode,
		@NotNull(message = "Vai trò (roleId) là bắt buộc")
		@Positive(message = "Vai trò (roleId) phải là số nguyên dương")
		Integer roleId,
		@Pattern(regexp = "Active|Inactive", message = "Trạng thái chỉ được Active hoặc Inactive")
		String status) {

	public UserCreateRequest {
		username = username == null ? "" : username.strip();
		password = password == null ? "" : password;
		fullName = fullName == null ? "" : fullName.strip();
		email = email == null ? "" : email.strip();
		phone = (phone == null || phone.isBlank()) ? null : phone.strip();
		staffCode = (staffCode == null || staffCode.isBlank()) ? null : staffCode.strip();
		status = (status == null || status.isBlank()) ? null : status.strip();
	}
}
