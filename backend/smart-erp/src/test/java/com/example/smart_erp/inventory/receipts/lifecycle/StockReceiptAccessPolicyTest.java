package com.example.smart_erp.inventory.receipts.lifecycle;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;

class StockReceiptAccessPolicyTest {

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
	void assertOwnerOnly_acceptsOwnerCaseInsensitive() {
		assertThatCode(() -> StockReceiptAccessPolicy.assertOwnerOnly(jwt("1", "Owner"))).doesNotThrowAnyException();
		assertThatCode(() -> StockReceiptAccessPolicy.assertOwnerOnly(jwt("1", "  owner  "))).doesNotThrowAnyException();
	}

	@Test
	void assertOwnerOnly_withCustomMessage_usesThatMessage() {
		assertThatThrownBy(() -> StockReceiptAccessPolicy.assertOwnerOnly(jwt("1", "Staff"), "Chỉ Owner được xóa danh mục"))
				.isInstanceOf(BusinessException.class).hasMessageContaining("Chỉ Owner được xóa danh mục");
	}

	@Test
	void assertOwnerOnly_rejectsStaffOrBlank() {
		assertThatThrownBy(() -> StockReceiptAccessPolicy.assertOwnerOnly(jwt("1", "Staff")))
				.isInstanceOf(BusinessException.class).extracting(ex -> ((BusinessException) ex).getCode())
				.isEqualTo(ApiErrorCode.FORBIDDEN);
		assertThatThrownBy(() -> StockReceiptAccessPolicy.assertOwnerOnly(jwt("1", "")))
				.isInstanceOf(BusinessException.class);
		assertThatThrownBy(() -> StockReceiptAccessPolicy.assertOwnerOnly(Jwt.withTokenValue("t").headers(h -> h.put("alg", "none"))
				.issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(3600)).subject("1").build()))
				.isInstanceOf(BusinessException.class);
	}

	@Test
	void assertReceiptCreator_acceptsWhenStaffMatchesSubject() {
		assertThatCode(() -> StockReceiptAccessPolicy.assertReceiptCreator(5, jwt("5", "Staff"))).doesNotThrowAnyException();
	}

	@Test
	void assertReceiptCreator_rejectsWhenStaffDiffers() {
		assertThatThrownBy(() -> StockReceiptAccessPolicy.assertReceiptCreator(9, jwt("5", "Staff")))
				.isInstanceOf(BusinessException.class).extracting(ex -> ((BusinessException) ex).getCode())
				.isEqualTo(ApiErrorCode.FORBIDDEN);
	}

	@Test
	void assertAdminOrOwnerForApproveReject_acceptsAdminAndOwner() {
		assertThatCode(() -> StockReceiptAccessPolicy.assertAdminOrOwnerForApproveReject(jwt("1", "Admin")))
				.doesNotThrowAnyException();
		assertThatCode(() -> StockReceiptAccessPolicy.assertAdminOrOwnerForApproveReject(jwt("1", "  OWNER  ")))
				.doesNotThrowAnyException();
	}

	@Test
	void assertAdminOrOwnerForApproveReject_rejectsStaff() {
		assertThatThrownBy(() -> StockReceiptAccessPolicy.assertAdminOrOwnerForApproveReject(jwt("1", "Staff")))
				.isInstanceOf(BusinessException.class).extracting(ex -> ((BusinessException) ex).getCode())
				.isEqualTo(ApiErrorCode.FORBIDDEN);
	}

	@Test
	void assertStaffAdminOrOwnerForPendingReceiptDelete_acceptsStaffAdminOwner() {
		assertThatCode(() -> StockReceiptAccessPolicy.assertStaffAdminOrOwnerForPendingReceiptDelete(jwt("1", "Staff")))
				.doesNotThrowAnyException();
		assertThatCode(() -> StockReceiptAccessPolicy.assertStaffAdminOrOwnerForPendingReceiptDelete(jwt("1", "Admin")))
				.doesNotThrowAnyException();
		assertThatCode(() -> StockReceiptAccessPolicy.assertStaffAdminOrOwnerForPendingReceiptDelete(jwt("1", "Owner")))
				.doesNotThrowAnyException();
	}

	@Test
	void assertStaffAdminOrOwnerForPendingReceiptDelete_rejectsOtherRole() {
		assertThatThrownBy(() -> StockReceiptAccessPolicy.assertStaffAdminOrOwnerForPendingReceiptDelete(jwt("1", "Guest")))
				.isInstanceOf(BusinessException.class).extracting(ex -> ((BusinessException) ex).getCode())
				.isEqualTo(ApiErrorCode.FORBIDDEN);
	}
}
