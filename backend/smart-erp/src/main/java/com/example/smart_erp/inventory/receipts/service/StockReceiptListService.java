package com.example.smart_erp.inventory.receipts.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.smart_erp.inventory.receipts.query.StockReceiptListQuery;
import com.example.smart_erp.inventory.receipts.repository.StockReceiptListJdbcRepository;
import com.example.smart_erp.inventory.receipts.response.StockReceiptListItemData;
import com.example.smart_erp.inventory.receipts.response.StockReceiptListPageData;

/** Đọc danh sách phiếu nhập — Task013. */
@Service
public class StockReceiptListService {

	private final StockReceiptListJdbcRepository listRepo;

	public StockReceiptListService(StockReceiptListJdbcRepository listRepo) {
		this.listRepo = listRepo;
	}

	@Transactional(readOnly = true)
	public StockReceiptListPageData list(StockReceiptListQuery q) {
		long total = listRepo.countRows(q);
		List<StockReceiptListItemData> items = listRepo.loadPage(q);
		return new StockReceiptListPageData(items, q.page(), q.limit(), total);
	}
}
