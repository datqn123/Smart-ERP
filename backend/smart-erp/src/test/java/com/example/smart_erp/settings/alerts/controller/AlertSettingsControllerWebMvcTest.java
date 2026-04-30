package com.example.smart_erp.settings.alerts.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
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
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.smart_erp.common.exception.GlobalExceptionHandler;
import com.example.smart_erp.common.exception.MaxUploadSizeExceededAdvice;
import com.example.smart_erp.config.MethodSecurityTestConfiguration;
import com.example.smart_erp.config.PermitAllWebSecurityConfiguration;
import com.example.smart_erp.config.SecurityBeansConfiguration;
import com.example.smart_erp.settings.alerts.dto.AlertSettingCreateRequest;
import com.example.smart_erp.settings.alerts.model.AlertChannel;
import com.example.smart_erp.settings.alerts.model.AlertFrequency;
import com.example.smart_erp.settings.alerts.model.AlertType;
import com.example.smart_erp.settings.alerts.response.AlertSettingItemData;
import com.example.smart_erp.settings.alerts.response.AlertSettingsListData;
import com.example.smart_erp.settings.alerts.service.AlertSettingsService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(controllers = AlertSettingsController.class)
@Import({ GlobalExceptionHandler.class, MaxUploadSizeExceededAdvice.class, SecurityBeansConfiguration.class,
		PermitAllWebSecurityConfiguration.class, MethodSecurityTestConfiguration.class })
class AlertSettingsControllerWebMvcTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private AlertSettingsService service;

	private final ObjectMapper objectMapper = new ObjectMapper();

	@Test
	void get_asOwner_ignoresOwnerIdParam_andReturnsItems() throws Exception {
		var item = new AlertSettingItemData(10L, "LowStock", BigDecimal.valueOf(10), "App", "Realtime", true,
				List.of("user_2"), Instant.parse("2026-04-20T12:00:00Z"));
		when(service.list(any(Integer.class), eq("LowStock"), eq(true), any(org.springframework.security.oauth2.jwt.Jwt.class)))
				.thenReturn(AlertSettingsListData.of(List.of(item)));

		mockMvc.perform(get("/api/v1/alert-settings").param("ownerId", "999").param("alertType", "LowStock")
				.param("isEnabled", "true")
				.with(Objects.requireNonNull(jwt().jwt(j -> j.subject("1").claim("role", "Owner")))))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.data.items.length()").value(1))
				.andExpect(jsonPath("$.data.items[0].alertType").value("LowStock"));

		verify(service).list(eq(999), eq("LowStock"), eq(true), any(org.springframework.security.oauth2.jwt.Jwt.class));
	}

	@Test
	void get_asAdmin_canPassOwnerId() throws Exception {
		when(service.list(eq(123), eq(null), eq(null), any(org.springframework.security.oauth2.jwt.Jwt.class)))
				.thenReturn(AlertSettingsListData.of(List.of()));

		mockMvc.perform(get("/api/v1/alert-settings").param("ownerId", "123")
				.with(Objects.requireNonNull(jwt().jwt(j -> j.subject("2").claim("role", "Admin")))))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.data.items.length()").value(0));
	}

	@Test
	void post_returns201WithEnvelope() throws Exception {
		var created = new AlertSettingItemData(101L, "HighValueTransaction", BigDecimal.valueOf(50000000), "App",
				"Realtime", true, List.of("user_2"), Instant.parse("2026-04-30T12:00:00Z"));
		when(service.create(any(AlertSettingCreateRequest.class), any(org.springframework.security.oauth2.jwt.Jwt.class)))
				.thenReturn(created);

		var body = new AlertSettingCreateRequest(AlertType.HighValueTransaction, AlertChannel.App, AlertFrequency.Realtime,
				BigDecimal.valueOf(50000000), true, List.of("user_2"));

		mockMvc.perform(post("/api/v1/alert-settings").contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(body))
				.with(Objects.requireNonNull(jwt().jwt(j -> j.subject("1").claim("role", "Owner")))))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.data.id").value(101))
				.andExpect(jsonPath("$.data.alertType").value("HighValueTransaction"));
	}

	@Test
	void patch_returns200() throws Exception {
		var patched = new AlertSettingItemData(10L, "ExpiryDate", BigDecimal.valueOf(15), "App", "Realtime", false,
				List.of(), Instant.parse("2026-04-30T12:05:00Z"));
		when(service.patch(eq(10L), any(com.fasterxml.jackson.databind.JsonNode.class),
				any(org.springframework.security.oauth2.jwt.Jwt.class))).thenReturn(patched);

		mockMvc.perform(patch("/api/v1/alert-settings/10").contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(java.util.Map.of("isEnabled", false, "thresholdValue", 15)))
				.with(Objects.requireNonNull(jwt().jwt(j -> j.subject("1").claim("role", "Owner")))))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.data.isEnabled").value(false))
				.andExpect(jsonPath("$.data.thresholdValue").value(15));
	}

	@Test
	void delete_returns204() throws Exception {
		mockMvc.perform(delete("/api/v1/alert-settings/10")
				.with(Objects.requireNonNull(jwt().jwt(j -> j.subject("1").claim("role", "Owner")))))
				.andExpect(status().isNoContent());
		verify(service).softDisable(eq(10L), any(org.springframework.security.oauth2.jwt.Jwt.class));
	}
}

