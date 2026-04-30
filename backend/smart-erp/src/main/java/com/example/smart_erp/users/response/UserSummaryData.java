package com.example.smart_erp.users.response;

/**
 * Task077 — một dòng danh sách nhân viên.
 */
public record UserSummaryData(
		int id,
		String employeeCode,
		String fullName,
		String email,
		String phone,
		int roleId,
		String role,
		String status,
		String joinedDate,
		String avatar) {
}

