import { describe, it, expect } from "vitest"
import type { ProductDetailDto } from "@/features/product-management/api/productsApi"
import { catalogCostForReceiptUnit } from "./receiptFormProductCost"

describe("catalogCostForReceiptUnit", () => {
  it("uses unit currentCostPrice when present", () => {
    const d = {
      units: [
        {
          id: 1,
          unitName: "Chai",
          conversionRate: 1,
          isBaseUnit: true,
          currentCostPrice: 3000,
          currentSalePrice: 4000,
        },
      ],
    } as unknown as ProductDetailDto
    expect(catalogCostForReceiptUnit(d, 1)).toBe(3000)
  })

  it("derives from base × conversion when unit cost is zero", () => {
    const d = {
      units: [
        {
          id: 1,
          unitName: "Chai",
          conversionRate: 1,
          isBaseUnit: true,
          currentCostPrice: 2000,
          currentSalePrice: 2500,
        },
        {
          id: 2,
          unitName: "Thùng",
          conversionRate: 24,
          isBaseUnit: false,
          currentCostPrice: 0,
          currentSalePrice: 0,
        },
      ],
    } as unknown as ProductDetailDto
    expect(catalogCostForReceiptUnit(d, 2)).toBe(2000 * 24)
  })
})
