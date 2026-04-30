package com.example.smart_erp.sales.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.sales.repository.VoucherJdbcRepository;
import com.example.smart_erp.sales.repository.VoucherJdbcRepository.VoucherRow;
import com.example.smart_erp.sales.response.VoucherListItemData;
import com.example.smart_erp.sales.response.VoucherListPageData;

@Service
public class VoucherService {

	private final VoucherJdbcRepository voucherJdbcRepository;

	public VoucherService(VoucherJdbcRepository voucherJdbcRepository) {
		this.voucherJdbcRepository = voucherJdbcRepository;
	}

	@Transactional(readOnly = true)
	public VoucherListPageData listRetailApplicable(int page, Integer limitRaw) {
		if (page < 1) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Tham số page không hợp lệ");
		}
		int limit = limitRaw != null ? limitRaw : 5;
		if (limit < 1 || limit > 50) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Tham số limit phải từ 1 đến 50");
		}
		LocalDate today = LocalDate.now();
		long total = voucherJdbcRepository.countRetailApplicable(today);
		int offset = (page - 1) * limit;
		List<VoucherRow> rows = voucherJdbcRepository.findRetailApplicablePage(today, limit, offset);
		List<VoucherListItemData> items = rows.stream().map(VoucherService::toListItem).toList();
		return new VoucherListPageData(items, page, limit, total);
	}

	@Transactional(readOnly = true)
	public VoucherListItemData getById(int id) {
		return voucherJdbcRepository.findVoucherById(id).map(VoucherService::toListItem)
				.orElseThrow(() -> new BusinessException(ApiErrorCode.NOT_FOUND, "Không tìm thấy voucher"));
	}

	private static VoucherListItemData toListItem(VoucherRow r) {
		return new VoucherListItemData(r.id(), r.code(), r.name(), r.discountType(), r.discountValue(), r.validFrom(),
				r.validTo(), r.isActive(), r.usedCount(), r.maxUses(), r.createdAt());
	}
}
