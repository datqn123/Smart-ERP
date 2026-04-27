package com.example.smart_erp.catalog.response;

import java.util.List;

/** Task047 */
public record SupplierBulkDeleteData(List<Integer> deletedIds, int deletedCount) {
}
