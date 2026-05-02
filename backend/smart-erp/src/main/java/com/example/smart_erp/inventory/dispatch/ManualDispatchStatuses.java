package com.example.smart_erp.inventory.dispatch;

/**
 * Xuất thủ công (order_id NULL): chưa trừ kho cho đến {@link #DELIVERED}.
 */
public final class ManualDispatchStatuses {

	public static final String WAITING_DISPATCH = "WaitingDispatch";
	public static final String DELIVERING = "Delivering";
	public static final String DELIVERED = "Delivered";

	private ManualDispatchStatuses() {
	}

	public static boolean isManualLifecycle(String status) {
		if (status == null || status.isBlank()) {
			return false;
		}
		String s = status.trim();
		return WAITING_DISPATCH.equalsIgnoreCase(s) || DELIVERING.equalsIgnoreCase(s) || DELIVERED.equalsIgnoreCase(s);
	}

	public static boolean isEditable(String status) {
		if (status == null || status.isBlank()) {
			return false;
		}
		String s = status.trim();
		return WAITING_DISPATCH.equalsIgnoreCase(s) || DELIVERING.equalsIgnoreCase(s);
	}
}
