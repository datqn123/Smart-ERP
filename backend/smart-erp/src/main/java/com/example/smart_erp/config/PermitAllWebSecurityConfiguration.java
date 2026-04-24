package com.example.smart_erp.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Default until login + API hardening are ready: open chain for local velocity.
 */
@Configuration
@ConditionalOnProperty(prefix = "app.security", name = "api-protection", havingValue = "permit-all",
		matchIfMissing = true)
public class PermitAllWebSecurityConfiguration {

	@Bean
	@Order(0)
	public SecurityFilterChain permitAllFilterChain(HttpSecurity http) throws Exception {
		http.cors(Customizer.withDefaults()).csrf(csrf -> csrf.disable())
				.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
		return http.build();
	}
}
