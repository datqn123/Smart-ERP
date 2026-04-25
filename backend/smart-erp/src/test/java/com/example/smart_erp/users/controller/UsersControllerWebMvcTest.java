package com.example.smart_erp.users.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;
import java.util.Objects;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.common.exception.GlobalExceptionHandler;
import com.example.smart_erp.config.MethodSecurityTestConfiguration;
import com.example.smart_erp.config.PermitAllWebSecurityConfiguration;
import com.example.smart_erp.config.SecurityBeansConfiguration;
import com.example.smart_erp.users.response.NextStaffCodeData;
import com.example.smart_erp.users.response.UserResponseData;
import com.example.smart_erp.users.service.NextStaffCodeService;
import com.example.smart_erp.users.service.UserCreationService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(controllers = UsersController.class)
@Import({ GlobalExceptionHandler.class, SecurityBeansConfiguration.class, PermitAllWebSecurityConfiguration.class,
		MethodSecurityTestConfiguration.class })
class UsersControllerWebMvcTest {

	@Autowired
	private MockMvc mockMvc;

	/** Cùng claim {@code mp} → quyền dùng trong API test (xem {@code MenuPermissionClaims} / Task101_1). */
	private static RequestPostProcessor staffManagerJwtWithSubject(int subject) {
		return Objects.requireNonNull(
				jwt().authorities(new SimpleGrantedAuthority("can_manage_staff")).jwt(j -> j.subject(String.valueOf(subject))));
	}

	@Autowired
	private ObjectMapper objectMapper;

	@MockitoBean
	private UserCreationService userCreationService;

	@MockitoBean
	private NextStaffCodeService nextStaffCodeService;

	@Test
	void nextStaffCode_returns200WhenJwtPresent() throws Exception {
		when(nextStaffCodeService.suggest(7, 3, "MANAGER")).thenReturn(new NextStaffCodeData("NV-MAN-003", "NV-MAN", 3, "MANAGER"));
		mockMvc.perform(get("/api/v1/users/next-staff-code").param("roleId", "3").param("staffFamily", "MANAGER")
				.with(staffManagerJwtWithSubject(7))).andExpect(status().isOk())
				.andExpect(jsonPath("$.success").value(true)).andExpect(jsonPath("$.data.nextCode").value("NV-MAN-003"))
				.andExpect(jsonPath("$.data.prefix").value("NV-MAN")).andExpect(jsonPath("$.data.roleId").value(3));
		verify(nextStaffCodeService).suggest(7, 3, "MANAGER");
	}

	@Test
	void create_returns201WithEnvelopeWhenJwtPresent() throws Exception {
		UserResponseData data = new UserResponseData(10, "NV010", "Nguyễn Văn A", "a@b.com", "0909000000", 2, "Staff",
				"Active", "2026-04-24", null);
		when(userCreationService.createUser(eq(7), any())).thenReturn(data);

		String body = """
				{"username":"staff01","password":"secret1234","fullName":"Nguyễn Văn A","email":"a@b.com","phone":"0909000000","staffCode":"NV010","roleId":2,"status":"Active"}
				""";

		mockMvc.perform(post("/api/v1/users").with(staffManagerJwtWithSubject(7))
				.contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON)).content(Objects.requireNonNull(body)))
				.andExpect(status().isCreated()).andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.message").value("Tạo nhân viên thành công"))
				.andExpect(jsonPath("$.data.id").value(10)).andExpect(jsonPath("$.data.employeeCode").value("NV010"))
				.andExpect(jsonPath("$.data.role").value("Staff")).andExpect(jsonPath("$.data.status").value("Active"));

		verify(userCreationService).createUser(eq(7), any());
	}

	@Test
	void create_returns403WithoutJwtWhenMethodSecurityOn() throws Exception {
		String body = Objects.requireNonNull(objectMapper.writeValueAsString(
				Map.of("username", "staff01", "password", "secret1234", "fullName", "X", "email", "x@y.com", "roleId", 2)));
		mockMvc.perform(post("/api/v1/users").contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON)).content(body))
				.andExpect(status().isForbidden()).andExpect(jsonPath("$.error").value("FORBIDDEN"));
	}

	@Test
	void create_returns400WhenPasswordTooShort() throws Exception {
		String body = """
				{"username":"ab","password":"short","fullName":"X","email":"not-an-email","roleId":0}
				""";
		mockMvc.perform(post("/api/v1/users").with(staffManagerJwtWithSubject(1))
				.contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON)).content(Objects.requireNonNull(body)))
				.andExpect(status().isBadRequest()).andExpect(jsonPath("$.success").value(false))
				.andExpect(jsonPath("$.error").value("BAD_REQUEST")).andExpect(jsonPath("$.details").exists())
				.andExpect(jsonPath("$.details.username").exists()).andExpect(jsonPath("$.details.password").exists())
				.andExpect(jsonPath("$.details.email").exists()).andExpect(jsonPath("$.details.roleId").exists());
	}

	@Test
	void create_returns201WhenStatusAndOptionalFieldsOmitted() throws Exception {
		UserResponseData data = new UserResponseData(11, "staff01", "X", "x@y.com", null, 2, "Staff", "Active", "2026-04-24",
				null);
		when(userCreationService.createUser(eq(1), any())).thenReturn(data);

		String body = """
				{"username":"staff01","password":"secret1234","fullName":"X","email":"x@y.com","roleId":2}
				""";

		mockMvc.perform(post("/api/v1/users").with(staffManagerJwtWithSubject(1))
				.contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON)).content(Objects.requireNonNull(body)))
				.andExpect(status().isCreated());

		verify(userCreationService).createUser(eq(1), any());
	}

	@Test
	void create_returns400WhenStatusInvalid() throws Exception {
		String body = """
				{"username":"staff01","password":"secret1234","fullName":"X","email":"x@y.com","roleId":2,"status":"Unknown"}
				""";
		mockMvc.perform(post("/api/v1/users").with(staffManagerJwtWithSubject(1))
				.contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON)).content(Objects.requireNonNull(body)))
				.andExpect(status().isBadRequest()).andExpect(jsonPath("$.details.status").exists());
	}

	@Test
	void create_returns409WhenServiceThrowsConflict() throws Exception {
		when(userCreationService.createUser(eq(1), any())).thenThrow(new BusinessException(ApiErrorCode.CONFLICT,
				"Dữ liệu đã tồn tại trong hệ thống", Map.of("email", "Email đã được sử dụng")));

		String body = """
				{"username":"staff01","password":"secret1234","fullName":"X","email":"dup@b.com","roleId":2}
				""";

		mockMvc.perform(post("/api/v1/users").with(staffManagerJwtWithSubject(1))
				.contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON)).content(Objects.requireNonNull(body)))
				.andExpect(status().isConflict()).andExpect(jsonPath("$.details.email").exists());
	}

	@Test
	void create_returns403WhenJwtWithoutCanManageStaff() throws Exception {
		String body = """
				{"username":"staff01","password":"secret1234","fullName":"X","email":"a@b.com","roleId":2}
				""";
		mockMvc.perform(post("/api/v1/users").with(Objects.requireNonNull(jwt().jwt(j -> j.subject("7"))))
				.contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON)).content(Objects.requireNonNull(body)))
				.andExpect(status().isForbidden()).andExpect(jsonPath("$.error").value("FORBIDDEN"));
	}
}
