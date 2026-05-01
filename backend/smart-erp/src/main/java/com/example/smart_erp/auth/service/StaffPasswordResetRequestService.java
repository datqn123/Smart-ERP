package com.example.smart_erp.auth.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.smart_erp.auth.repository.StaffPasswordResetJdbcRepository;
import com.example.smart_erp.auth.repository.StaffPasswordResetJdbcRepository.UserResetLookupRow;
import com.example.smart_erp.auth.repository.SystemLogJdbcRepository;
import com.example.smart_erp.notifications.service.NotificationsService;

/**
 * Task004 §1 — luôn trả message thành công thống nhất; không tiết lộ username có tồn tại.
 */
@Service
public class StaffPasswordResetRequestService {

	public static final String RESPONSE_MESSAGE = "Nếu tài khoản tồn tại, yêu cầu đã được gửi tới Owner. Bạn sẽ nhận email khi Owner xử lý xong.";

	private final StaffPasswordResetJdbcRepository staffPasswordResetJdbcRepository;
	private final SystemLogJdbcRepository systemLogJdbcRepository;
	private final NotificationsService notificationsService;

	public StaffPasswordResetRequestService(StaffPasswordResetJdbcRepository staffPasswordResetJdbcRepository,
			SystemLogJdbcRepository systemLogJdbcRepository, NotificationsService notificationsService) {
		this.staffPasswordResetJdbcRepository = staffPasswordResetJdbcRepository;
		this.systemLogJdbcRepository = systemLogJdbcRepository;
		this.notificationsService = notificationsService;
	}

	@Transactional
	public void submitPublicRequest(String username, String message) {
		String norm = username.strip();
		Optional<UserResetLookupRow> row = staffPasswordResetJdbcRepository.findUserRoleStatusByUsername(norm);
		if (row.isEmpty()) {
			return;
		}
		UserResetLookupRow r = row.get();
		if (!"Staff".equals(r.roleName())) {
			return;
		}
		if (!"Active".equalsIgnoreCase(r.status()) && !"Locked".equalsIgnoreCase(r.status())) {
			return;
		}
		long requestId = staffPasswordResetJdbcRepository.insertPendingReturningId(r.userId(), message);
		systemLogJdbcRepository.insertAuthPasswordResetRequest(r.userId());
		notificationsService.broadcastPasswordResetRequestToOwnerAdmin(requestId, r.username());
	}
}
