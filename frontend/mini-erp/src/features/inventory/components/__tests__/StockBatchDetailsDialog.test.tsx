import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { StockBatchDetailsDialog } from "../StockBatchDetailsDialog"
import type { InventoryItem } from "../../../types"

const mockItem: InventoryItem = {
  id: 1,
  productId: 1,
  productName: "Sữa Ông Thọ Hộp Giấy",
  skuCode: "SP001",
  locationId: 1,
  warehouseCode: "WH01",
  shelfCode: "A1",
  quantity: 150,
  minQuantity: 50,
  unitName: "Hộp",
  costPrice: 25000,
  updatedAt: "2026-04-12T10:30:00Z",
  isLowStock: false,
  isExpiringSoon: false,
  totalValue: 3750000,
}

describe("StockBatchDetailsDialog", () => {
  it("renders correctly with expanded info", () => {
    render(
      <StockBatchDetailsDialog
        isOpen={true}
        onClose={() => {}}
        item={mockItem}
      />
    )

    // Check Header
    expect(screen.getByText("Sữa Ông Thọ Hộp Giấy")).toBeInTheDocument()
    
    // Check SKU/Barcode (appears multiple times)
    const skuElements = screen.getAllByText(/SP001/)
    expect(skuElements.length).toBeGreaterThanOrEqual(1)

    // Check Financial Info (New requirement)
    // formatCurrency typically formats 25000 as 25.000
    // We check for numbers as formatting might vary slightly (dots/commas/symbol)
    expect(screen.getByText(/25\.000/)).toBeInTheDocument()
    expect(screen.getByText(/3\.750\.000/)).toBeInTheDocument()

    // Check Inventory Status (New requirement)
    expect(screen.getByText("An toàn")).toBeInTheDocument()
    expect(screen.getByText(/Định mức: 50/)).toBeInTheDocument()
  })

  it("returns null when item is null", () => {
    const { container } = render(
      <StockBatchDetailsDialog
        isOpen={true}
        onClose={() => {}}
        item={null}
      />
    )
    expect(container.firstChild).toBeNull()
  })
})
