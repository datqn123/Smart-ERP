package com.example.smart_erp.finance.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.common.exception.GlobalExceptionHandler;
import com.example.smart_erp.common.exception.MaxUploadSizeExceededAdvice;
import com.example.smart_erp.config.MethodSecurityTestConfiguration;
import com.example.smart_erp.config.PermitAllWebSecurityConfiguration;
import com.example.smart_erp.config.SecurityBeansConfiguration;
import com.example.smart_erp.finance.debts.PartnerDebtService;
import com.example.smart_erp.finance.debts.response.PartnerDebtItemData;
import com.example.smart_erp.finance.debts.response.PartnerDebtPageData;

@WebMvcTest(controllers = DebtsController.class)
@Import({ GlobalExceptionHandler.class, MaxUploadSizeExceededAdvice.class, SecurityBeansConfiguration.class,
		PermitAllWebSecurityConfiguration.class, MethodSecurityTestConfiguration.class })
class DebtsControllerWebMvcTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private PartnerDebtService partnerDebtService;

	@Test
	void list_returns200WhenCanViewFinance() throws Exception {
		var item = new PartnerDebtItemData(1L, "NO-2026-0001", "Customer", 2L, null, "KH A", BigDecimal.valueOf(1_000_000),
				BigDecimal.ZERO, BigDecimal.valueOf(1_000_000), "2026-05-01", "InDebt", null, Instant.parse("2026-04-01T00:00:00Z"),
				Instant.parse("2026-04-20T00:00:00Z"));
		var data = new PartnerDebtPageData(List.of(item), 1, 20, 1L);
		when(partnerDebtService.list(any(), any(), any(), any(), any(), any(), any())).thenReturn(data);

		mockMvc.perform(get("/api/v1/debts").with(Objects.requireNonNull(
				jwt().jwt(j -> j.subject("1").claim("mp", Map.of("can_view_finance", true)))))).andExpect(status().isOk())
				.andExpect(jsonPath("$.success").value(true)).andExpect(jsonPath("$.data.total").value(1))
				.andExpect(jsonPath("$.data.items[0].debtCode").value("NO-2026-0001"));

		verify(partnerDebtService).list(any(), any(), any(), any(), any(), any(), any());
	}

	@Test
	void list_returns403WhenCannotViewFinance() throws Exception {
		mockMvc.perform(get("/api/v1/debts").with(Objects.requireNonNull(
				jwt().jwt(j -> j.subject("2").claim("mp", Map.of("can_view_finance", false)))))).andExpect(status().isForbidden());
		verify(partnerDebtService, never()).list(any(), any(), any(), any(), any(), any(), any());
	}

	@Test
	void getById_returns404WhenServiceThrows() throws Exception {
		when(partnerDebtService.getById(99L)).thenThrow(new BusinessException(ApiErrorCode.NOT_FOUND, "Không tìm thấy khoản nợ"));

		mockMvc.perform(get("/api/v1/debts/99").with(Objects.requireNonNull(
				jwt().jwt(j -> j.subject("1").claim("mp", Map.of("can_view_finance", true)))))).andExpect(status().isNotFound());
	}

	@Test
	void post_returns201() throws Exception {
		var created = new PartnerDebtItemData(3L, "NO-2026-0002", "Supplier", null, 1L, "NCC B", BigDecimal.valueOf(500_000),
				BigDecimal.ZERO, BigDecimal.valueOf(500_000), null, "InDebt", null, Instant.parse("2026-04-30T09:00:00Z"),
				Instant.parse("2026-04-30T09:00:00Z"));
		when(partnerDebtService.create(any(), any())).thenReturn(created);

		mockMvc.perform(post("/api/v1/debts").contentType(MediaType.APPLICATION_JSON).content("""
				{"partnerType":"Supplier","supplierId":1,"totalAmount":500000}
				""").with(Objects.requireNonNull(jwt().jwt(j -> j.subject("1").claim("mp", Map.of("can_view_finance", true))))))
				.andExpect(status().isCreated()).andExpect(jsonPath("$.data.debtCode").value("NO-2026-0002"));
	}

	@Test
	void patch_returns200() throws Exception {
		var updated = new PartnerDebtItemData(1L, "NO-2026-0001", "Customer", 2L, null, "KH A", BigDecimal.valueOf(1_000_000),
				BigDecimal.valueOf(100_000), BigDecimal.valueOf(900_000), "2026-05-01", "InDebt", "x", Instant.parse("2026-04-01T00:00:00Z"),
				Instant.parse("2026-04-30T10:00:00Z"));
		when(partnerDebtService.patch(eq(1L), any(), any())).thenReturn(updated);

		mockMvc.perform(patch("/api/v1/debts/1").contentType(MediaType.APPLICATION_JSON).content("{\"paymentAmount\":100000}")
				.with(Objects.requireNonNull(jwt().jwt(j -> j.subject("1").claim("mp", Map.of("can_view_finance", true))))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.data.paidAmount").value(100000));
	}
}
