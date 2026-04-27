package com.example.smart_erp.inventory.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.common.exception.GlobalExceptionHandler;
import com.example.smart_erp.common.exception.MaxUploadSizeExceededAdvice;
import com.example.smart_erp.config.MethodSecurityTestConfiguration;
import com.example.smart_erp.config.PermitAllWebSecurityConfiguration;
import com.example.smart_erp.config.SecurityBeansConfiguration;
import com.example.smart_erp.inventory.approvals.ApprovalsService;
import com.example.smart_erp.inventory.approvals.response.ApprovalsPendingItemData;
import com.example.smart_erp.inventory.approvals.response.ApprovalsPendingPageData;
import com.example.smart_erp.inventory.approvals.response.ApprovalsPendingSummaryData;

@WebMvcTest(controllers = ApprovalsController.class)
@Import({ GlobalExceptionHandler.class, MaxUploadSizeExceededAdvice.class, SecurityBeansConfiguration.class,
		PermitAllWebSecurityConfiguration.class, MethodSecurityTestConfiguration.class })
class ApprovalsControllerWebMvcTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private ApprovalsService approvalsService;

	@Test
	void pending_returns200ForOwner() throws Exception {
		Map<String, Long> byType = new LinkedHashMap<>();
		byType.put("Inbound", 1L);
		byType.put("Outbound", 0L);
		byType.put("Return", 0L);
		byType.put("Debt", 0L);
		var summary = new ApprovalsPendingSummaryData(1L, byType);
		var item = new ApprovalsPendingItemData("stock_receipt", 1L, "PN-1", "Inbound", "NV",
				java.time.Instant.parse("2026-04-20T00:00:00Z"), java.math.BigDecimal.TEN, "Pending", null);
		var data = new ApprovalsPendingPageData(summary, List.of(item), 1, 50, 1L);
		when(approvalsService.listPending(any(), any(), any(), any(), any(), any())).thenReturn(data);

		mockMvc.perform(get("/api/v1/approvals/pending").with(Objects.requireNonNull(jwt().jwt(j -> j.subject("1").claim("role", "Owner")))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.data.total").value(1)).andExpect(jsonPath("$.data.items[0].entityType").value("stock_receipt"));
		verify(approvalsService).listPending(any(), any(), any(), any(), any(), any());
	}

	@Test
	void pending_returns403ForStaff() throws Exception {
		mockMvc.perform(get("/api/v1/approvals/pending").with(Objects.requireNonNull(jwt().jwt(j -> j.subject("2").claim("role", "Staff")))))
				.andExpect(status().isForbidden());
		verify(approvalsService, never()).listPending(any(), any(), any(), any(), any(), any());
	}

	@Test
	void pending_returns400WhenServiceThrowsBadRequest() throws Exception {
		when(approvalsService.listPending(any(), any(), any(), any(), any(), any()))
				.thenThrow(new BusinessException(ApiErrorCode.BAD_REQUEST, "Ngày bắt đầu không được sau ngày kết thúc."));

		mockMvc.perform(
				get("/api/v1/approvals/pending").param("fromDate", "2026-04-10").param("toDate", "2026-04-01").with(Objects.requireNonNull(jwt().jwt(j -> j.subject("1").claim("role", "Admin")))))
				.andExpect(status().isBadRequest()).andExpect(jsonPath("$.success").value(false));
	}
}
