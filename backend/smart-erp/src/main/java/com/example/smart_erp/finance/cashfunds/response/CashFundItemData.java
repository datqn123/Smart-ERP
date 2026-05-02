package com.example.smart_erp.finance.cashfunds.response;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * PRD — một quỹ tiền.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record CashFundItemData(int id, String code, String name, boolean isDefault, boolean isActive) {
}
