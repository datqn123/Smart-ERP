import { describe, it, expect } from "vitest"
import { countDispatchedItems, filterDispatches } from "../dispatchLogic"

describe("Dispatch Logic Helpers", () => {
  describe("countDispatchedItems", () => {
    it("should count correctly", () => {
      const items = [
        { isFullyDispatched: true },
        { isFullyDispatched: false },
        { isFullyDispatched: true },
      ]
      expect(countDispatchedItems(items)).toBe(2)
    })
  })

  describe("filterDispatches", () => {
    const mockData = [
      { dispatchCode: "DSP001", orderCode: "ORD001", customerName: "KH A", status: "Pending" },
      { dispatchCode: "DSP002", orderCode: "ORD002", customerName: "KH B", status: "Full" },
    ] as any

    it("should filter by search", () => {
      const filters = { search: "KH A", status: "all", dateFrom: "", dateTo: "" }
      const result = filterDispatches(mockData, filters)
      expect(result.length).toBe(1)
      expect(result[0].dispatchCode).toBe("DSP001")
    })

    it("should filter by status", () => {
      const filters = { search: "", status: "Full", dateFrom: "", dateTo: "" }
      const result = filterDispatches(mockData, filters)
      expect(result.length).toBe(1)
      expect(result[0].dispatchCode).toBe("DSP002")
    })
  })
})
