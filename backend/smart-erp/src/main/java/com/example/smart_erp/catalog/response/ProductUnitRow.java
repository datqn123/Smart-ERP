package com.example.smart_erp.catalog.response;

import java.math.BigDecimal;

/** Task036 unit + current prices */
public record ProductUnitRow(int id, String unitName, BigDecimal conversionRate, boolean isBaseUnit,
		BigDecimal currentCostPrice, BigDecimal currentSalePrice) {
}
