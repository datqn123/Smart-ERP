package com.example.smart_erp.inventory.dispatch;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

/**
 * Optional fields: null = không đổi. Dùng PATCH thủ công (JSON object).
 */
@SuppressWarnings("unused")
public final class StockDispatchPatchRequest {

	private LocalDate dispatchDate;
	@Size(max = 2000)
	private String notes;
	@Size(max = 255)
	private String referenceLabel;

	private String status;

	@Valid
	private List<StockDispatchLineRequest> lines;

	@JsonSetter(nulls = Nulls.SKIP)
	public void setDispatchDate(LocalDate dispatchDate) {
		this.dispatchDate = dispatchDate;
	}

	public LocalDate getDispatchDate() {
		return dispatchDate;
	}

	@JsonSetter(nulls = Nulls.SKIP)
	public void setNotes(String notes) {
		this.notes = notes;
	}

	public String getNotes() {
		return notes;
	}

	@JsonSetter(nulls = Nulls.SKIP)
	public void setReferenceLabel(String referenceLabel) {
		this.referenceLabel = referenceLabel;
	}

	public String getReferenceLabel() {
		return referenceLabel;
	}

	@JsonSetter(nulls = Nulls.SKIP)
	public void setStatus(String status) {
		this.status = status;
	}

	public String getStatus() {
		return status;
	}

	@JsonSetter(nulls = Nulls.SKIP)
	public void setLines(List<StockDispatchLineRequest> lines) {
		this.lines = lines;
	}

	public List<StockDispatchLineRequest> getLines() {
		return lines;
	}
}
