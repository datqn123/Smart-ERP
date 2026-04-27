package com.example.smart_erp.catalog.response;

import java.util.List;

/** Task041 all-or-nothing success */
public record ProductBulkDeleteData(List<Integer> deletedIds, int deletedCount) {
}
