package com.example.smart_erp.users.service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.smart_erp.auth.entity.User;
import com.example.smart_erp.auth.repository.RoleRepository;
import com.example.smart_erp.auth.repository.UserRepository;
import com.example.smart_erp.auth.support.RolePermissionReader;
import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.users.dto.StaffFamily;
import com.example.smart_erp.users.response.NextStaffCodeData;

@Service
public class NextStaffCodeService {

	private static final int PAD_LEN = 3;

	private static final int MAX_STAFF_CODE_LEN = 50;

	private final UserRepository userRepository;

	private final RoleRepository roleRepository;

	private final RolePermissionReader rolePermissionReader;

	public NextStaffCodeService(UserRepository userRepository, RoleRepository roleRepository,
			RolePermissionReader rolePermissionReader) {
		this.userRepository = userRepository;
		this.roleRepository = roleRepository;
		this.rolePermissionReader = rolePermissionReader;
	}

	@Transactional(readOnly = true)
	public NextStaffCodeData suggest(int actorUserId, int roleId, String staffFamilyRaw) {
		User actor = userRepository.findWithRoleById(actorUserId)
				.orElseThrow(() -> new BusinessException(ApiErrorCode.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ"));
		if (!"Active".equals(actor.getStatus())) {
			throw new BusinessException(ApiErrorCode.FORBIDDEN, "Tài khoản của bạn không thể thực hiện thao tác này");
		}
		if (!rolePermissionReader.canManageStaff(actor.getRole())) {
			throw new BusinessException(ApiErrorCode.FORBIDDEN, "Bạn không có quyền quản lý nhân viên");
		}
		if (roleId <= 0 || !roleRepository.existsById(roleId)) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Vai trò (roleId) không hợp lệ",
					Map.of("roleId", "Không tồn tại hoặc không hợp lệ"));
		}

		Optional<StaffFamily> familyOpt = StaffFamily.parseOptional(staffFamilyRaw);
		if (staffFamilyRaw != null && !staffFamilyRaw.isBlank() && familyOpt.isEmpty()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Tham số staffFamily không hợp lệ",
					Map.of("staffFamily", "Chỉ chấp nhận ADMIN, MANAGER, WAREHOUSE, STAFF"));
		}
		StaffFamily family = familyOpt.orElseGet(() -> defaultFamilyForRoleId(roleId));
		validateFamilyMatchesRole(roleId, family);

		String prefix = prefixFor(roleId, family);
		validateSafePrefix(prefix);
		Pattern suffixPattern = Pattern.compile("^" + Pattern.quote(prefix) + "-(\\d+)$");

		List<String> codes = userRepository.findStaffCodesLikePrefix(prefix + "-");
		int maxSuffix = codes.stream().map(suffixPattern::matcher).filter(Matcher::matches).map(m -> Integer.parseInt(m.group(1)))
				.max(Comparator.naturalOrder()).orElse(0);
		int next = maxSuffix + 1;
		String nextCode = prefix + "-" + String.format(Locale.ROOT, "%0" + PAD_LEN + "d", next);
		if (nextCode.length() > MAX_STAFF_CODE_LEN) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Mã nhân viên vượt quá độ dài cho phép (50 ký tự)");
		}
		String familyEcho = familyOpt.map(Enum::name).orElse(null);
		return new NextStaffCodeData(nextCode, prefix, roleId, familyEcho);
	}

	private static StaffFamily defaultFamilyForRoleId(int roleId) {
		return switch (roleId) {
			case 1 -> StaffFamily.ADMIN;
			case 2 -> StaffFamily.STAFF;
			case 3 -> StaffFamily.ADMIN;
			default -> StaffFamily.STAFF;
		};
	}

	private static void validateFamilyMatchesRole(int roleId, StaffFamily family) {
		boolean ok = switch (roleId) {
			case 1 -> family == StaffFamily.ADMIN;
			case 2 -> family == StaffFamily.STAFF || family == StaffFamily.WAREHOUSE;
			case 3 -> family == StaffFamily.ADMIN || family == StaffFamily.MANAGER;
			default -> true;
		};
		if (!ok) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "staffFamily không khớp với roleId",
					Map.of("staffFamily", "Giá trị không tương thích với roleId đã chọn"));
		}
	}

	/**
	 * Map roleId + dòng form → prefix (constants — SRS Task078_02; có thể chuyển DB sau).
	 */
	private static String prefixFor(int roleId, StaffFamily family) {
		if (roleId == 1) {
			return "NV-OWN";
		}
		if (roleId == 2) {
			return family == StaffFamily.WAREHOUSE ? "NV-WH" : "NV-STF";
		}
		if (roleId == 3) {
			return family == StaffFamily.MANAGER ? "NV-MAN" : "NV-ADM";
		}
		return "NV-STF";
	}

	private static void validateSafePrefix(String prefix) {
		if (!prefix.matches("[A-Za-z0-9]+(-[A-Za-z0-9]+)*")) {
			throw new IllegalStateException("prefix cấu hình nội bộ không hợp lệ: " + prefix);
		}
	}
}
