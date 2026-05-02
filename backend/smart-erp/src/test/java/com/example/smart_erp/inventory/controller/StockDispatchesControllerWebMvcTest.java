package com.example.smart_erp.inventory.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import com.example.smart_erp.inventory.dispatch.ManualStockDispatchService;
import com.example.smart_erp.inventory.dispatch.OrderLinkedDispatchService;
import com.example.smart_erp.inventory.dispatch.response.StockDispatchDetailData;
import com.example.smart_erp.inventory.dispatch.response.StockDispatchListItemData;
import com.example.smart_erp.inventory.dispatch.response.StockDispatchListPageData;

@WebMvcTest(controllers = StockDispatchesController.class)
@Import({ GlobalExceptionHandler.class, MaxUploadSizeExceededAdvice.class, SecurityBeansConfiguration.class,
		PermitAllWebSecurityConfiguration.class, MethodSecurityTestConfiguration.class })
class StockDispatchesControllerWebMvcTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private ManualStockDispatchService manualStockDispatchService;

	@MockitoBean
	private OrderLinkedDispatchService orderLinkedDispatchService;

	@Test
	void list_returns200() throws Exception {
		var row = new StockDispatchListItemData(1L, "PX-1", "—", "K", LocalDate.of(2026, 1, 15), "U", 1,
				"WaitingDispatch", 42, true, true, false, true, false);
		var data = new StockDispatchListPageData(List.of(row), 1, 20, 1L);
		when(manualStockDispatchService.list(any(), any(), any(), any(), eq(1), eq(20), any())).thenReturn(data);

		mockMvc.perform(get("/api/v1/stock-dispatches").param("page", "1").param("limit", "20")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_inventory"))
						.jwt(j -> j.subject("42").claim("role", "Staff")))))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.data.items[0].dispatchCode").value("PX-1"))
				.andExpect(jsonPath("$.data.items[0].canEdit").value(true));
	}

	@Test
	void patch_returns200() throws Exception {
		var detail = new StockDispatchDetailData(10L, "PX-1", "—", "K", LocalDate.of(2026, 1, 15), 42, "U",
				"Delivering",
				"",
				"REF",
				true,
				true,
				false,
				List.of(),
				true,
				false,
				null,
				null,
				null,
				null);
		when(manualStockDispatchService.patchManual(eq(10L), any(), any())).thenReturn(detail);

		mockMvc.perform(patch("/api/v1/stock-dispatches/10").contentType(APPLICATION_JSON).content("""
				{"status":"Delivering","lines":[{"inventoryId":1,"quantity":2}]}
				""")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_inventory"))
						.jwt(j -> j.subject("42").claim("role", "Staff")))))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.manualDispatch").value(true));

		verify(manualStockDispatchService).patchManual(eq(10L), any(), any());
	}

	@Test
	void getById_returns200() throws Exception {
		var detail = new StockDispatchDetailData(10L, "PX-1", "—", "K", LocalDate.of(2026, 1, 15), 42, "U",
				"WaitingDispatch", "", "", true, true, false, List.of(), true, true, null, null, null, null);
		when(manualStockDispatchService.getDetail(eq(10L), any())).thenReturn(detail);

		mockMvc.perform(get("/api/v1/stock-dispatches/10")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_inventory"))
						.jwt(j -> j.subject("42").claim("role", "Staff")))))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.dispatchCode").value("PX-1"));
		verify(manualStockDispatchService).getDetail(eq(10L), any());
	}
}
