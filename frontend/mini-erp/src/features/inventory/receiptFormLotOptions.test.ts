import { describe, it, expect } from "vitest"
import type { InventoryListItemResponse } from "./api/inventoryApi"
import { buildReceiptLotOptions, findLotOptionValue } from "./receiptFormLotOptions"

function row(partial: Partial<InventoryListItemResponse>): InventoryListItemResponse {
  return {
    id: 1,
    productId: 1,
    productName: "P",
    skuCode: "S",
    barcode: null,
    locationId: 1,
    warehouseCode: "WH",
    shelfCode: "A",
    batchNumber: null,
    expiryDate: null,
    quantity: 1,
    minQuantity: 0,
    unitId: 1,
    unitName: "u",
    costPrice: 1,
    updatedAt: "2026-01-01T00:00:00Z",
    isLowStock: false,
    isExpiringSoon: false,
    totalValue: 1,
    ...partial,
  }
}

describe("buildReceiptLotOptions", () => {
  it("merges same batch+expiry across locations", () => {
    const opts = buildReceiptLotOptions([
      row({ id: 1, batchNumber: "B1", expiryDate: "2027-01-01", warehouseCode: "W1", shelfCode: "S1" }),
      row({ id: 2, batchNumber: "B1", expiryDate: "2027-01-01", warehouseCode: "W2", shelfCode: "S2" }),
    ])
    expect(opts).toHaveLength(1)
    expect(opts[0].batchNumber).toBe("B1")
    expect(opts[0].expiryDay).toBe("2027-01-01")
    expect(opts[0].label).toContain("W1-S1")
    expect(opts[0].label).toContain("W2-S2")
  })
})

describe("findLotOptionValue", () => {
  it("returns selectValue when batch and expiry match", () => {
    const opts = buildReceiptLotOptions([
      row({ batchNumber: "X", expiryDate: "2026-05-01T00:00:00Z" }),
    ])
    const v = findLotOptionValue("X", "2026-05-01", opts)
    expect(v).toBe(opts[0].selectValue)
  })
})
