package com.example.smart_erp.sales.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.smart_erp.common.exception.GlobalExceptionHandler;
import com.example.smart_erp.common.exception.MaxUploadSizeExceededAdvice;
import com.example.smart_erp.config.MethodSecurityTestConfiguration;
import com.example.smart_erp.config.PermitAllWebSecurityConfiguration;
import com.example.smart_erp.config.SecurityBeansConfiguration;
import com.example.smart_erp.sales.response.VoucherListItemData;
import com.example.smart_erp.sales.response.VoucherListPageData;
import com.example.smart_erp.sales.service.VoucherService;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;

@WebMvcTest(controllers = VouchersController.class)
@Import({ GlobalExceptionHandler.class, MaxUploadSizeExceededAdvice.class, SecurityBeansConfiguration.class,
		PermitAllWebSecurityConfiguration.class, MethodSecurityTestConfiguration.class })
class VouchersControllerWebMvcTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private VoucherService voucherService;

	@Test
	void list_returns200() throws Exception {
		var item = new VoucherListItemData(1, "DISCOUNT10", "Giảm 10%", "Percent", BigDecimal.TEN, null, null, true, 0,
				null, Instant.parse("2026-01-01T00:00:00Z"));
		when(voucherService.listRetailApplicable(1, null)).thenReturn(new VoucherListPageData(List.of(item), 1, 5, 1L));

		mockMvc.perform(get("/api/v1/vouchers").param("page", "1")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_orders"))
						.jwt(j -> j.subject("1")))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.data.items[0].code").value("DISCOUNT10")).andExpect(jsonPath("$.data.limit").value(5));
	}

	@Test
	void getById_returns200() throws Exception {
		var item = new VoucherListItemData(2, "VIP5", "VIP", "Percent", BigDecimal.valueOf(5), LocalDate.of(2026, 1, 1),
				null, true, 1, 100, Instant.parse("2026-02-01T00:00:00Z"));
		when(voucherService.getById(2)).thenReturn(item);

		mockMvc.perform(get("/api/v1/vouchers/2")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_orders"))
						.jwt(j -> j.subject("1")))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.data.id").value(2));
	}
}
