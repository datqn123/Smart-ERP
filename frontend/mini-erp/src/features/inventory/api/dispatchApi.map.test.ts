import { describe, it, expect } from "vitest"
import { mapStockDispatchListItemToUi, type StockDispatchListItemResponse } from "./dispatchApi"

describe("mapStockDispatchListItemToUi", () => {
  it("maps API row to StockDispatch with lineCount and empty items", () => {
    const row: StockDispatchListItemResponse = {
      id: 42,
      dispatchCode: "PX-2026-000042",
      orderCode: "—",
      customerName: "Khách A",
      dispatchDate: "2026-05-01",
      userName: "NV Test",
      itemCount: 3,
      status: "Full",
    }
    const ui = mapStockDispatchListItemToUi(row)
    expect(ui.id).toBe(42)
    expect(ui.dispatchCode).toBe("PX-2026-000042")
    expect(ui.lineCount).toBe(3)
    expect(ui.items).toEqual([])
    expect(ui.customerName).toBe("Khách A")
  })
})
