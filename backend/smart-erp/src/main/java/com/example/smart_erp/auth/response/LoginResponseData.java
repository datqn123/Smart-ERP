package com.example.smart_erp.auth.response;

import com.example.smart_erp.auth.service.LoginResult;

public record LoginResponseData(String accessToken, String refreshToken, LoginResult.LoginUserDto user) {
}
