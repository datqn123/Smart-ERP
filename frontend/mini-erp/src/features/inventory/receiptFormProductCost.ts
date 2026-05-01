import type { ProductDetailDto } from "@/features/product-management/api/productsApi"
import { parseProductDecimal } from "@/features/product-management/api/productsApi"

/**
 * Giá vốn catalog cho một đơn vị trên dòng phiếu nhập (Task036 `units[].currentCostPrice`;
 * fallback: giá ĐVT cơ sở × conversionRate khi giá đơn vị chưa có).
 */
export function catalogCostForReceiptUnit(detail: ProductDetailDto, unitId: number): number {
  const units = detail.units ?? []
  const u = units.find((x) => x.id === unitId)
  if (u != null) {
    const c = parseProductDecimal(u.currentCostPrice)
    if (c > 0) return c
  }
  const base = units.find((x) => x.isBaseUnit) ?? units[0]
  if (base == null) return 0
  const baseCost = parseProductDecimal(base.currentCostPrice)
  if (u == null || u.isBaseUnit) return baseCost
  const rate = parseProductDecimal(u.conversionRate)
  return baseCost * (rate > 0 ? rate : 1)
}
