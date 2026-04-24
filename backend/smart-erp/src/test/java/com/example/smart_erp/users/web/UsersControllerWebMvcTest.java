package com.example.smart_erp.users.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.common.exception.GlobalExceptionHandler;
import com.example.smart_erp.config.PermitAllWebSecurityConfiguration;
import com.example.smart_erp.config.SecurityBeansConfiguration;
import com.example.smart_erp.users.dto.UserResponseData;
import com.example.smart_erp.users.service.UserCreationService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(controllers = UsersController.class)
@Import({ GlobalExceptionHandler.class, SecurityBeansConfiguration.class, PermitAllWebSecurityConfiguration.class })
class UsersControllerWebMvcTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@MockitoBean
	private UserCreationService userCreationService;

	@Test
	void create_returns201WithEnvelopeWhenJwtPresent() throws Exception {
		UserResponseData data = new UserResponseData(10, "NV010", "Nguyễn Văn A", "a@b.com", "0909000000", 2, "Staff",
				"Active", "2026-04-24", null);
		when(userCreationService.createUser(eq(7), any())).thenReturn(data);

		String body = """
				{"username":"staff01","password":"secret1234","fullName":"Nguyễn Văn A","email":"a@b.com","phone":"0909000000","staffCode":"NV010","roleId":2,"status":"Active"}
				""";

		mockMvc.perform(post("/api/v1/users").with(jwt().jwt(j -> j.subject("7"))).contentType(MediaType.APPLICATION_JSON)
				.content(body)).andExpect(status().isCreated()).andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.message").value("Tạo nhân viên thành công"))
				.andExpect(jsonPath("$.data.id").value(10)).andExpect(jsonPath("$.data.employeeCode").value("NV010"))
				.andExpect(jsonPath("$.data.role").value("Staff")).andExpect(jsonPath("$.data.status").value("Active"));

		verify(userCreationService).createUser(eq(7), any());
	}

	@Test
	void create_returns401WithoutJwt() throws Exception {
		String body = objectMapper.writeValueAsString(
				Map.of("username", "staff01", "password", "secret1234", "fullName", "X", "email", "x@y.com", "roleId", 2));
		mockMvc.perform(post("/api/v1/users").contentType(MediaType.APPLICATION_JSON).content(body))
				.andExpect(status().isUnauthorized()).andExpect(jsonPath("$.error").value("UNAUTHORIZED"))
				.andExpect(jsonPath("$.message", containsString("jwt-api")));
	}

	@Test
	void create_returns400WhenPasswordTooShort() throws Exception {
		String body = """
				{"username":"ab","password":"short","fullName":"X","email":"not-an-email","roleId":0}
				""";
		mockMvc.perform(post("/api/v1/users").with(jwt().jwt(j -> j.subject("1"))).contentType(MediaType.APPLICATION_JSON)
				.content(body)).andExpect(status().isBadRequest()).andExpect(jsonPath("$.success").value(false));
	}

	@Test
	void create_returns409WhenServiceThrowsConflict() throws Exception {
		when(userCreationService.createUser(eq(1), any())).thenThrow(new BusinessException(ApiErrorCode.CONFLICT,
				"Dữ liệu đã tồn tại trong hệ thống", Map.of("email", "Email đã được sử dụng")));

		String body = """
				{"username":"staff01","password":"secret1234","fullName":"X","email":"dup@b.com","roleId":2}
				""";

		mockMvc.perform(post("/api/v1/users").with(jwt().jwt(j -> j.subject("1"))).contentType(MediaType.APPLICATION_JSON)
				.content(body)).andExpect(status().isConflict()).andExpect(jsonPath("$.details.email").exists());
	}
}
