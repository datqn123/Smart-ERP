package com.example.smart_erp.sales.response;

import java.math.BigDecimal;

public record RetailVoucherPreviewData(boolean applicable, String message, Integer voucherId, String voucherCode,
		String voucherName, String discountType, BigDecimal discountValue, BigDecimal subtotal,
		BigDecimal manualDiscountAmount, BigDecimal voucherDiscountAmount, BigDecimal totalDiscountAmount,
		BigDecimal payableAmount) {
}
