package com.example.smart_erp.inventory.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
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
import com.example.smart_erp.config.MethodSecurityTestConfiguration;
import com.example.smart_erp.config.PermitAllWebSecurityConfiguration;
import com.example.smart_erp.config.SecurityBeansConfiguration;
import com.example.smart_erp.inventory.audit.query.AuditSessionListQuery;
import com.example.smart_erp.inventory.audit.response.AuditSessionDetailData;
import com.example.smart_erp.inventory.audit.response.AuditSessionListItemData;
import com.example.smart_erp.inventory.audit.response.AuditSessionListPageData;
import com.example.smart_erp.inventory.audit.service.AuditSessionService;

@WebMvcTest(controllers = AuditSessionsController.class)
@Import({ GlobalExceptionHandler.class, SecurityBeansConfiguration.class, PermitAllWebSecurityConfiguration.class,
		MethodSecurityTestConfiguration.class })
class AuditSessionsControllerWebMvcTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private AuditSessionService auditSessionService;

	@Test
	void list_returns200WithData() throws Exception {
		var item = new AuditSessionListItemData(1L, "KK-2026-0001", "Kỳ 1", java.time.LocalDate.parse("2026-04-01"), "Pending",
				"WH01", null, 1, "NV", null, null, java.time.Instant.parse("2026-04-01T08:00:00Z"),
				java.time.Instant.parse("2026-04-01T09:00:00Z"), 5, 0, 0);
		var data = new AuditSessionListPageData(List.of(item), 1, 20, 1L);
		when(auditSessionService.list(any(AuditSessionListQuery.class))).thenReturn(data);

		mockMvc.perform(get("/api/v1/inventory/audit-sessions").param("status", "Pending")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_inventory"))
						.jwt(j -> j.subject("1")))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.data.items[0].auditCode").value("KK-2026-0001")).andExpect(jsonPath("$.data.total").value(1));
		verify(auditSessionService).list(any(AuditSessionListQuery.class));
	}

	@Test
	void list_returns403WithoutPermission() throws Exception {
		mockMvc.perform(get("/api/v1/inventory/audit-sessions")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_view_dashboard"))).jwt(
						j -> j.subject("1"))))
				.andExpect(status().isForbidden());
	}

	@Test
	void create_returns201() throws Exception {
		var detail = new AuditSessionDetailData(1L, "KK-2026-0001", "Kỳ 1", java.time.LocalDate.parse("2026-04-01"), "Pending", null,
				null, null, 1, "NV", null, null, null, java.time.Instant.parse("2026-04-01T08:00:00Z"),
				java.time.Instant.parse("2026-04-01T09:00:00Z"), null, List.of(), List.of());
		when(auditSessionService.create(any(), any())).thenReturn(detail);

		String json = """
				{"title":"Kỳ 1","auditDate":"2026-04-01","notes":null,"scope":{"mode":"by_category_id","locationIds":null,"categoryId":1,"inventoryIds":null}}
				""";
		mockMvc.perform(post("/api/v1/inventory/audit-sessions").contentType(APPLICATION_JSON).content(json)
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_inventory")))
						.jwt(j -> j.subject("1"))))
				.andExpect(status().isCreated()).andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.data.auditCode").value("KK-2026-0001"));
		verify(auditSessionService).create(any(), any());
	}

	@Test
	void getById_returns200() throws Exception {
		var detail = new AuditSessionDetailData(2L, "KK-2026-0002", "Kỳ 2", java.time.LocalDate.parse("2026-04-02"), "In Progress", "WH01",
				null, "Ghi chú", 1, "NV", null, null, null, java.time.Instant.parse("2026-04-02T08:00:00Z"),
				java.time.Instant.parse("2026-04-02T09:00:00Z"), null, List.of(), List.of());
		when(auditSessionService.getById(eq(2L))).thenReturn(detail);

		mockMvc.perform(get("/api/v1/inventory/audit-sessions/2")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_inventory")))
						.jwt(j -> j.subject("1"))))
				.andExpect(status().isOk()).andExpect(jsonPath("$.data.id").value(2));
	}
}
