package com.example.smart_erp.sales.dto;

import jakarta.validation.constraints.Size;

public record SalesOrderCancelBody(@Size(max = 500) String reason) {
}
