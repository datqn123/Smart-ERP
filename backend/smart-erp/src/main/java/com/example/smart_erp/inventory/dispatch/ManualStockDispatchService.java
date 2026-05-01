package com.example.smart_erp.inventory.dispatch;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Year;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.inventory.dispatch.response.StockDispatchCreatedData;
import com.example.smart_erp.inventory.dispatch.response.StockDispatchListItemData;
import com.example.smart_erp.inventory.dispatch.response.StockDispatchListPageData;
import com.example.smart_erp.inventory.receipts.lifecycle.StockReceiptAccessPolicy;
import com.example.smart_erp.sales.stock.RetailStockJdbcRepository;

@Service
public class ManualStockDispatchService {

	private final StockDispatchJdbcRepository dispatchRepo;
	private final RetailStockJdbcRepository retailStockRepo;

	public ManualStockDispatchService(StockDispatchJdbcRepository dispatchRepo, RetailStockJdbcRepository retailStockRepo) {
		this.dispatchRepo = dispatchRepo;
		this.retailStockRepo = retailStockRepo;
	}

	@Transactional(readOnly = true)
	public StockDispatchListPageData list(String search, String status, String dateFrom, String dateTo, int page,
			int limit) {
		if (page < 1) {
			page = 1;
		}
		if (limit < 1 || limit > 100) {
			limit = 20;
		}
		String s = search == null ? "" : search;
		long total = dispatchRepo.countDispatches(s, status, dateFrom, dateTo);
		int offset = (page - 1) * limit;
		var items = dispatchRepo.listDispatches(s, status, dateFrom, dateTo, limit, offset);
		return new StockDispatchListPageData(items, page, limit, total);
	}

	@Transactional
	public StockDispatchCreatedData createManual(StockDispatchCreateRequest req, Jwt jwt) {
		int userId = StockReceiptAccessPolicy.parseUserId(jwt);
		if (req.lines() == null || req.lines().isEmpty()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Cần ít nhất một dòng xuất kho.");
		}
		Map<String, String> errors = new LinkedHashMap<>();
		for (int i = 0; i < req.lines().size(); i++) {
			var line = req.lines().get(i);
			if (line.quantity() <= 0) {
				errors.put("lines[" + i + "].quantity", "Số lượng phải > 0");
			}
		}
		if (!errors.isEmpty()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ.", errors);
		}

		String tmpCode = "TMP-" + UUID.randomUUID().toString().replace("-", "");
		LocalDate dispatchDate = req.dispatchDate();
		String notes = req.notes() == null ? "" : req.notes().trim();
		String ref = req.referenceLabel() == null ? "" : req.referenceLabel().trim();
		long dispatchId = dispatchRepo.insertManualDispatchHeader(tmpCode, userId, dispatchDate, "Full", notes, ref);

		for (var line : req.lines()) {
			var locked = dispatchRepo.lockInventoryRowForUpdate(line.inventoryId())
					.orElseThrow(() -> new BusinessException(ApiErrorCode.NOT_FOUND,
							"Không tìm thấy dòng tồn kho id=" + line.inventoryId()));
			if (line.quantity() > locked.quantity()) {
				throw new BusinessException(ApiErrorCode.CONFLICT,
						"Không đủ tồn cho sản phẩm (inventory id=" + line.inventoryId() + "). Còn " + locked.quantity()
								+ ", yêu cầu " + line.quantity() + ".");
			}
			BigDecimal rate = locked.lineConversionRate() == null ? BigDecimal.ONE : locked.lineConversionRate();
			int baseQty = rate.multiply(BigDecimal.valueOf(line.quantity())).setScale(0, RoundingMode.DOWN).intValue();
			if (baseQty <= 0) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST,
						"Số lượng quy đổi đơn vị cơ sở không hợp lệ cho inventory id=" + line.inventoryId());
			}
			dispatchRepo.deductInventoryQuantity(locked.id(), line.quantity());
			String logNote = "MANUAL_DISPATCH invId=" + locked.id();
			retailStockRepo.insertInventoryLogOutbound(locked.productId(), baseQty, locked.baseUnitId(), userId,
					dispatchId, locked.locationId(), logNote);
		}

		String finalCode = buildDispatchCode(dispatchId);
		dispatchRepo.updateDispatchCode(dispatchId, finalCode);
		return new StockDispatchCreatedData(dispatchId, finalCode, dispatchDate, "Full", ref);
	}

	private static String buildDispatchCode(long dispatchId) {
		int year = Year.now(ZoneId.systemDefault()).getValue();
		return "PX-" + year + "-" + String.format("%06d", dispatchId);
	}
}
