import { describe, it, expect } from "vitest"
import { dispatchFormSchema } from "./dispatchFormSchema"

describe("dispatchFormSchema", () => {
  it("rejects empty line list", () => {
    expect(() =>
      dispatchFormSchema.parse({
        dispatchDate: "2026-01-15",
        items: [],
      }),
    ).toThrow()
  })

  it("accepts manual dispatch line with snapshot price", () => {
    const data = dispatchFormSchema.parse({
      dispatchDate: "2026-01-15",
      referenceLabel: "Khách A",
      notes: "Giao ngay",
      items: [
        {
          productId: 10,
          inventoryId: 99,
          dispatchQty: 2,
          unitPriceSnapshot: 15000,
          unitName: "cái",
          productLabel: "Sản phẩm X (SKU-1)",
        },
      ],
    })
    expect(data.items).toHaveLength(1)
    expect(data.items[0].unitPriceSnapshot).toBe(15000)
  })
})
