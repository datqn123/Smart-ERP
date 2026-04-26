package com.example.smart_erp.inventory.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Payload 200 — PATCH bulk meta tồn (Task008).
 */
public record InventoryBulkPatchData(
		@JsonProperty("updated") List<InventoryListItemData> updated,
		@JsonProperty("failed") List<Object> failed) {

	public static InventoryBulkPatchData of(List<InventoryListItemData> updated) {
		return new InventoryBulkPatchData(updated, List.of());
	}
}
