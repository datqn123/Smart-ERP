package com.example.smart_erp.inventory.query;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;

class InventoryListQueryTest {

	@Test
	void of_defaults() {
		InventoryListQuery q = InventoryListQuery.of(null, null, null, null, null, null, null);
		assertThat(q.search()).isNull();
		assertThat(q.stockLevel()).isEqualTo(InventoryStockLevel.ALL);
		assertThat(q.page()).isEqualTo(1);
		assertThat(q.limit()).isEqualTo(20);
		assertThat(q.sort().orderByFragment()).isEqualTo("i.id ASC");
	}

	@Test
	void of_parsesSort() {
		InventoryListQuery q = InventoryListQuery.of(null, null, null, null, null, null, "updatedAt:desc");
		assertThat(q.sort().orderByFragment()).isEqualTo("i.updated_at DESC");
	}

	@Test
	void of_invalidLimit_throwsBadRequest() {
		assertThatThrownBy(() -> InventoryListQuery.of(null, null, null, null, null, "0", null))
				.isInstanceOf(BusinessException.class).satisfies(ex -> {
					BusinessException b = (BusinessException) ex;
					assertThat(b.getCode()).isEqualTo(ApiErrorCode.BAD_REQUEST);
					assertThat(b.getDetails().get("limit")).contains("1 đến 100");
				});
	}
}
