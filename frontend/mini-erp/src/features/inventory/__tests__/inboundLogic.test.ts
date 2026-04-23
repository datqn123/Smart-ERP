import { describe, it, expect } from "vitest"
import { calculateReceiptTotal, isExpiryValid } from "../inboundLogic"

describe("Inbound Logic Helpers", () => {
  describe("calculateReceiptTotal", () => {
    it("should calculate correctly with multiple items", () => {
      const details = [
        { quantity: 10, costPrice: 5000 },
        { quantity: 5, costPrice: 10000 },
      ]
      expect(calculateReceiptTotal(details)).toBe(100000)
    })

    it("should return 0 for empty list", () => {
      expect(calculateReceiptTotal([])).toBe(0)
    })
  })

  describe("isExpiryValid", () => {
    it("should return true if expiry is after receipt date", () => {
      expect(isExpiryValid("2026-01-01", "2026-12-31")).toBe(true)
    })

    it("should return true if expiry is same as receipt date", () => {
      expect(isExpiryValid("2026-01-01", "2026-01-01")).toBe(true)
    })

    it("should return false if expiry is before receipt date", () => {
      expect(isExpiryValid("2026-01-01", "2025-12-31")).toBe(false)
    })

    it("should return true if expiry is undefined", () => {
      expect(isExpiryValid("2026-01-01", undefined)).toBe(true)
    })
  })
})
