package com.example.smart_erp.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

/**
 * Task101_1: kích hoạt {@code @PreAuthorize} khi API được bảo vệ JWT. Không
 * tải khi {@code permit-all} để môi trường dev/ test không 403 do thiếu
 * quyền/annotation.
 */
@Configuration
@ConditionalOnProperty(prefix = "app.security", name = "api-protection", havingValue = "jwt-api")
@EnableMethodSecurity
public class JwtMethodSecurityConfiguration {
}
