package com.example.smart_erp.inventory.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
import com.example.smart_erp.inventory.response.InventoryByIdData;
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

	@Test
	void getById_returns200() throws Exception {
		var item = new InventoryListItemData(10L, 2L, "P2", "S2", null, 1, "W", "A", null, null, 5, 1, 1, "u",
				java.math.BigDecimal.ONE, java.time.Instant.parse("2026-01-01T00:00:00Z"), false, false,
				java.math.BigDecimal.valueOf(5));
		var data = InventoryByIdData.fromItem(item, java.util.List.of());
		when(inventoryListService.getById(10L, false)).thenReturn(data);

		mockMvc.perform(get("/api/v1/inventory/10")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_inventory"))
						.jwt(j -> j.subject("1")))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.data.id").value(10)).andExpect(jsonPath("$.data.relatedLines").isArray())
				.andExpect(jsonPath("$.data.relatedLines.length()").value(0));
		verify(inventoryListService).getById(eq(10L), eq(false));
	}

	@Test
	void getById_withIncludeRelated_callsServiceWithTrue() throws Exception {
		var item = new InventoryListItemData(10L, 2L, "P2", "S2", null, 1, "W", "A", null, null, 5, 1, 1, "u",
				java.math.BigDecimal.ONE, java.time.Instant.parse("2026-01-01T00:00:00Z"), false, false,
				java.math.BigDecimal.valueOf(5));
		var data = InventoryByIdData.fromItem(item, java.util.List.of());
		when(inventoryListService.getById(10L, true)).thenReturn(data);

		mockMvc.perform(get("/api/v1/inventory/10").param("include", "relatedLines")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_inventory"))
						.jwt(j -> j.subject("1")))))
				.andExpect(status().isOk());
		verify(inventoryListService).getById(eq(10L), eq(true));
	}

	@Test
	void getById_returns400WhenIdInvalid() throws Exception {
		mockMvc.perform(get("/api/v1/inventory/0")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_inventory"))
						.jwt(j -> j.subject("1")))))
				.andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").value("BAD_REQUEST"))
				.andExpect(jsonPath("$.details.id").exists());
	}

	@Test
	void getById_returns400WhenIncludeInvalid() throws Exception {
		mockMvc.perform(get("/api/v1/inventory/1").param("include", "wrong")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_inventory"))
						.jwt(j -> j.subject("1")))))
				.andExpect(status().isBadRequest()).andExpect(jsonPath("$.details.include").exists());
	}
}
