package com.example.smart_erp.catalog.response;

import java.util.List;

public record CustomerBulkDeleteData(List<Integer> deletedIds, int deletedCount) {
}
