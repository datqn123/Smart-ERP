package com.example.smart_erp.inventory.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import com.example.smart_erp.common.exception.MaxUploadSizeExceededAdvice;
import com.example.smart_erp.config.MethodSecurityTestConfiguration;
import com.example.smart_erp.config.PermitAllWebSecurityConfiguration;
import com.example.smart_erp.config.SecurityBeansConfiguration;
import com.example.smart_erp.inventory.receipts.lifecycle.StockReceiptApproveRequest;
import com.example.smart_erp.inventory.receipts.lifecycle.StockReceiptLifecycleService;
import com.example.smart_erp.inventory.receipts.query.StockReceiptListQuery;
import com.example.smart_erp.inventory.receipts.response.StockReceiptListItemData;
import com.example.smart_erp.inventory.receipts.response.StockReceiptListPageData;
import com.example.smart_erp.inventory.receipts.response.StockReceiptViewData;
import com.example.smart_erp.inventory.receipts.service.StockReceiptListService;

@WebMvcTest(controllers = StockReceiptsController.class)
@Import({ GlobalExceptionHandler.class, MaxUploadSizeExceededAdvice.class, SecurityBeansConfiguration.class,
		PermitAllWebSecurityConfiguration.class, MethodSecurityTestConfiguration.class })
class StockReceiptsControllerWebMvcTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private StockReceiptListService stockReceiptListService;

	@MockitoBean
	private StockReceiptLifecycleService stockReceiptLifecycleService;

	@Test
	void list_returns200WithData() throws Exception {
		var item = new StockReceiptListItemData(1L, "PN-1", 2L, "NCC", 3, "NV", java.time.LocalDate.parse("2026-04-20"),
				"Pending", "HD-1", java.math.BigDecimal.TEN, 2, null, null, null, null, null, null, null, null,
				java.time.Instant.parse("2026-04-20T08:00:00Z"), java.time.Instant.parse("2026-04-20T09:00:00Z"));
		var data = new StockReceiptListPageData(List.of(item), 1, 20, 1L);
		when(stockReceiptListService.list(any(StockReceiptListQuery.class))).thenReturn(data);

		mockMvc.perform(get("/api/v1/stock-receipts").param("status", "Pending")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_inventory"))
						.jwt(j -> j.subject("1")))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.data.items[0].receiptCode").value("PN-1"))
				.andExpect(jsonPath("$.data.total").value(1));
		verify(stockReceiptListService).list(any(StockReceiptListQuery.class));
	}

	@Test
	void list_returns403WhenNoPermission() throws Exception {
		mockMvc.perform(get("/api/v1/stock-receipts")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_view_dashboard"))).jwt(
						j -> j.subject("1"))))
				.andExpect(status().isForbidden());
	}

	@Test
	void approve_returns403WithoutCanApprove() throws Exception {
		mockMvc.perform(
				post("/api/v1/stock-receipts/1/approve").contentType(APPLICATION_JSON).content("{\"inboundLocationId\":3}")
						.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_inventory")))
								.jwt(j -> j.subject("1"))))
				.andExpect(status().isForbidden());
	}

	@Test
	void approve_returns200WithCanApprove() throws Exception {
		var view = new StockReceiptViewData(1L, "PN-2026-0001", 1L, "NCC", 1, "NV", java.time.LocalDate.parse("2026-04-20"),
				"Approved", null, java.math.BigDecimal.TEN, null, 2, "Duyệt", java.time.Instant.parse("2026-04-20T10:00:00Z"),
				2, "Duyệt", java.time.Instant.parse("2026-04-20T10:00:00Z"), null, java.time.Instant.parse("2026-04-20T08:00:00Z"),
				java.time.Instant.parse("2026-04-20T11:00:00Z"), List.of());
		when(stockReceiptLifecycleService.approve(eq(1L), any(StockReceiptApproveRequest.class), any(), any()))
				.thenReturn(view);

		mockMvc.perform(
				post("/api/v1/stock-receipts/1/approve").contentType(APPLICATION_JSON).content("{\"inboundLocationId\":3}")
						.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_approve")))
								.jwt(j -> j.subject("2"))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.data.status").value("Approved"));
	}
}
