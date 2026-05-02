package com.example.smart_erp.inventory.dispatch;

import java.util.List;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.example.smart_erp.notifications.repository.NotificationJdbcRepository;

/**
 * Thông báo phiếu xuất kho — gom logic gửi để tránh trùng và đồng bộ người nhận (role Admin trong DB).
 */
@Component
public class StockDispatchNotifier {

	private final NotificationJdbcRepository notificationRepo;

	public StockDispatchNotifier(NotificationJdbcRepository notificationRepo) {
		this.notificationRepo = notificationRepo;
	}

	/** Phiếu xuất tay mới (đủ tồn, chờ duyệt) — Admin khác người tạo. */
	public void notifyManualDispatchCreated(int actorUserId, long dispatchId, String dispatchCode, String referenceLabel) {
		String title = "Phiếu xuất kho mới";
		String refSuffix = StringUtils.hasText(referenceLabel) ? " — tham chiếu: " + referenceLabel.trim() : "";
		String message = "Đã tạo phiếu xuất tay " + dispatchCode + refSuffix
				+ " — Admin vui lòng kiểm tra và duyệt khi đủ điều kiện.";
		sendToActiveAdmins(actorUserId, dispatchId, "StockDispatchPendingApproval", title, message);
	}

	/**
	 * Thiếu tồn trên dòng phiếu — chỉ user có role {@code Admin} (đồng bộ {@link NotificationJdbcRepository#findActiveAdminUserIds()}).
	 */
	public void notifyDispatchShortage(int actorUserId, long dispatchId, String dispatchCode, List<String> shortageLines) {
		if (shortageLines == null || shortageLines.isEmpty()) {
			return;
		}
		String title = "Phiếu xuất thiếu tồn";
		String message = dispatchCode + ": " + String.join(" · ", shortageLines);
		sendToActiveAdmins(actorUserId, dispatchId, "StockDispatchShortage", title, message);
	}

	private void sendToActiveAdmins(int actorUserId, long dispatchId, String notificationType, String title,
			String message) {
		int refId = Math.toIntExact(dispatchId);
		for (int recipientId : notificationRepo.findActiveAdminUserIds()) {
			if (recipientId == actorUserId) {
				continue;
			}
			notificationRepo.insertTyped(recipientId, notificationType, title, message, "StockDispatch", refId);
		}
	}
}
