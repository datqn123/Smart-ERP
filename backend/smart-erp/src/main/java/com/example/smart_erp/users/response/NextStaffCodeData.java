package com.example.smart_erp.users.response;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Task078_02 — {@code GET /api/v1/users/next-staff-code}.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record NextStaffCodeData(String nextCode, String prefix, Integer roleId, String staffFamily) {
}
