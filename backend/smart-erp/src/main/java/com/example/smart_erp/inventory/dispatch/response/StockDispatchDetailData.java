package com.example.smart_erp.inventory.dispatch.response;

import java.time.LocalDate;
import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record StockDispatchDetailData(@JsonProperty("id") long id, @JsonProperty("dispatchCode") String dispatchCode,
		@JsonProperty("orderCode") String orderCode, @JsonProperty("customerName") String customerName,
		@JsonProperty("dispatchDate") LocalDate dispatchDate, @JsonProperty("userId") int userId,
		@JsonProperty("userName") String userName, @JsonProperty("status") String status,
		@JsonProperty("notes") String notes, 		@JsonProperty("referenceLabel") String referenceLabel,
		@JsonProperty("manualDispatch") boolean manualDispatch,
		@JsonProperty("stockLinesFulfillment") boolean stockLinesFulfillment,
		@JsonProperty("shortageWarning") boolean shortageWarning,
		@JsonProperty("lines") List<StockDispatchDetailLineData> lines, @JsonProperty("canEdit") boolean canEdit,
		@JsonProperty("canDelete") boolean canDelete, @JsonProperty("deletedAt") Instant deletedAt,
		@JsonProperty("deletedByUserId") Integer deletedByUserId,
		@JsonProperty("deletedByUserName") String deletedByUserName, @JsonProperty("deleteReason") String deleteReason) {
}
