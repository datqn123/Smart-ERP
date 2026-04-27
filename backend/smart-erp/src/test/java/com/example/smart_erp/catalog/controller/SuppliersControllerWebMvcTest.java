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

import com.example.smart_erp.catalog.response.SupplierBulkDeleteData;
import com.example.smart_erp.catalog.response.SupplierDeleteData;
import com.example.smart_erp.catalog.response.SupplierDetailData;
import com.example.smart_erp.catalog.response.SupplierListItemData;
import com.example.smart_erp.catalog.response.SupplierListPageData;
import com.example.smart_erp.catalog.service.SupplierService;
import com.example.smart_erp.common.exception.GlobalExceptionHandler;
import com.example.smart_erp.config.MethodSecurityTestConfiguration;
import com.example.smart_erp.config.PermitAllWebSecurityConfiguration;
import com.example.smart_erp.config.SecurityBeansConfiguration;

@WebMvcTest(controllers = SuppliersController.class)
@Import({ GlobalExceptionHandler.class, SecurityBeansConfiguration.class, PermitAllWebSecurityConfiguration.class,
		MethodSecurityTestConfiguration.class })
class SuppliersControllerWebMvcTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private SupplierService supplierService;

	@Test
	void list_returns200() throws Exception {
		var item = new SupplierListItemData(1, "NCC0001", "ABC", "A", "0909", null, null, null, "Active", 0L,
				Instant.parse("2026-01-01T00:00:00Z"), Instant.parse("2026-01-01T00:00:00Z"));
		when(supplierService.list(any(), any(), anyInt(), anyInt(), any())).thenReturn(
				new SupplierListPageData(List.of(item), 1, 20, 1L));

		mockMvc.perform(get("/api/v1/suppliers").param("page", "1").param("limit", "20")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_products"))
						.jwt(j -> j.subject("1").claim("role", "Staff")))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.data.items[0].supplierCode").value("NCC0001"));
	}

	@Test
	void list_returns403WithoutPermission() throws Exception {
		mockMvc.perform(get("/api/v1/suppliers")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_view_dashboard")))
						.jwt(j -> j.subject("1"))))
				.andExpect(status().isForbidden());
	}

	@Test
	void create_returns201() throws Exception {
		var created = new SupplierDetailData(9, "NCC0002", "XYZ", "B", "0911", null, null, null, "Active", 0L, null,
				Instant.parse("2026-04-01T00:00:00Z"), Instant.parse("2026-04-01T00:00:00Z"));
		when(supplierService.create(any())).thenReturn(created);

		String json = """
				{"supplierCode":"NCC0002","name":"XYZ","contactPerson":"B","phone":"0911","email":null,"address":null,"taxCode":null,"status":"Active"}
				""";
		mockMvc.perform(post("/api/v1/suppliers").contentType(APPLICATION_JSON).content(json)
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_products")))
						.jwt(j -> j.subject("1"))))
				.andExpect(status().isCreated()).andExpect(jsonPath("$.data.id").value(9));
		verify(supplierService).create(any());
	}

	@Test
	void getById_returns200() throws Exception {
		var d = new SupplierDetailData(3, "NCC0001", "ABC", "A", "0909", "a@x.com", "HN", "TAX", "Active", 2L,
				Instant.parse("2026-03-15T14:30:00Z"), Instant.parse("2026-01-05T08:00:00Z"),
				Instant.parse("2026-04-01T10:00:00Z"));
		when(supplierService.getById(3)).thenReturn(d);

		mockMvc.perform(get("/api/v1/suppliers/3")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_products")))
						.jwt(j -> j.subject("1"))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.data.receiptCount").value(2));
	}

	@Test
	void patch_returns200() throws Exception {
		var d = new SupplierDetailData(3, "NCC0001", "ABC (mới)", "A", "0909999888", "a@x.com", "HN", "TAX",
				"Inactive", 2L, Instant.parse("2026-03-15T14:30:00Z"),
				Instant.parse("2026-01-05T08:00:00Z"), Instant.parse("2026-04-01T10:00:00Z"));
		when(supplierService.patch(eq(3), any())).thenReturn(d);

		mockMvc.perform(patch("/api/v1/suppliers/3").contentType(APPLICATION_JSON).content("{\"name\":\"x\"}")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_products")))
						.jwt(j -> j.subject("1"))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.data.name").value("ABC (mới)"));
	}

	@Test
	void delete_returns200ForOwner() throws Exception {
		when(supplierService.delete(eq(3), any())).thenReturn(new SupplierDeleteData(3, true));

		mockMvc.perform(delete("/api/v1/suppliers/3")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_products")))
						.jwt(j -> j.subject("1").claim("role", "Owner"))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.data.deleted").value(true));
	}

	@Test
	void bulkDelete_returns200() throws Exception {
		when(supplierService.bulkDelete(any(), any())).thenReturn(new SupplierBulkDeleteData(List.of(1, 2), 2));

		mockMvc.perform(post("/api/v1/suppliers/bulk-delete").contentType(APPLICATION_JSON)
				.content("{\"ids\":[1,2]}")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_products")))
						.jwt(j -> j.subject("1").claim("role", "Owner"))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.data.deletedCount").value(2));
	}
}
