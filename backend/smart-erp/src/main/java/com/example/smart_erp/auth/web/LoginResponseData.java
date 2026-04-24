package com.example.smart_erp.auth.web;

import com.example.smart_erp.auth.service.LoginResult;

public record LoginResponseData(String accessToken, String refreshToken, LoginResult.LoginUserDto user) {
}
