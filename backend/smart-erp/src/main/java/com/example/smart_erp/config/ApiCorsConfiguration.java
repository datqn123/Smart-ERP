package com.example.smart_erp.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * CORS for browser SPA (Vite dev default port 3000 — see {@code mini-erp/package.json} {@code vite --port 3000}).
 */
@Configuration
public class ApiCorsConfiguration {

	@Bean
	public CorsConfigurationSource corsConfigurationSource(
			@Value("${app.cors.allowed-origin-patterns:http://localhost:*,http://127.0.0.1:*}") String patternsRaw) {
		CorsConfiguration c = new CorsConfiguration();
		for (String p : patternsRaw.split(",")) {
			String t = p.trim();
			if (!t.isEmpty()) {
				c.addAllowedOriginPattern(t);
			}
		}
		c.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
		c.setAllowedHeaders(List.of("*"));
		c.setAllowCredentials(true);
		c.setMaxAge(3600L);
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/api/**", c);
		return source;
	}
}
