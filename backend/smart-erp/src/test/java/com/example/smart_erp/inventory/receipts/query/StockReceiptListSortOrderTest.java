package com.example.smart_erp.inventory.receipts.query;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class StockReceiptListSortOrderTest {

	@Test
	void default_isCreatedAtDesc() {
		StockReceiptListSortOrder o = StockReceiptListSortOrder.parseOrDefault(null);
		assertThat(o.orderByFragment()).isEqualTo("sr.created_at DESC, sr.id DESC");
	}

	@Test
	void createdAtAsc() {
		StockReceiptListSortOrder o = StockReceiptListSortOrder.parseOrDefault("createdAt:asc");
		assertThat(o.orderByFragment()).isEqualTo("sr.created_at ASC, sr.id DESC");
	}

	@Test
	void idDesc() {
		StockReceiptListSortOrder o = StockReceiptListSortOrder.parseOrDefault("id:desc");
		assertThat(o.orderByFragment()).isEqualTo("sr.id DESC, sr.created_at DESC");
	}

	@Test
	void invalidField_throws() {
		assertThatThrownBy(() -> StockReceiptListSortOrder.parseOrDefault("updatedAt:desc"))
				.isInstanceOf(IllegalArgumentException.class);
	}
}
