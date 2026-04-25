package com.example.smart_erp.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

/**
 * Cùng {@link com.example.smart_erp.users.controller.UsersController} tải
 * {@code @PreAuthorize} trong {@code @WebMvcTest} (khi
 * {@link JwtMethodSecurityConfiguration} thật không bật do permit-all).
 */
@TestConfiguration
@EnableMethodSecurity
public class MethodSecurityTestConfiguration {
}
