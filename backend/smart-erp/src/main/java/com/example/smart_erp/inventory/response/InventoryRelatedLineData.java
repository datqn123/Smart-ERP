package com.example.smart_erp.inventory.response;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

/** Một dòng lô liên quan (Task006 — chỉ {@code quantity > 0}). */
public record InventoryRelatedLineData(
		@JsonProperty("id") long id,
		@JsonProperty("batchNumber") String batchNumber,
		@JsonProperty("quantity") int quantity,
		@JsonProperty("expiryDate") LocalDate expiryDate,
		@JsonProperty("warehouseCode") String warehouseCode,
		@JsonProperty("shelfCode") String shelfCode) {
}
