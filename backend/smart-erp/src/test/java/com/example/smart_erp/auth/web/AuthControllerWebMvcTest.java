package com.example.smart_erp.auth.web;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Objects;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.smart_erp.auth.AuthTask001Fixtures;
import com.example.smart_erp.auth.service.AuthService;
import com.example.smart_erp.auth.service.LoginResult;
import com.example.smart_erp.common.exception.GlobalExceptionHandler;
import com.example.smart_erp.config.PermitAllWebSecurityConfiguration;
import com.example.smart_erp.config.SecurityBeansConfiguration;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Task001 login — tài khoản dev để test thủ công: xem {@link AuthTask001Fixtures}.
 */
@WebMvcTest(controllers = AuthController.class)
@Import({ GlobalExceptionHandler.class, SecurityBeansConfiguration.class, PermitAllWebSecurityConfiguration.class })
class AuthControllerWebMvcTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@MockitoBean
	private AuthService authService;

	@Test
	void login_trimsPaddedEmailBeforeAuthService() throws Exception {
		LoginResult.LoginUserDto user = new LoginResult.LoginUserDto(1, "admin", "System Administrator",
				AuthTask001Fixtures.DEV_OWNER_EMAIL, "Owner");
		when(authService.login(eq(AuthTask001Fixtures.DEV_OWNER_EMAIL), eq(AuthTask001Fixtures.DEV_OWNER_PASSWORD)))
				.thenReturn(new LoginResult("access.jwt", "refreshuuid", user));

		String bodyJson = """
				{"email":"  %s  ","password":"%s"}
				""".formatted(AuthTask001Fixtures.DEV_OWNER_EMAIL, AuthTask001Fixtures.DEV_OWNER_PASSWORD);

		mockMvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON_VALUE).content(bodyJson.strip()))
				.andExpect(status().isOk());

		verify(authService).login(AuthTask001Fixtures.DEV_OWNER_EMAIL, AuthTask001Fixtures.DEV_OWNER_PASSWORD);
	}

	@Test
	void login_returnsEnvelope() throws Exception {
		LoginResult.LoginUserDto user = new LoginResult.LoginUserDto(1, "admin", "System Administrator",
				AuthTask001Fixtures.DEV_OWNER_EMAIL, "Owner");
		when(authService.login(eq(AuthTask001Fixtures.DEV_OWNER_EMAIL), eq(AuthTask001Fixtures.DEV_OWNER_PASSWORD)))
				.thenReturn(new LoginResult("access.jwt", "refreshuuid", user));

		String bodyJson = Objects.requireNonNull(objectMapper.writeValueAsString(
				new LoginRequest(AuthTask001Fixtures.DEV_OWNER_EMAIL, AuthTask001Fixtures.DEV_OWNER_PASSWORD)));
		mockMvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON_VALUE).content(bodyJson))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.data.accessToken").value("access.jwt"))
				.andExpect(jsonPath("$.data.refreshToken").value("refreshuuid"))
				.andExpect(jsonPath("$.data.user.role").value("Owner"))
				.andExpect(jsonPath("$.message").value("Đăng nhập thành công"));
	}

	@Test
	void login_validation_returns400WithDetailsWhenPasswordTooShort() throws Exception {
		String bodyJson = Objects.requireNonNull(
				objectMapper.writeValueAsString(new LoginRequest("staff01@example.com", "12345")));
		mockMvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON_VALUE).content(bodyJson))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.success").value(false))
				.andExpect(jsonPath("$.error").value("BAD_REQUEST"))
				.andExpect(jsonPath("$.details.password").value("Mật khẩu phải có ít nhất 6 ký tự"));
	}

	@Test
	void login_validation_returns400WithDetailsWhenFieldsInvalid() throws Exception {
		String bodyJson = Objects.requireNonNull(objectMapper.writeValueAsString(new LoginRequest("", "")));
		mockMvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON_VALUE).content(bodyJson))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.success").value(false))
				.andExpect(jsonPath("$.error").value("BAD_REQUEST"))
				.andExpect(jsonPath("$.details.email").exists())
				.andExpect(jsonPath("$.details.password").exists());
	}
}
