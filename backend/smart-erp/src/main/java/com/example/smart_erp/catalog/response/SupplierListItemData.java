package com.example.smart_erp.catalog.response;

import java.time.Instant;

/** Task042 — phần tử danh sách (không có lastReceiptAt). */
public record SupplierListItemData(int id, String supplierCode, String name, String contactPerson, String phone,
		String email, String address, String taxCode, String status, long receiptCount, Instant createdAt,
		Instant updatedAt) {
}
