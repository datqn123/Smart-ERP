package com.example.smart_erp.users.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Task080 — body PATCH partial cho nhân viên.
 */
public record UserPatchRequest(
		@Size(min = 1, max = 255, message = "Họ tên phải từ 1 đến 255 ký tự")
		String fullName,
		@Email(message = "Email không đúng định dạng")
		String email,
		@Size(max = 20, message = "Số điện thoại tối đa 20 ký tự")
		String phone,
		@Size(max = 50, message = "Mã nhân viên (staffCode) tối đa 50 ký tự")
		String staffCode,
		@Positive(message = "Vai trò (roleId) phải là số nguyên dương")
		Integer roleId,
		@Pattern(regexp = "Active|Inactive", message = "Trạng thái chỉ được Active hoặc Inactive")
		String status,
		@Size(min = 8, max = 128, message = "Mật khẩu phải từ 8 đến 128 ký tự")
		String password) {
	public UserPatchRequest {
		fullName = (fullName == null || fullName.isBlank()) ? null : fullName.strip();
		email = (email == null || email.isBlank()) ? null : email.strip();
		phone = (phone == null || phone.isBlank()) ? null : phone.strip();
		staffCode = (staffCode == null || staffCode.isBlank()) ? null : staffCode.strip();
		status = (status == null || status.isBlank()) ? null : status.strip();
	}

	public boolean isEmpty() {
		return fullName == null
				&& email == null
				&& phone == null
				&& staffCode == null
				&& roleId == null
				&& status == null
				&& password == null;
	}
}

