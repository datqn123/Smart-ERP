package com.example.smart_erp.sales.response;

import java.time.Instant;

public record SalesOrderCancelData(int id, String status, Instant cancelledAt, Integer cancelledBy) {
}
