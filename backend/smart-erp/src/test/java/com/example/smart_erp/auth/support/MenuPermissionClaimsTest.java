package com.example.smart_erp.auth.support;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;

import org.junit.jupiter.api.Test;

class MenuPermissionClaimsTest {

	@Test
	void fromRolePermissionsJson_parsesOwnerLikeSeed() {
		String json = "{\"can_view_dashboard\": true, \"can_use_ai\": false, \"can_manage_inventory\": true}";
		Map<String, Boolean> m = MenuPermissionClaims.fromRolePermissionsJson(json);
		assertThat(m.get("can_view_dashboard")).isTrue();
		assertThat(m.get("can_use_ai")).isFalse();
		assertThat(m.get("can_manage_inventory")).isTrue();
		assertThat(m.get("can_approve")).isFalse();
	}

	@Test
	void fromRolePermissionsJson_nullOrBlank_allFalse() {
		assertThat(MenuPermissionClaims.fromRolePermissionsJson(null).get("can_view_finance")).isFalse();
		assertThat(MenuPermissionClaims.fromRolePermissionsJson("").get("can_view_finance")).isFalse();
	}
}
