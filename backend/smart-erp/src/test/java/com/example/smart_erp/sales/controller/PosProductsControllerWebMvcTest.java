package com.example.smart_erp.sales.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.smart_erp.common.exception.GlobalExceptionHandler;
import com.example.smart_erp.common.exception.MaxUploadSizeExceededAdvice;
import com.example.smart_erp.config.MethodSecurityTestConfiguration;
import com.example.smart_erp.config.PermitAllWebSecurityConfiguration;
import com.example.smart_erp.config.SecurityBeansConfiguration;
import com.example.smart_erp.sales.response.PosProductRowData;
import com.example.smart_erp.sales.response.PosProductSearchData;
import com.example.smart_erp.sales.service.SalesOrderService;

@WebMvcTest(controllers = PosProductsController.class)
@Import({ GlobalExceptionHandler.class, MaxUploadSizeExceededAdvice.class, SecurityBeansConfiguration.class,
		PermitAllWebSecurityConfiguration.class, MethodSecurityTestConfiguration.class })
class PosProductsControllerWebMvcTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private SalesOrderService salesOrderService;

	@Test
	void search_returns200() throws Exception {
		var row = new PosProductRowData(1, "Nước", "SP1", "893", 10, "Chai", BigDecimal.valueOf(6000), 100L, null);
		when(salesOrderService.searchPosProducts(any(), any(), any(), anyInt()))
				.thenReturn(new PosProductSearchData(List.of(row)));

		mockMvc.perform(get("/api/v1/pos/products").param("limit", "40")
				.with(Objects.requireNonNull(SecurityMockMvcRequestPostProcessors.jwt()
						.authorities(new SimpleGrantedAuthority("can_manage_orders")).jwt(j -> j.subject("1")))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.data.items[0].productName").value("Nước"));
	}
}
