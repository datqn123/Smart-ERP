package com.example.smart_erp.sales.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Objects;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.common.exception.GlobalExceptionHandler;
import com.example.smart_erp.common.exception.MaxUploadSizeExceededAdvice;
import com.example.smart_erp.config.MethodSecurityTestConfiguration;
import com.example.smart_erp.config.PermitAllWebSecurityConfiguration;
import com.example.smart_erp.config.SecurityBeansConfiguration;
import com.example.smart_erp.sales.response.RetailVoucherPreviewData;
import com.example.smart_erp.sales.response.SalesOrderCancelData;
import com.example.smart_erp.sales.response.SalesOrderDetailData;
import com.example.smart_erp.sales.response.SalesOrderLineDetailData;
import com.example.smart_erp.sales.response.SalesOrderListItemData;
import com.example.smart_erp.sales.response.SalesOrderListPageData;
import com.example.smart_erp.sales.service.SalesOrderService;

@WebMvcTest(controllers = SalesOrdersController.class)
@Import({ GlobalExceptionHandler.class, MaxUploadSizeExceededAdvice.class, SecurityBeansConfiguration.class,
		PermitAllWebSecurityConfiguration.class, MethodSecurityTestConfiguration.class })
class SalesOrdersControllerWebMvcTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private SalesOrderService salesOrderService;

	@Test
	void list_returns200() throws Exception {
		var item = new SalesOrderListItemData(1, "SO-2026-000001", 2, "ACME", BigDecimal.valueOf(1000),
				BigDecimal.ZERO, BigDecimal.valueOf(1000), "Pending", "Wholesale", "Unpaid", 1, null,
				Instant.parse("2026-01-01T00:00:00Z"), Instant.parse("2026-01-01T00:00:00Z"));
		when(salesOrderService.list(any(), eq("Wholesale"), any(), any(), anyInt(), anyInt(), any(), any()))
				.thenReturn(new SalesOrderListPageData(List.of(item), 1, 20, 1L));

		mockMvc.perform(get("/api/v1/sales-orders").param("orderChannel", "Wholesale").param("page", "1")
				.param("limit", "20")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_orders"))
						.jwt(j -> j.subject("1").claim("role", "Staff")))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.data.items[0].orderCode").value("SO-2026-000001"));
	}

	@Test
	void list_returns403WhenServiceRejectsStaffWithoutChannel() throws Exception {
		when(salesOrderService.list(any(), eq(null), any(), any(), anyInt(), anyInt(), any(), any())).thenThrow(
				new BusinessException(ApiErrorCode.FORBIDDEN, "Chỉ Owner hoặc Admin được xem danh sách đơn không lọc orderChannel"));

		mockMvc.perform(get("/api/v1/sales-orders").param("page", "1").param("limit", "20")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_orders"))
						.jwt(j -> j.subject("1").claim("role", "Staff")))))
				.andExpect(status().isForbidden());
	}

	@Test
	void getById_returns200() throws Exception {
		var line = new SalesOrderLineDetailData(10, 5, "P", "SKU", 12, "Thùng", 1, BigDecimal.TEN, BigDecimal.TEN, 0);
		var d = new SalesOrderDetailData(3, "SO-2026-000003", 2, "ACME", BigDecimal.TEN, BigDecimal.ZERO,
				BigDecimal.TEN, "Delivered", "Retail", "Paid", null, null, null, null, null, null, null, null, null,
				Instant.parse("2026-02-01T00:00:00Z"), Instant.parse("2026-02-01T00:00:00Z"), List.of(line));
		when(salesOrderService.getById(3)).thenReturn(d);

		mockMvc.perform(get("/api/v1/sales-orders/3")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_orders"))
						.jwt(j -> j.subject("1")))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.data.lines[0].productName").value("P"));
	}

	@Test
	void create_returns201() throws Exception {
		var line = new SalesOrderLineDetailData(10, 5, "P", "SKU", 12, "Thùng", 1, BigDecimal.TEN, BigDecimal.TEN, 0);
		var d = new SalesOrderDetailData(9, "SO-2026-000009", 2, "ACME", BigDecimal.TEN, BigDecimal.ZERO,
				BigDecimal.TEN, "Pending", "Wholesale", "Unpaid", null, null, null, null, null, null, null, null, null,
				Instant.parse("2026-03-01T00:00:00Z"), Instant.parse("2026-03-01T00:00:00Z"), List.of(line));
		when(salesOrderService.create(any(), any())).thenReturn(d);

		String json = """
				{"orderChannel":"Wholesale","customerId":2,"lines":[{"productId":5,"unitId":12,"quantity":1,"unitPrice":10}]}
				""";
		mockMvc.perform(post("/api/v1/sales-orders").contentType(APPLICATION_JSON).content(json)
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_orders")))
						.jwt(j -> j.subject("1"))))
				.andExpect(status().isCreated()).andExpect(jsonPath("$.data.id").value(9));
		verify(salesOrderService).create(any(), any());
	}

	@Test
	void retailCheckout_returns201() throws Exception {
		var line = new SalesOrderLineDetailData(11, 5, "P", "SKU", 12, "Thùng", 1, BigDecimal.TEN, BigDecimal.TEN, 0);
		var d = new SalesOrderDetailData(9, "SO-2026-000009", 2, "ACME", BigDecimal.TEN, BigDecimal.ZERO,
				BigDecimal.TEN, "Delivered", "Retail", "Paid", null, null, null, null, null, null, null, null, null,
				Instant.parse("2026-03-01T00:00:00Z"), Instant.parse("2026-03-01T00:00:00Z"), List.of(line));
		when(salesOrderService.retailCheckout(any(), any())).thenReturn(d);

		String json = """
				{"walkIn":true,"lines":[{"productId":5,"unitId":12,"quantity":1,"unitPrice":10}]}
				""";
		mockMvc.perform(post("/api/v1/sales-orders/retail/checkout").contentType(APPLICATION_JSON).content(json)
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_orders")))
						.jwt(j -> j.subject("1"))))
				.andExpect(status().isCreated());
	}

	@Test
	void retailVoucherPreview_returns200() throws Exception {
		var preview = new RetailVoucherPreviewData(true, null, 1, "DISCOUNT10", "Giảm 10%", "Percent", BigDecimal.TEN,
				BigDecimal.valueOf(100), BigDecimal.ZERO, BigDecimal.TEN, BigDecimal.TEN, BigDecimal.valueOf(90));
		when(salesOrderService.retailVoucherPreview(any(), any())).thenReturn(preview);

		String json = """
				{"voucherCode":"DISCOUNT10","lines":[{"productId":5,"unitId":12,"quantity":1,"unitPrice":100}]}
				""";
		mockMvc.perform(post("/api/v1/sales-orders/retail/voucher-preview").contentType(APPLICATION_JSON).content(json)
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_orders")))
						.jwt(j -> j.subject("1"))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.data.applicable").value(true))
				.andExpect(jsonPath("$.data.voucherCode").value("DISCOUNT10"));
	}

	@Test
	void patch_returns200() throws Exception {
		var d = new SalesOrderDetailData(4, "SO-2026-000004", 2, "ACME", BigDecimal.TEN, BigDecimal.ZERO,
				BigDecimal.TEN, "Processing", "Wholesale", "Partial", null, null, null, null, null, null, null, null,
				null, Instant.parse("2026-03-01T00:00:00Z"), Instant.parse("2026-03-01T00:00:00Z"), List.of());
		when(salesOrderService.patch(eq(4), any(), any())).thenReturn(d);

		mockMvc.perform(patch("/api/v1/sales-orders/4").contentType(APPLICATION_JSON).content("{\"status\":\"Processing\"}")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_orders")))
						.jwt(j -> j.subject("1"))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.data.status").value("Processing"));
	}

	@Test
	void cancel_returns200() throws Exception {
		when(salesOrderService.cancel(eq(2), any())).thenReturn(new SalesOrderCancelData(2, "Cancelled",
				Instant.parse("2026-04-01T12:00:00Z"), 1));

		mockMvc.perform(post("/api/v1/sales-orders/2/cancel")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_orders")))
						.jwt(j -> j.subject("1"))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.data.status").value("Cancelled"));
	}

	@Test
	void list_returns403WithoutPermission() throws Exception {
		mockMvc.perform(get("/api/v1/sales-orders").param("orderChannel", "Wholesale")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_view_dashboard")))
						.jwt(j -> j.subject("1"))))
				.andExpect(status().isForbidden());
	}
}
