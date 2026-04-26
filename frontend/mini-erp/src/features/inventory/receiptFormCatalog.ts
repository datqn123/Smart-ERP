/**
 * Catalog tĩnh cho form phiếu nhập — map productId + unitId (đơn vị cơ sở) khớp seed Flyway V6
 * (`V6__task005_seed_demo_categories_products_inventory.sql`) khi bảng Products/ProductUnits
 * rỗng trước seed (id 1..8 lần lượt từng cặp SP–ĐVT cơ sở). Nếu DB khác, BE trả 400 — chọn NCC/SP có trong DB.
 */
export type ReceiptFormProductOption = {
  productId: number
  unitId: number
  name: string
  sku: string
  unitName: string
}

export const RECEIPT_FORM_PRODUCTS: ReceiptFormProductOption[] = [
  { productId: 1, unitId: 1, name: "Nước suối 500ml", sku: "DEMO-NUOC-500", unitName: "Chai" },
  { productId: 2, unitId: 2, name: "Mì gói hương vị gà", sku: "TP-MI-001", unitName: "Gói" },
  { productId: 3, unitId: 3, name: "Gạo tẻ 5kg", sku: "TP-GAO-5", unitName: "Túi" },
  { productId: 4, unitId: 4, name: "Bánh quy socola 137g", sku: "BK-OREO-1", unitName: "Hộp" },
  { productId: 5, unitId: 5, name: "Coca 330ml thùng 24", sku: "UONG-COKE-24", unitName: "Thùng" },
  { productId: 6, unitId: 6, name: "Nước rửa chén 1.5L", sku: "HPH-RC-1L5", unitName: "Chai" },
  { productId: 7, unitId: 7, name: "Sữa tươi tiệt trùng 1L", sku: "UONG-SUA-1L", unitName: "Hộp" },
  { productId: 8, unitId: 8, name: "Nước mắm 40°N 500ml", sku: "GV-NM-500", unitName: "Chai" },
]

export function catalogUnitForProduct(productId: number): number | undefined {
  return RECEIPT_FORM_PRODUCTS.find((p) => p.productId === productId)?.unitId
}
