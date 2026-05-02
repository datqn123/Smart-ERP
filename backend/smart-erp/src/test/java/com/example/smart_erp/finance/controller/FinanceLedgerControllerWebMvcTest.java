package com.example.smart_erp.finance.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDate;
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
import com.example.smart_erp.finance.ledger.FinanceLedgerService;
import com.example.smart_erp.finance.ledger.response.FinanceLedgerItemData;
import com.example.smart_erp.finance.ledger.response.FinanceLedgerPageData;

@WebMvcTest(controllers = FinanceLedgerController.class)
@Import({ GlobalExceptionHandler.class, MaxUploadSizeExceededAdvice.class, SecurityBeansConfiguration.class,
		PermitAllWebSecurityConfiguration.class, MethodSecurityTestConfiguration.class })
class FinanceLedgerControllerWebMvcTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private FinanceLedgerService financeLedgerService;

	@Test
	void list_returns200WhenCanViewFinance() throws Exception {
		var item = new FinanceLedgerItemData(1001L, LocalDate.parse("2026-04-20"), "SO-88", "Bán hàng đơn #88",
				"SalesRevenue", "SalesOrder", 88, BigDecimal.valueOf(1_500_000), BigDecimal.ZERO,
				BigDecimal.valueOf(1_500_000), BigDecimal.valueOf(1_500_000));
		var data = new FinanceLedgerPageData(List.of(item), 1, 20, 1L);
		when(financeLedgerService.list(any(), any(), any(), any(), any(), any(), any())).thenReturn(data);

		mockMvc.perform(get("/api/v1/finance-ledger").with(Objects.requireNonNull(
				jwt().jwt(j -> j.subject("1").claim("role", "Admin").claim("mp", Map.of("can_view_finance", true))))))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.success").value(true)).andExpect(jsonPath("$.data.total").value(1))
				.andExpect(jsonPath("$.data.items[0].transactionCode").value("SO-88"));

		verify(financeLedgerService).list(any(), any(), any(), any(), any(), any(), any());
	}

	@Test
	void list_returns403WhenCannotViewFinance() throws Exception {
		mockMvc.perform(get("/api/v1/finance-ledger").with(Objects.requireNonNull(
				jwt().jwt(j -> j.subject("2").claim("role", "Admin").claim("mp", Map.of("can_view_finance", false))))))
				.andExpect(status().isForbidden());
		verify(financeLedgerService, never()).list(any(), any(), any(), any(), any(), any(), any());
	}

	@Test
	void list_returns403WhenOwnerWithFinanceButNotAdmin() throws Exception {
		mockMvc.perform(get("/api/v1/finance-ledger").with(Objects.requireNonNull(
				jwt().jwt(j -> j.subject("3").claim("role", "Owner").claim("mp", Map.of("can_view_finance", true))))))
				.andExpect(status().isForbidden());
		verify(financeLedgerService, never()).list(any(), any(), any(), any(), any(), any(), any());
	}

	@Test
	void list_returns400WhenServiceThrowsBadRequest() throws Exception {
		when(financeLedgerService.list(any(), any(), any(), any(), any(), any(), any()))
				.thenThrow(new BusinessException(ApiErrorCode.BAD_REQUEST, "Ngày bắt đầu không được sau ngày kết thúc."));

		mockMvc.perform(get("/api/v1/finance-ledger").param("dateFrom", "2026-04-10").param("dateTo", "2026-04-01")
				.with(Objects.requireNonNull(
						jwt().jwt(j -> j.subject("1").claim("role", "Admin").claim("mp", Map.of("can_view_finance", true))))))
				.andExpect(status().isBadRequest()).andExpect(jsonPath("$.success").value(false));
	}
}

