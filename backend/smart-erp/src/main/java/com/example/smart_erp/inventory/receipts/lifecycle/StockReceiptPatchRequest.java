package com.example.smart_erp.inventory.receipts.lifecycle;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.Valid;

/** Partial update — ít nhất một field; {@code details} null = không đổi dòng; rỗng = xóa hết (OQ-3). */
@JsonIgnoreProperties(ignoreUnknown = false)
public record StockReceiptPatchRequest(
		@JsonProperty("supplierId") Integer supplierId,
		@JsonProperty("receiptDate") String receiptDate,
		@JsonProperty("invoiceNumber") String invoiceNumber,
		@JsonProperty("notes") String notes,
		@JsonProperty("details") @Valid List<StockReceiptDetailRequest> details) {
}
