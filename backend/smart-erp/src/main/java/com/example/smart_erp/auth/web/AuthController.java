package com.example.smart_erp.auth.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.smart_erp.auth.service.AuthService;
import com.example.smart_erp.auth.service.LoginResult;
import com.example.smart_erp.common.api.ApiSuccessResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/login")
	public ResponseEntity<ApiSuccessResponse<LoginResponseData>> login(@Valid @RequestBody LoginRequest request) {
		LoginResult result = authService.login(request.email(), request.password());
		LoginResponseData data = new LoginResponseData(result.accessToken(), result.refreshToken(), result.user());
		return ResponseEntity.ok(ApiSuccessResponse.of(data, "Đăng nhập thành công"));
	}
}
