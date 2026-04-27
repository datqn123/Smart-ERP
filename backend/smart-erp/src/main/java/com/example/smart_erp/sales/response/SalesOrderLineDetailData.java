package com.example.smart_erp.sales.response;

import java.math.BigDecimal;

public record SalesOrderLineDetailData(int id, int productId, String productName, String skuCode, int unitId,
		String unitName, int quantity, BigDecimal unitPrice, BigDecimal lineTotal, int dispatchedQty) {
}
