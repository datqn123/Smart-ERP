package com.example.smart_erp.settings.alerts.model;

/**
 * Must stay aligned with Flyway CHECK constraint and API docs (Task082–085).
 */
public enum AlertType {
	LowStock,
	ExpiryDate,
	HighValueTransaction,
	PendingApproval,
	OverStock,
	SalesOrderCreated,
	PartnerDebtDueSoon,
	SystemHealth
}

