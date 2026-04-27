package com.example.smart_erp.sales.response;

import java.math.BigDecimal;

public record PosProductRowData(int productId, String productName, String skuCode, String barcode, int unitId,
		String unitName, BigDecimal unitPrice, long availableQty, String imageUrl) {
}
