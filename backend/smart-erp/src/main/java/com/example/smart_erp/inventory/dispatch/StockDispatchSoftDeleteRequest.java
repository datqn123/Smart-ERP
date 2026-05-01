package com.example.smart_erp.inventory.dispatch;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StockDispatchSoftDeleteRequest(@NotBlank @Size(min = 3, max = 2000) String reason) {
}
