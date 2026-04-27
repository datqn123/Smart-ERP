package com.example.smart_erp.catalog.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
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

import com.example.smart_erp.catalog.response.CategoryDeleteData;
import com.example.smart_erp.catalog.response.CategoryDetailData;
import com.example.smart_erp.catalog.response.CategoryListPageData;
import com.example.smart_erp.catalog.response.CategoryNodeResponse;
import com.example.smart_erp.catalog.service.CategoryService;
import com.example.smart_erp.common.exception.GlobalExceptionHandler;
import com.example.smart_erp.common.exception.MaxUploadSizeExceededAdvice;
import com.example.smart_erp.config.MethodSecurityTestConfiguration;
import com.example.smart_erp.config.PermitAllWebSecurityConfiguration;
import com.example.smart_erp.config.SecurityBeansConfiguration;

@WebMvcTest(controllers = CategoriesController.class)
@Import({ GlobalExceptionHandler.class, MaxUploadSizeExceededAdvice.class, SecurityBeansConfiguration.class,
		PermitAllWebSecurityConfiguration.class, MethodSecurityTestConfiguration.class })
class CategoriesControllerWebMvcTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private CategoryService categoryService;

	@Test
	void list_returns200() throws Exception {
		var node = new CategoryNodeResponse(1L, "CAT001", "Root", null, null, 0, "Active", 0L,
				Instant.parse("2026-01-01T00:00:00Z"), Instant.parse("2026-01-01T00:00:00Z"), List.of());
		when(categoryService.list(any(), any(), any())).thenReturn(new CategoryListPageData(List.of(node)));

		mockMvc.perform(get("/api/v1/categories").param("format", "tree")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_products"))
						.jwt(j -> j.subject("1").claim("role", "Staff")))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.data.items[0].categoryCode").value("CAT001"));
	}

	@Test
	void list_returns403WithoutPermission() throws Exception {
		mockMvc.perform(get("/api/v1/categories")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_view_dashboard")))
						.jwt(j -> j.subject("1"))))
				.andExpect(status().isForbidden());
	}

	@Test
	void create_returns201() throws Exception {
		var created = new CategoryNodeResponse(9L, "NEW", "New", null, null, 0, "Active", 0L,
				Instant.parse("2026-04-01T00:00:00Z"), Instant.parse("2026-04-01T00:00:00Z"), List.of());
		when(categoryService.create(any())).thenReturn(created);

		String json = """
				{"categoryCode":"NEW","name":"New","description":null,"parentId":null,"sortOrder":0,"status":"Active"}
				""";
		mockMvc.perform(post("/api/v1/categories").contentType(APPLICATION_JSON).content(json)
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_products")))
						.jwt(j -> j.subject("1"))))
				.andExpect(status().isCreated()).andExpect(jsonPath("$.data.id").value(9));
		verify(categoryService).create(any());
	}

	@Test
	void getById_returns200() throws Exception {
		var detail = new CategoryDetailData(2L, "C2", "N2", null, 1L, "P", 1, "Active", 3L,
				Instant.parse("2026-01-02T00:00:00Z"), Instant.parse("2026-01-02T00:00:00Z"), List.of());
		when(categoryService.getById(2L)).thenReturn(detail);

		mockMvc.perform(get("/api/v1/categories/2")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_products")))
						.jwt(j -> j.subject("1"))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.data.id").value(2));
	}

	@Test
	void patch_returns200() throws Exception {
		var patched = new CategoryNodeResponse(2L, "C2", "N2b", "d", 1L, 1, "Inactive", 1L,
				Instant.parse("2026-01-02T00:00:00Z"), Instant.parse("2026-04-26T00:00:00Z"), List.of());
		when(categoryService.patch(eq(2L), any())).thenReturn(patched);

		mockMvc.perform(patch("/api/v1/categories/2").contentType(APPLICATION_JSON).content("{\"name\":\"N2b\"}")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_products")))
						.jwt(j -> j.subject("1"))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.data.name").value("N2b"));
	}

	@Test
	void delete_returns200ForOwner() throws Exception {
		when(categoryService.delete(eq(5L), any())).thenReturn(new CategoryDeleteData(5L, true));

		mockMvc.perform(delete("/api/v1/categories/5")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_products")))
						.jwt(j -> j.subject("1").claim("role", "Owner"))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.data.deleted").value(true));
	}
}
