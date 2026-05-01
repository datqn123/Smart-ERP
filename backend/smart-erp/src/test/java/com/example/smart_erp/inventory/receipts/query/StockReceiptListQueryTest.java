package com.example.smart_erp.inventory.receipts.query;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class StockReceiptListQueryTest {

	@Test
	void of_carriesMineStaffId() {
		StockReceiptListQuery q = StockReceiptListQuery.of(null, null, null, null, null, null, null, null, 42);
		assertThat(q.mineStaffId()).isEqualTo(42);
	}

	@Test
	void of_nullMineStaffId() {
		StockReceiptListQuery q = StockReceiptListQuery.of(null, null, null, null, null, null, null, null, null);
		assertThat(q.mineStaffId()).isNull();
	}
}
