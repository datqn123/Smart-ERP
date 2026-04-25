package com.example.smart_erp.inventory.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import com.example.smart_erp.config.MethodSecurityTestConfiguration;
import com.example.smart_erp.config.PermitAllWebSecurityConfiguration;
import com.example.smart_erp.config.SecurityBeansConfiguration;
import com.example.smart_erp.inventory.query.InventoryListQuery;
import com.example.smart_erp.inventory.response.InventoryListItemData;
import com.example.smart_erp.inventory.response.InventoryListPageData;
import com.example.smart_erp.inventory.response.InventorySummaryData;
import com.example.smart_erp.inventory.service.InventoryListService;

@WebMvcTest(controllers = InventoryController.class)
@Import({ GlobalExceptionHandler.class, SecurityBeansConfiguration.class, PermitAllWebSecurityConfiguration.class,
		MethodSecurityTestConfiguration.class })
class InventoryControllerWebMvcTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private InventoryListService inventoryListService;

	@Test
	void get_returns200WithData() throws Exception {
		InventoryListPageData data = new InventoryListPageData(
				new InventorySummaryData(2, java.math.BigDecimal.valueOf(100), 1, 0),
				List.of(new InventoryListItemData(1, 1, "P", "S", null, 1, "W", "A", null, null, 1, 1, 1, "u",
						java.math.BigDecimal.ONE, java.time.Instant.parse("2026-01-01T00:00:00Z"), false, false,
						java.math.BigDecimal.ONE)),
				1, 20, 2L);
		when(inventoryListService.list(any(InventoryListQuery.class))).thenReturn(data);

		mockMvc.perform(
				get("/api/v1/inventory").param("search", "x")
						.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_inventory"))
								.jwt(j -> j.subject("1")))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.data.summary.totalSkus").value(2))
				.andExpect(jsonPath("$.data.items[0].productName").value("P"));
		verify(inventoryListService).list(any(InventoryListQuery.class));
	}

	@Test
	void get_returns403WhenNoPermission() throws Exception {
		mockMvc.perform(get("/api/v1/inventory")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_view_dashboard"))).jwt(
						j -> j.subject("1"))))
				.andExpect(status().isForbidden());
	}
}
