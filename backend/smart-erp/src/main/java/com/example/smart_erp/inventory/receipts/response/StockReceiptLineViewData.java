package com.example.smart_erp.inventory.receipts.response;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

/** Một dòng chi tiết phiếu nhập — API Task015 §6. */
public record StockReceiptLineViewData(
		@JsonProperty("id") long id,
		@JsonProperty("receiptId") long receiptId,
		@JsonProperty("productId") int productId,
		@JsonProperty("productName") String productName,
		@JsonProperty("skuCode") String skuCode,
		@JsonProperty("unitId") int unitId,
		@JsonProperty("unitName") String unitName,
		@JsonProperty("quantity") int quantity,
		@JsonProperty("costPrice") BigDecimal costPrice,
		@JsonProperty("batchNumber") String batchNumber,
		@JsonProperty("expiryDate") LocalDate expiryDate,
		@JsonProperty("lineTotal") BigDecimal lineTotal) {
}
