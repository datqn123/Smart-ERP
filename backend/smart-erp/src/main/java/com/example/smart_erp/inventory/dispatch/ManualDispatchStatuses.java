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
		if (status == null) {
			return false;
		}
		return WAITING_DISPATCH.equals(status) || DELIVERING.equals(status) || DELIVERED.equals(status);
	}

	public static boolean isEditable(String status) {
		return WAITING_DISPATCH.equals(status) || DELIVERING.equals(status);
	}
}
