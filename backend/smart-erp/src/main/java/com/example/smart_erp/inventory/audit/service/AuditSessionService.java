package com.example.smart_erp.inventory.audit.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.inventory.audit.AuditApplyVarianceRequest;
import com.example.smart_erp.inventory.audit.AuditLinesPatchRequest;
import com.example.smart_erp.inventory.audit.AuditScopeBody;
import com.example.smart_erp.inventory.audit.AuditSessionCancelRequest;
import com.example.smart_erp.inventory.audit.AuditSessionCompleteRequest;
import com.example.smart_erp.inventory.audit.AuditSessionCreateRequest;
import com.example.smart_erp.inventory.audit.AuditSessionPatchRequest;
import com.example.smart_erp.inventory.audit.query.AuditSessionListQuery;
import com.example.smart_erp.inventory.audit.repository.AuditSessionJdbcRepository;
import com.example.smart_erp.inventory.audit.repository.AuditSessionJdbcRepository.InventorySnapRow;
import com.example.smart_erp.inventory.audit.repository.AuditSessionJdbcRepository.LineApplyRow;
import com.example.smart_erp.inventory.audit.repository.AuditSessionJdbcRepository.SessionLockRow;
import com.example.smart_erp.inventory.audit.response.AuditApplyVarianceData;
import com.example.smart_erp.inventory.audit.response.AuditApplyVarianceLineResult;
import com.example.smart_erp.inventory.audit.response.AuditSessionDetailData;
import com.example.smart_erp.inventory.audit.response.AuditSessionListItemData;
import com.example.smart_erp.inventory.audit.response.AuditSessionListPageData;
import com.example.smart_erp.inventory.receipts.lifecycle.StockReceiptAccessPolicy;

@Service
public class AuditSessionService {

	private static final String ST_PENDING = "Pending";
	private static final String ST_IN_PROGRESS = "In Progress";
	private static final String ST_COMPLETED = "Completed";
	private static final String ST_CANCELLED = "Cancelled";

	private static final int REF_NOTE_MAX = 255;

	private final AuditSessionJdbcRepository repo;

	public AuditSessionService(AuditSessionJdbcRepository repo) {
		this.repo = repo;
	}

	@Transactional(readOnly = true)
	public AuditSessionListPageData list(AuditSessionListQuery q) {
		long total = repo.countList(q);
		List<AuditSessionListItemData> items = total == 0 ? List.of() : repo.loadListPage(q);
		return new AuditSessionListPageData(items, q.page(), q.limit(), total);
	}

	@Transactional(readOnly = true)
	public AuditSessionDetailData getById(long id) {
		return repo.loadDetail(Math.toIntExact(id))
				.orElseThrow(() -> new BusinessException(ApiErrorCode.NOT_FOUND, "Không tìm thấy đợt kiểm kê"));
	}

	@Transactional
	public AuditSessionDetailData create(AuditSessionCreateRequest req, Jwt jwt) {
		int userId = StockReceiptAccessPolicy.parseUserId(jwt);
		LocalDate auditDate = LocalDate.parse(req.auditDate());
		List<InventorySnapRow> snaps = resolveScope(req.scope());
		if (snaps.isEmpty()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Không có tồn khớp phạm vi");
		}
		String locFilter = null;
		String catFilter = null;
		switch (req.scope().mode()) {
			case "by_location_ids" -> {
				var ids = req.scope().locationIds().stream().distinct().toList();
				locFilter = repo.aggregateWarehouseCodes(ids);
			}
			case "by_category_id" -> catFilter = repo.findCategoryName(req.scope().categoryId());
			case "by_inventory_ids" -> {
			}
			default -> throw new BusinessException(ApiErrorCode.BAD_REQUEST, "scope.mode không hợp lệ");
		}
		int year = auditDate.getYear();
		int maxSuffix = repo.nextAuditSequenceSuffix(year);
		int sessionId = insertSessionWithCodeRetry(year, maxSuffix, req.title(), auditDate, locFilter, catFilter, req.notes(), userId);
		for (InventorySnapRow row : snaps) {
			repo.insertLine(sessionId, row.inventoryId(), new BigDecimal(row.quantity()));
		}
		return repo.loadDetail(sessionId)
				.orElseThrow(() -> new BusinessException(ApiErrorCode.INTERNAL_SERVER_ERROR, "Không đọc lại đợt kiểm kê sau khi tạo"));
	}

