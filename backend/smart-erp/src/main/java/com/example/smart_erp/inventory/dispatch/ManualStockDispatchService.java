package com.example.smart_erp.inventory.dispatch;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Year;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.inventory.dispatch.response.StockDispatchCreatedData;
import com.example.smart_erp.inventory.dispatch.response.StockDispatchDetailData;
import com.example.smart_erp.inventory.dispatch.response.StockDispatchDetailLineData;
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
			int limit, Jwt jwt) {
		if (page < 1) {
			page = 1;
		}
		if (limit < 1 || limit > 100) {
			limit = 20;
		}
		String s = search == null ? "" : search;
		long total = dispatchRepo.countDispatches(s, status, dateFrom, dateTo);
		int offset = (page - 1) * limit;
		var items = dispatchRepo.listDispatches(s, status, dateFrom, dateTo, limit, offset).stream()
				.map(it -> applyListPolicies(jwt, it))
				.toList();
		return new StockDispatchListPageData(items, page, limit, total);
	}

	private static StockDispatchListItemData applyListPolicies(Jwt jwt, StockDispatchListItemData row) {
		int uid = StockReceiptAccessPolicy.parseUserId(jwt);
		boolean manual = row.manualDispatch();
		boolean editableLife = manual && ManualDispatchStatuses.isEditable(row.status());
		boolean canEdit = editableLife && uid == row.createdByUserId();
		boolean canDelete = editableLife
				&& (uid == row.createdByUserId() || StockDispatchAccessPolicy.isAdmin(jwt));
		return new StockDispatchListItemData(row.id(), row.dispatchCode(), row.orderCode(), row.customerName(),
				row.dispatchDate(), row.userName(), row.itemCount(), row.status(), row.createdByUserId(), manual,
				row.shortageWarning(), canEdit, canDelete);
	}

	@Transactional(readOnly = true)
	public StockDispatchDetailData getDetail(long dispatchId, Jwt jwt) {
		var header = dispatchRepo.loadDispatchDetailHeader(dispatchId)
				.orElseThrow(() -> new BusinessException(ApiErrorCode.NOT_FOUND, "Không tìm thấy phiếu xuất."));
		int uid = StockReceiptAccessPolicy.parseUserId(jwt);
		boolean manual = header.orderId() == null;
		boolean editableLife = manual && ManualDispatchStatuses.isEditable(header.status());
		boolean canEdit = editableLife && uid == header.userId();
		boolean canDelete = editableLife
				&& (uid == header.userId() || StockDispatchAccessPolicy.isAdmin(jwt));
		boolean shortage = manual && dispatchRepo.detailHasShortage(dispatchId);
		List<StockDispatchDetailLineData> lines = manual ? dispatchRepo.loadManualDetailLines(dispatchId)
				: List.of();
		String deletedByName = StringUtils.hasText(header.deletedByDisplayName()) ? header.deletedByDisplayName() : null;
		return new StockDispatchDetailData(header.id(), header.dispatchCode(), header.orderCode(),
				header.customerName(), header.dispatchDate(), header.userId(), header.userName(), header.status(),
				header.notes(), header.referenceLabel(), manual, shortage, lines, canEdit, canDelete,
				header.deletedAt(), header.deletedByUserId(), deletedByName, header.deleteReason());
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
		long dispatchId = dispatchRepo.insertManualDispatchHeader(tmpCode, userId, dispatchDate,
				ManualDispatchStatuses.WAITING_DISPATCH, notes, ref);

		for (var line : req.lines()) {
			var lockedInv = dispatchRepo.lockInventoryRowForUpdate(line.inventoryId())
					.orElseThrow(() -> new BusinessException(ApiErrorCode.NOT_FOUND,
							"Không tìm thấy dòng tồn kho id=" + line.inventoryId()));
			if (line.quantity() > lockedInv.quantity()) {
				errors.put("lines", "Thiếu hàng: inventory id=" + line.inventoryId() + " — yêu cầu " + line.quantity()
						+ ", trong kho " + lockedInv.quantity());
				throw new BusinessException(ApiErrorCode.CONFLICT, "Không đủ tồn cho ít nhất một dòng.", errors);
			}
			dispatchRepo.insertDispatchLine(dispatchId, line.inventoryId(), line.quantity());
		}

		String finalCode = buildDispatchCode(dispatchId);
		dispatchRepo.updateDispatchCode(dispatchId, finalCode);
		return new StockDispatchCreatedData(dispatchId, finalCode, dispatchDate,
				ManualDispatchStatuses.WAITING_DISPATCH, ref);
	}

	@Transactional
	public StockDispatchDetailData patchManual(long dispatchId, StockDispatchPatchRequest patch, Jwt jwt) {
		if (patch == null || !patchHasAny(patch)) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Không có thay đổi để cập nhật.");
		}
		var locked = dispatchRepo.lockManualDispatch(dispatchId)
				.orElseThrow(() -> new BusinessException(ApiErrorCode.NOT_FOUND, "Không tìm thấy phiếu xuất."));
		if (locked.deletedAt() != null) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Phiếu đã bị xóa mềm.");
		}
		if (locked.orderId() != null) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Phiếu gắn đơn hàng không sửa qua API này.");
		}
		StockDispatchAccessPolicy.assertManualDispatchCreator(locked.creatorUserId(), jwt);
		if (!ManualDispatchStatuses.isManualLifecycle(locked.status())) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST,
					"Phiếu xuất thủ công cũ không có luồng chờ giao / đang giao.");
		}
		if (ManualDispatchStatuses.DELIVERED.equalsIgnoreCase(locked.status())) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Đã giao — không được sửa phiếu.");
		}

		String curr = locked.status();
		String requested = patch.getStatus();
		String target = !StringUtils.hasText(requested) ? curr : requested.trim();
		if (!isManualForwardAllowed(curr, target)) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST,
					"Chuyển trạng thái không hợp lệ (" + curr + " → " + target + ").");
		}

		if (patch.getDispatchDate() != null) {
			dispatchRepo.updateDispatchDate(dispatchId, patch.getDispatchDate());
		}
		if (patch.getNotes() != null) {
			dispatchRepo.updateDispatchNotes(dispatchId, patch.getNotes().trim());
		}
		if (patch.getReferenceLabel() != null) {
			dispatchRepo.updateDispatchReference(dispatchId, patch.getReferenceLabel().trim());
		}

		if (patch.getLines() != null) {
			if (patch.getLines().isEmpty()) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Danh sách dòng hàng không được rỗng.");
			}
			replaceManualLines(dispatchId, patch.getLines());
		}

		if (ManualDispatchStatuses.DELIVERED.equals(target) && !ManualDispatchStatuses.DELIVERED.equals(curr)) {
			finalizeDelivered(dispatchId, StockReceiptAccessPolicy.parseUserId(jwt));
		}
		else if (!curr.equals(target)) {
			dispatchRepo.updateDispatchStatus(dispatchId, target);
		}

		return getDetail(dispatchId, jwt);
	}

	private static boolean patchHasAny(StockDispatchPatchRequest p) {
		return p.getDispatchDate() != null || p.getNotes() != null || p.getReferenceLabel() != null
				|| StringUtils.hasText(p.getStatus()) || p.getLines() != null;
	}

	private void replaceManualLines(long dispatchId, List<StockDispatchLineRequest> lines) {
		Map<String, String> errors = new LinkedHashMap<>();
		for (int i = 0; i < lines.size(); i++) {
			var line = lines.get(i);
			if (line.quantity() <= 0) {
				errors.put("lines[" + i + "].quantity", "Số lượng phải > 0");
			}
		}
		if (!errors.isEmpty()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dữ liệu không hợp lệ.", errors);
		}

		dispatchRepo.deleteLinesByDispatch(dispatchId);
		for (var line : lines) {
			var lockedInv = dispatchRepo.lockInventoryRowForUpdate(line.inventoryId())
					.orElseThrow(() -> new BusinessException(ApiErrorCode.NOT_FOUND,
							"Không tìm thấy dòng tồn kho id=" + line.inventoryId()));
			if (line.quantity() > lockedInv.quantity()) {
				errors.put("inventoryId", "Thiếu hàng: inventory id=" + line.inventoryId() + " — yêu cầu "
						+ line.quantity() + ", trong kho " + lockedInv.quantity());
				throw new BusinessException(ApiErrorCode.CONFLICT,
						"Không đủ tồn cho ít nhất một dòng (kiểm tra số lượng).", errors);
			}
			dispatchRepo.insertDispatchLine(dispatchId, line.inventoryId(), line.quantity());
		}
	}

	private void finalizeDelivered(long dispatchId, int userId) {
		if (dispatchRepo.countOutboundLogs(dispatchId) > 0) {
			throw new BusinessException(ApiErrorCode.CONFLICT, "Phiếu đã ghi nhận xuất kho trước đó.");
		}
		var lines = new ArrayList<>(dispatchRepo.loadPendingLinesOrdered(dispatchId));
		if (lines.isEmpty()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Phiếu không có dòng hàng để giao.");
		}
		for (var row : lines) {
			var locked = dispatchRepo.lockInventoryRowForUpdate(row.inventoryId())
					.orElseThrow(() -> new BusinessException(ApiErrorCode.NOT_FOUND,
							"Không tìm thấy dòng tồn id=" + row.inventoryId()));
			if (row.quantity() > locked.quantity()) {
				throw new BusinessException(ApiErrorCode.CONFLICT, "Thiếu hàng tại thời điểm xác nhận đã giao: tồn "
						+ locked.quantity() + ", cần " + row.quantity());
			}
			BigDecimal rate = locked.lineConversionRate() == null ? BigDecimal.ONE : locked.lineConversionRate();
			int baseQty = rate.multiply(BigDecimal.valueOf(row.quantity())).setScale(0, RoundingMode.DOWN).intValue();
			if (baseQty <= 0) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST,
						"Số lượng quy đổi đơn vị cơ sở không hợp lệ cho inventory id=" + row.inventoryId());
			}
			dispatchRepo.deductInventoryQuantity(locked.id(), row.quantity());
			String logNote = "MANUAL_DISPATCH_DELIVERED invId=" + locked.id();
			retailStockRepo.insertInventoryLogOutbound(locked.productId(), baseQty, locked.baseUnitId(), userId,
					dispatchId, locked.locationId(), logNote);
		}
		dispatchRepo.updateDispatchStatus(dispatchId, ManualDispatchStatuses.DELIVERED);
	}

	private static boolean isManualForwardAllowed(String curr, String next) {
		if (!StringUtils.hasText(next)) {
			return true;
		}
		if (curr.equals(next)) {
			return true;
		}
		if (ManualDispatchStatuses.DELIVERED.equals(curr)) {
			return false;
		}
		if (ManualDispatchStatuses.WAITING_DISPATCH.equals(curr)) {
			return ManualDispatchStatuses.DELIVERING.equals(next) || ManualDispatchStatuses.DELIVERED.equals(next);
		}
		if (ManualDispatchStatuses.DELIVERING.equals(curr)) {
			return ManualDispatchStatuses.DELIVERED.equals(next);
		}
		return false;
	}

	@Transactional
	public void softDeleteManual(long dispatchId, StockDispatchSoftDeleteRequest body, Jwt jwt) {
		var locked = dispatchRepo.lockManualDispatch(dispatchId)
				.orElseThrow(() -> new BusinessException(ApiErrorCode.NOT_FOUND, "Không tìm thấy phiếu xuất."));
		if (locked.deletedAt() != null) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Phiếu đã bị xóa mềm.");
		}
		if (locked.orderId() != null) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Phiếu gắn đơn hàng không xóa qua API này.");
		}
		StockDispatchAccessPolicy.assertCreatorOrAdminForSoftDelete(locked.creatorUserId(), jwt);
		if (!ManualDispatchStatuses.isManualLifecycle(locked.status())) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Không xóa mềm phiếu loại cũ.");
		}
		if (!ManualDispatchStatuses.isEditable(locked.status())) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Chỉ xóa mềm khi phiếu còn ở trạng thái chờ xuất hoặc đang giao.");
		}
		int uid = StockReceiptAccessPolicy.parseUserId(jwt);
		dispatchRepo.markSoftDeleted(dispatchId, uid, body.reason().trim());
	}

	private static String buildDispatchCode(long dispatchId) {
		int year = Year.now(ZoneId.systemDefault()).getValue();
		return "PX-" + year + "-" + String.format("%06d", dispatchId);
	}
}
