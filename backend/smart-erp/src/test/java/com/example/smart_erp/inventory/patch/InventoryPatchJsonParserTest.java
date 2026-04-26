package com.example.smart_erp.inventory.patch;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.catchThrowable;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;

class InventoryPatchJsonParserTest {

	private final ObjectMapper mapper = new ObjectMapper();

	@Test
	void parse_minQuantityOnly_ok() throws Exception {
		var p = InventoryPatchJsonParser.parse(mapper.readTree("{\"minQuantity\": 5}"));
		assertThat(p.minQuantity()).contains(5);
		assertThat(p.locationId()).isEmpty();
	}

	@Test
	void parse_emptyObject_throws() throws Exception {
		Throwable thrown = catchThrowable(() -> InventoryPatchJsonParser.parse(mapper.readTree("{}")));
		assertThat(thrown).isInstanceOf(BusinessException.class);
		assertThat(((BusinessException) thrown).getCode()).isEqualTo(ApiErrorCode.BAD_REQUEST);
	}

	@Test
	void parse_quantity_throwsWithDetails() throws Exception {
		Throwable thrown = catchThrowable(() -> InventoryPatchJsonParser.parse(mapper.readTree("{\"quantity\": 1}")));
		assertThat(thrown).isInstanceOf(BusinessException.class);
		assertThat(((BusinessException) thrown).getDetails()).containsKey("quantity");
	}

	@Test
	void parse_unknownField_throws() {
		assertThatThrownBy(() -> InventoryPatchJsonParser.parse(mapper.readTree("{\"foo\": 1}")))
				.isInstanceOf(BusinessException.class);
	}
}
