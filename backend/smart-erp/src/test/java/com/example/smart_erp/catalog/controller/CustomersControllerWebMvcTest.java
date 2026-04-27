package com.example.smart_erp.catalog.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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

import com.example.smart_erp.catalog.response.CustomerBulkDeleteData;
import com.example.smart_erp.catalog.response.CustomerData;
import com.example.smart_erp.catalog.response.CustomerDeleteData;
import com.example.smart_erp.catalog.response.CustomerListPageData;
import com.example.smart_erp.catalog.service.CustomerService;
import com.example.smart_erp.common.exception.GlobalExceptionHandler;
import com.example.smart_erp.common.exception.MaxUploadSizeExceededAdvice;
import com.example.smart_erp.config.MethodSecurityTestConfiguration;
import com.example.smart_erp.config.PermitAllWebSecurityConfiguration;
import com.example.smart_erp.config.SecurityBeansConfiguration;

@WebMvcTest(controllers = CustomersController.class)
@Import({ GlobalExceptionHandler.class, MaxUploadSizeExceededAdvice.class, SecurityBeansConfiguration.class,
		PermitAllWebSecurityConfiguration.class, MethodSecurityTestConfiguration.class })
class CustomersControllerWebMvcTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private CustomerService customerService;

	@Test
	void list_returns200() throws Exception {
		var item = new CustomerData(1, "KH00001", "A", "0909", null, null, 0, BigDecimal.ZERO, 0L, "Active",
				Instant.parse("2026-01-01T00:00:00Z"), Instant.parse("2026-01-01T00:00:00Z"));
		when(customerService.list(any(), any(), anyInt(), anyInt(), any())).thenReturn(
				new CustomerListPageData(List.of(item), 1, 20, 1L));

		mockMvc.perform(get("/api/v1/customers").param("page", "1").param("limit", "20")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_customers"))
						.jwt(j -> j.subject("1").claim("role", "Staff")))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.data.items[0].customerCode").value("KH00001"));
	}

	@Test
	void list_returns403WithoutPermission() throws Exception {
		mockMvc.perform(get("/api/v1/customers")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_view_dashboard")))
						.jwt(j -> j.subject("1"))))
				.andExpect(status().isForbidden());
	}

	@Test
	void create_returns201() throws Exception {
		var created = new CustomerData(9, "KH00009", "X", "0911", null, null, 0, BigDecimal.ZERO, 0L, "Active",
				Instant.parse("2026-04-01T00:00:00Z"), Instant.parse("2026-04-01T00:00:00Z"));
		when(customerService.create(any())).thenReturn(created);

		String json = """
				{"customerCode":"KH00009","name":"X","phone":"0911","email":null,"address":null,"status":"Active"}
				""";
		mockMvc.perform(post("/api/v1/customers").contentType(APPLICATION_JSON).content(json)
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_customers")))
						.jwt(j -> j.subject("1"))))
				.andExpect(status().isCreated()).andExpect(jsonPath("$.data.id").value(9));
		verify(customerService).create(any());
	}

	@Test
	void getById_returns200() throws Exception {
		var d = new CustomerData(3, "KH00003", "B", "0909", "a@x.com", "HN", 10, new BigDecimal("100.00"), 2L,
				"Active", Instant.parse("2026-01-05T08:00:00Z"), Instant.parse("2026-04-01T10:00:00Z"));
		when(customerService.getById(3)).thenReturn(d);

		mockMvc.perform(get("/api/v1/customers/3")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_customers")))
						.jwt(j -> j.subject("1"))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.data.orderCount").value(2));
	}

	@Test
	void patch_returns200() throws Exception {
		var d = new CustomerData(3, "KH00003", "B (mới)", "0909999888", "a@x.com", "HN", 10, new BigDecimal("100.00"),
				2L, "Inactive", Instant.parse("2026-01-05T08:00:00Z"), Instant.parse("2026-04-01T10:00:00Z"));
		when(customerService.patch(eq(3), any(), any())).thenReturn(d);

		mockMvc.perform(patch("/api/v1/customers/3").contentType(APPLICATION_JSON).content("{\"name\":\"x\"}")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_customers")))
						.jwt(j -> j.subject("1"))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.data.name").value("B (mới)"));
	}

	@Test
	void delete_returns200ForOwner() throws Exception {
		when(customerService.delete(eq(3), any())).thenReturn(new CustomerDeleteData(3, true));

		mockMvc.perform(delete("/api/v1/customers/3")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_customers")))
						.jwt(j -> j.subject("1").claim("role", "Owner"))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.data.deleted").value(true));
	}

	@Test
	void bulkDelete_returns200() throws Exception {
		when(customerService.bulkDelete(any(), any())).thenReturn(new CustomerBulkDeleteData(List.of(1, 2), 2));

		mockMvc.perform(post("/api/v1/customers/bulk-delete").contentType(APPLICATION_JSON)
				.content("{\"ids\":[1,2]}")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_customers")))
						.jwt(j -> j.subject("1").claim("role", "Owner"))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.data.deletedCount").value(2));
	}
}
