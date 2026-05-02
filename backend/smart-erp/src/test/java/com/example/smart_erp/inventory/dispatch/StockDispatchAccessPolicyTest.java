package com.example.smart_erp.inventory.dispatch;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

class StockDispatchAccessPolicyTest {

	private static Jwt jwt(String subject, String role) {
		Instant now = Instant.now();
		var b = Jwt.withTokenValue("t").headers(h -> h.put("alg", "none")).issuedAt(now).expiresAt(now.plusSeconds(3600))
				.subject(subject);
		if (role != null) {
			b.claim("role", role);
		}
		return b.build();
	}

	@Test
	void isAdmin_acceptsAdminCaseInsensitive() {
		assertThat(StockDispatchAccessPolicy.isAdmin(jwt("1", "Admin"))).isTrue();
		assertThat(StockDispatchAccessPolicy.isAdmin(jwt("1", "  admin  "))).isTrue();
	}

	@Test
	void isElevatedDispatchManager_acceptsOwnerAndAdmin() {
		assertThat(StockDispatchAccessPolicy.isElevatedDispatchManager(jwt("1", "Owner"))).isTrue();
		assertThat(StockDispatchAccessPolicy.isElevatedDispatchManager(jwt("1", "Admin"))).isTrue();
		assertThat(StockDispatchAccessPolicy.isElevatedDispatchManager(jwt("1", "Staff"))).isFalse();
		assertThat(StockDispatchAccessPolicy.isElevatedDispatchManager(jwt("1", ""))).isFalse();
	}

	@Test
	void isAdmin_rejectsOwnerAndStaff() {
		assertThat(StockDispatchAccessPolicy.isAdmin(jwt("1", "Owner"))).isFalse();
		assertThat(StockDispatchAccessPolicy.isAdmin(jwt("1", "Staff"))).isFalse();
	}

	@Test
	void isCreatorOrAdmin_acceptsMatchingSubjectOrAdmin() {
		assertThat(StockDispatchAccessPolicy.isCreatorOrAdmin(5, jwt("5", "Staff"))).isTrue();
		assertThat(StockDispatchAccessPolicy.isCreatorOrAdmin(5, jwt("5", "Owner"))).isTrue();
		assertThat(StockDispatchAccessPolicy.isCreatorOrAdmin(5, jwt("6", "Admin"))).isTrue();
		assertThat(StockDispatchAccessPolicy.isCreatorOrAdmin(5, jwt("6", "Owner"))).isFalse();
	}
}
