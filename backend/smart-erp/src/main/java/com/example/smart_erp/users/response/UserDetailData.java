package com.example.smart_erp.users.response;

/**
 * Task079 — chi tiết nhân viên (mở rộng từ Task077).
 */
public record UserDetailData(
		int id,
		String employeeCode,
		String fullName,
		String email,
		String phone,
		int roleId,
		String role,
		String status,
		String joinedDate,
		String avatar,
		String username,
		String lastLogin) {
}

