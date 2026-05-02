package com.example.smart_erp.finance.cashfunds.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CashFundCreateRequest(@NotBlank @Size(max = 30) String code, @NotBlank @Size(max = 255) String name,
		Boolean isDefault) {
}