	private int insertSessionWithCodeRetry(int year, int maxSuffix, String title, LocalDate auditDate, String locFilter,
			String catFilter, String notes, int userId) {
		for (int bump = 1; bump <= 20; bump++) {
			String code = String.format("KK-%d-%04d", year, maxSuffix + bump);
			try {
				return repo.insertSession(code, title, auditDate, ST_PENDING, locFilter, catFilter, notes, userId);
			}
			catch (DuplicateKeyException ignored) {
				// thử mã tiếp theo
			}
		}
		throw new BusinessException(ApiErrorCode.CONFLICT, "Không thể sinh mã đợt kiểm kê duy nhất, vui lòng thử lại");
	}

	private List<InventorySnapRow> resolveScope(AuditScopeBody scope) {
		String mode = scope.mode();
		if (!StringUtils.hasText(mode)) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "scope.mode là bắt buộc");
		}
		return switch (mode) {
			case "by_location_ids" -> {
				if (scope.locationIds() == null || scope.locationIds().isEmpty()) {
					throw new BusinessException(ApiErrorCode.BAD_REQUEST, "scope.locationIds không được rỗng");
				}
				var ids = scope.locationIds().stream().distinct().toList();
				if (repo.countLocationsActive(ids) != ids.size()) {
					throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Một hoặc nhiều vị trí không tồn tại hoặc không Active",
							Map.of("locationIds", "Kiểm tra danh sách vị trí"));
				}
				yield repo.findInventoryByLocationIds(ids);
			}
			case "by_category_id" -> {
				if (scope.categoryId() == null) {
					throw new BusinessException(ApiErrorCode.BAD_REQUEST, "scope.categoryId là bắt buộc");
				}
				if (!repo.categoryExists(scope.categoryId())) {
					throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Danh mục không tồn tại",
							Map.of("categoryId", "Giá trị không hợp lệ"));
				}
				yield repo.findInventoryByCategoryId(scope.categoryId());
			}
			case "by_inventory_ids" -> {
				if (scope.inventoryIds() == null || scope.inventoryIds().isEmpty()) {
					throw new BusinessException(ApiErrorCode.BAD_REQUEST, "scope.inventoryIds không được rỗng");
				}
				var ids = scope.inventoryIds().stream().distinct().toList();
				var rows = repo.findInventoryByIds(ids);
				if (rows.size() != ids.size()) {
					throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Một hoặc nhiều inventory_id không tồn tại",
							Map.of("inventoryIds", "Danh sách không khớp tồn kho"));
				}
				yield rows;
			}
			default -> throw new BusinessException(ApiErrorCode.BAD_REQUEST, "scope.mode không hợp lệ");
		};
	}

	@Transactional
	public AuditSessionDetailData patch(long id, AuditSessionPatchRequest req) {
		int sid = Math.toIntExact(id);
		if (req.title() == null && req.notes() == null && req.status() == null) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Cần ít nhất một trường để cập nhật");
		}
		SessionLockRow lock = repo.lockSession(sid).orElseThrow(() -> new BusinessException(ApiErrorCode.NOT_FOUND, "Không tìm thấy đợt kiểm kê"));
		String st = lock.status();
		if (ST_COMPLETED.equals(st) || ST_CANCELLED.equals(st)) {
			throw new BusinessException(ApiErrorCode.CONFLICT, "Không thể cập nhật đợt đã hoàn tất hoặc đã hủy");
		}
		if (req.status() != null && !ST_IN_PROGRESS.equals(req.status())) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Giá trị status không được hỗ trợ qua PATCH",
					Map.of("status", "Chỉ cho phép chuyển sang In Progress"));
		}
		if (req.status() != null && ST_IN_PROGRESS.equals(req.status())) {
			if (ST_PENDING.equals(st)) {
				if (repo.existsOtherInProgress(sid)) {
					throw new BusinessException(ApiErrorCode.CONFLICT, "Đã tồn tại đợt kiểm kê đang In Progress");
				}
				repo.updateSessionStatus(sid, ST_IN_PROGRESS);
			}
			else if (!ST_IN_PROGRESS.equals(st)) {
				throw new BusinessException(ApiErrorCode.CONFLICT, "Chuyển trạng thái không hợp lệ");
			}
		}
		if (req.title() != null) {
			String t = req.title().trim();
			if (t.isEmpty()) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, "title không được để trống");
			}
			if (req.notes() != null) {
				repo.updateSessionMeta(sid, t, true, req.notes());
			}
			else {
				repo.updateSessionMeta(sid, t, false, null);
			}
		}
		else if (req.notes() != null) {
			repo.updateSessionMeta(sid, null, true, req.notes());
		}
		return getById(id);
	}

	@Transactional
	public AuditSessionDetailData patchLines(long id, AuditLinesPatchRequest req) {
		int sid = Math.toIntExact(id);
		SessionLockRow lock = repo.lockSession(sid).orElseThrow(() -> new BusinessException(ApiErrorCode.NOT_FOUND, "Không tìm thấy đợt kiểm kê"));
		String st = lock.status();
		if (!ST_PENDING.equals(st) && !ST_IN_PROGRESS.equals(st)) {
			throw new BusinessException(ApiErrorCode.CONFLICT, "Chỉ được ghi số khi đợt ở trạng thái Pending hoặc In Progress");
		}
		var lines = req.lines();
		var seen = new HashSet<Long>();
		for (var row : lines) {
			if (!seen.add(row.lineId())) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, "lineId trùng trong cùng request",
						Map.of("lines", "Các lineId phải khác nhau"));
			}
		}
		for (var row : lines) {
			if (!repo.lineBelongsToSession(row.lineId(), sid)) {
				throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Dòng không thuộc đợt kiểm kê",
						Map.of("lineId", String.valueOf(row.lineId())));
			}
			boolean updateNotes = row.notes() != null;
			repo.updateLineCounted(row.lineId(), sid, row.actualQuantity(), row.notes(), updateNotes);
		}
		return getById(id);
	}

	@Transactional
	public AuditSessionDetailData complete(long id, AuditSessionCompleteRequest req, Jwt jwt) {
		int userId = StockReceiptAccessPolicy.parseUserId(jwt);
		int sid = Math.toIntExact(id);
		SessionLockRow lock = repo.lockSession(sid).orElseThrow(() -> new BusinessException(ApiErrorCode.NOT_FOUND, "Không tìm thấy đợt kiểm kê"));
		String st = lock.status();
		if (!ST_IN_PROGRESS.equals(st)) {
			throw new BusinessException(ApiErrorCode.CONFLICT, "Chỉ được hoàn tất khi đợt đang In Progress");
		}
		if (req.requireAllCountedOrDefault() && repo.countUncountedLines(sid) > 0) {
			throw new BusinessException(ApiErrorCode.CONFLICT, "Còn dòng chưa đếm (is_counted)");
		}
		repo.completeSession(sid, userId);
		return getById(id);
	}

	@Transactional
	public AuditSessionDetailData cancel(long id, AuditSessionCancelRequest req) {
		int sid = Math.toIntExact(id);
		SessionLockRow lock = repo.lockSession(sid).orElseThrow(() -> new BusinessException(ApiErrorCode.NOT_FOUND, "Không tìm thấy đợt kiểm kê"));
		String st = lock.status();
		if (!ST_PENDING.equals(st) && !ST_IN_PROGRESS.equals(st)) {
			throw new BusinessException(ApiErrorCode.CONFLICT, "Chỉ được hủy khi đợt Pending hoặc In Progress");
		}
		String reason = req != null ? req.reason() : null;
		repo.cancelSession(sid, reason);
		return getById(id);
	}

	@Transactional
	public AuditApplyVarianceData applyVariance(long id, AuditApplyVarianceRequest req, Jwt jwt) {
		int userId = StockReceiptAccessPolicy.parseUserId(jwt);
		int sid = Math.toIntExact(id);
		SessionLockRow lock = repo.lockSession(sid).orElseThrow(() -> new BusinessException(ApiErrorCode.NOT_FOUND, "Không tìm thấy đợt kiểm kê"));
		if (!ST_COMPLETED.equals(lock.status())) {
			throw new BusinessException(ApiErrorCode.CONFLICT, "Chỉ áp chênh lệch khi đợt đã Completed");
		}
		String mode = req.modeOrDefault();
		List<LineApplyRow> loaded = repo.loadLinesToApply(sid);
		List<LineApplyRow> withVar = loaded.stream()
				.filter(r -> r.actualQty().subtract(r.systemQty()).compareTo(BigDecimal.ZERO) != 0)
				.toList();
		if (withVar.isEmpty()) {
			return new AuditApplyVarianceData(sid, List.of());
		}
		List<LineApplyRow> pending = withVar.stream().filter(r -> r.varianceAppliedAt() == null).toList();
		if (pending.isEmpty()) {
			throw new BusinessException(ApiErrorCode.CONFLICT, "Đã áp chênh lệch cho đợt này");
		}
		List<AuditApplyVarianceLineResult> results = new ArrayList<>();
		for (LineApplyRow row : pending) {
			int invId = Math.toIntExact(row.inventoryId());
			int oldQty = repo.lockInventoryQuantity(invId)
					.orElseThrow(() -> new BusinessException(ApiErrorCode.CONFLICT, "Không khóa được dòng tồn kho"));
			int newQty = computeNewQuantity(oldQty, row, mode);
			if (newQty < 0) {
				throw new BusinessException(ApiErrorCode.CONFLICT, "Số lượng tồn sau điều chỉnh không được âm");
			}
			int delta = newQty - oldQty;
			if (delta == 0) {
				repo.setVarianceAppliedAt(row.lineId());
				results.add(new AuditApplyVarianceLineResult(row.lineId(), row.inventoryId(), 0, oldQty));
				continue;
			}
			repo.updateInventoryQuantity(invId, newQty);
			int baseUnitId = repo.findBaseUnitId(row.productId())
					.orElseThrow(() -> new BusinessException(ApiErrorCode.INTERNAL_SERVER_ERROR, "Thiếu đơn vị cơ sở cho sản phẩm"));
			String note = buildApplyReferenceNote(sid, row.lineId(), req.reason());
			repo.insertInventoryLog(row.productId(), delta, baseUnitId, userId, note);
			repo.setVarianceAppliedAt(row.lineId());
			results.add(new AuditApplyVarianceLineResult(row.lineId(), row.inventoryId(), delta, newQty));
		}
		return new AuditApplyVarianceData(sid, results);
	}

	private static int computeNewQuantity(int currentQty, LineApplyRow row, String mode) {
		int roundedActual = row.actualQty().setScale(0, RoundingMode.HALF_UP).intValue();
		int delta = row.actualQty().subtract(row.systemQty()).setScale(0, RoundingMode.HALF_UP).intValue();
		if ("set_actual".equals(mode)) {
			return roundedActual;
		}
		return currentQty + delta;
	}

	private static String buildApplyReferenceNote(int sessionId, long lineId, String reason) {
		String base = "auditSession=" + sessionId + ";line=" + lineId + ";" + Objects.toString(reason, "");
		if (base.length() <= REF_NOTE_MAX) {
			return base;
		}
		return base.substring(0, REF_NOTE_MAX);
	}
}
