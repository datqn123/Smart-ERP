package com.example.smart_erp.finance.cashfunds;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.finance.cashfunds.request.CashFundCreateRequest;
import com.example.smart_erp.finance.cashfunds.request.CashFundPatchRequest;
import com.example.smart_erp.finance.cashfunds.response.CashFundItemData;
import com.example.smart_erp.finance.cashfunds.response.CashFundListData;

@Service
@SuppressWarnings("null")
public class CashFundService {

	private final CashFundJdbcRepository repo;

	public CashFundService(CashFundJdbcRepository repo) {
		this.repo = repo;
	}

	public CashFundListData listActive() {
		return new CashFundListData(repo.findAllActiveOrdered());
	}

	@Transactional
	public CashFundItemData create(CashFundCreateRequest req) {
		String code = req.code().trim().toUpperCase();
		if (!StringUtils.hasText(code)) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: code");
		}
		if (repo.existsByCodeIgnoreCase(code)) {
			throw new BusinessException(ApiErrorCode.CONFLICT, "Mã quỹ đã tồn tại.");
		}
		boolean isDef = Boolean.TRUE.equals(req.isDefault());
		if (isDef) {
			repo.clearDefaultFlag();
		}
		int id = repo.insertReturningId(code, req.name().trim(), isDef, true);
		return repo.findById(id).orElseThrow(() -> new IllegalStateException("Không load được quỹ vừa tạo"));
	}

	@Transactional
	public CashFundItemData patch(int id, CashFundPatchRequest req) {
		repo.findById(id).orElseThrow(() -> new BusinessException(ApiErrorCode.NOT_FOUND, "Không tìm thấy quỹ"));
		if (req.isActive() == null && req.isDefault() == null) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Thông tin không hợp lệ: cần ít nhất một trường cập nhật");
		}
		if (Boolean.TRUE.equals(req.isDefault())) {
			repo.clearDefaultFlag();
		}
		repo.updateFlags(id, req.isActive(), req.isDefault());
		return repo.findById(id).orElseThrow();
	}
}
