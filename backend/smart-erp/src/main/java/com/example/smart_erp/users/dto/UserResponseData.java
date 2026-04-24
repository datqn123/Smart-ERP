package com.example.smart_erp.users.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Một phần tử nhân viên — đồng bộ Task077 (camelCase).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record UserResponseData(Integer id, String employeeCode, String fullName, String email, String phone,
		Integer roleId, String role, String status, String joinedDate, String avatar) {
}
