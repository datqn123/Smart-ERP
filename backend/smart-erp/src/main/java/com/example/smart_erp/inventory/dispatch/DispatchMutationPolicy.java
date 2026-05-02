package com.example.smart_erp.inventory.dispatch;

/**
 * Không cho sửa / xóa mềm khi phiếu đã hoàn tất xuất kho.
 */
public final class DispatchMutationPolicy {

	private DispatchMutationPolicy() {
	}

	/**
	 * {@link ManualDispatchStatuses#DELIVERED} — xuất tay đã trừ kho;
	 * {@code Full} — phiếu gắn đơn / POS đã xuất đủ (đã ghi OUTBOUND).
	 */
	public static boolean isCompletedLockedForMutation(String status) {
		if (status == null || status.isBlank()) {
			return false;
		}
		String s = status.trim();
		return ManualDispatchStatuses.DELIVERED.equalsIgnoreCase(s) || "Full".equalsIgnoreCase(s);
	}

	public static boolean allowsMutation(String status) {
		return !isCompletedLockedForMutation(status);
	}
}
