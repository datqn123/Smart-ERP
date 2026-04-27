package com.example.smart_erp.catalog.response;

import java.time.Instant;

/** Task044 / body 200 sau PATCH — có lastReceiptAt (OQ-4(b)). */
public record SupplierDetailData(int id, String supplierCode, String name, String contactPerson, String phone,
		String email, String address, String taxCode, String status, long receiptCount, Instant lastReceiptAt,
		Instant createdAt, Instant updatedAt) {
}
