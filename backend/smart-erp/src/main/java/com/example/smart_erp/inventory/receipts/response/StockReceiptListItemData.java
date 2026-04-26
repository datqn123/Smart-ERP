package com.example.smart_erp.inventory.receipts.response;

import java.time.Instant;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Một dòng list phiếu nhập — API Task013 §7.
 */
public record StockReceiptListItemData(
		@JsonProperty("id") long id,
		@JsonProperty("receiptCode") String receiptCode,
		@JsonProperty("supplierId") long supplierId,
		@JsonProperty("supplierName") String supplierName,
		@JsonProperty("staffId") int staffId,
		@JsonProperty("staffName") String staffName,
		@JsonProperty("receiptDate") LocalDate receiptDate,
		@JsonProperty("status") String status,
		@JsonProperty("invoiceNumber") String invoiceNumber,
		@JsonProperty("totalAmount") java.math.BigDecimal totalAmount,
		@JsonProperty("lineCount") int lineCount,
		@JsonProperty("notes") String notes,
		@JsonProperty("approvedBy") Integer approvedBy,
		@JsonProperty("approvedByName") String approvedByName,
		@JsonProperty("approvedAt") Instant approvedAt,
		@JsonProperty("reviewedBy") Integer reviewedBy,
		@JsonProperty("reviewedByName") String reviewedByName,
		@JsonProperty("reviewedAt") Instant reviewedAt,
		@JsonProperty("rejectionReason") String rejectionReason,
		@JsonProperty("createdAt") Instant createdAt,
		@JsonProperty("updatedAt") Instant updatedAt) {
}
