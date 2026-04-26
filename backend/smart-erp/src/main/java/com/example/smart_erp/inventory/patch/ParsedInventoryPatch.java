package com.example.smart_erp.inventory.patch;

import java.time.LocalDate;
import java.util.Optional;

/**
 * Trường PATCH đã parse — Optional.empty() = không gửi; Optional.of(Optional.empty()) = JSON {@code null}
 * (xóa meta nullable trên DB).
 */
public record ParsedInventoryPatch(
		Optional<Integer> locationId,
		Optional<Integer> minQuantity,
		Optional<Optional<String>> batchNumber,
		Optional<Optional<LocalDate>> expiryDate,
		Optional<Optional<Integer>> unitId) {

	public boolean hasNoUpdates() {
		return locationId.isEmpty() && minQuantity.isEmpty() && batchNumber.isEmpty() && expiryDate.isEmpty()
				&& unitId.isEmpty();
	}
}
