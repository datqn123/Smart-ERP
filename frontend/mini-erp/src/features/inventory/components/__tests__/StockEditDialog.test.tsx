import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { StockEditDialog } from "../StockEditDialog"
import type { InventoryItem } from "../../types"

const mockItems: InventoryItem[] = [
  {
    id: 1,
    productId: 101,
    skuCode: "SKU001",
    productName: "Sản phẩm 1",
    locationId: 5,
    warehouseCode: "WH1",
    shelfCode: "S1",
    minQuantity: 10,
    unitId: 2,
    unitName: "Gói",
    costPrice: 50000,
    batchNumber: "B001",
    expiryDate: "2026-12-31T00:00:00Z",
    quantity: 100,
    totalValue: 5000000,
    updatedAt: "2026-01-01T00:00:00Z",
    isLowStock: false,
    isExpiringSoon: false,
  },
]

describe("StockEditDialog", () => {
  const mockOnClose = vi.fn()
  const mockOnConfirm = vi.fn()

  it("should render all 8 headers correctly according to SRS", () => {
    render(
      <StockEditDialog 
        isOpen={true} 
        onClose={mockOnClose} 
        onConfirm={mockOnConfirm} 
        items={mockItems} 
      />
    )

    expect(screen.getByText("Mã SP")).toBeDefined()
    expect(screen.getByText("Tên sản phẩm")).toBeDefined()
    expect(screen.getByText("Vị trí kho")).toBeDefined()
    expect(screen.getByText("Định mức")).toBeDefined()
    expect(screen.getByText("Đơn vị tính")).toBeDefined()
    expect(screen.getByText("Giá vốn")).toBeDefined()
    expect(screen.getByText("Số lô")).toBeDefined()
    expect(screen.getByText("Hạn SD")).toBeDefined()
  })

  it("should call onConfirm with all updated fields", () => {
    render(
      <StockEditDialog 
        isOpen={true} 
        onClose={mockOnClose} 
        onConfirm={mockOnConfirm} 
        items={mockItems} 
      />
    )

    const locationInput = screen.getByLabelText("Mã vị trí kho")
    fireEvent.change(locationInput, { target: { value: "9" } })

    const minQtyInput = screen.getByDisplayValue("10")
    fireEvent.change(minQtyInput, { target: { value: "20" } })

    const unitIdInput = screen.getByLabelText("Mã đơn vị tính")
    fireEvent.change(unitIdInput, { target: { value: "7" } })

    const batchInput = screen.getByPlaceholderText("Số lô")
    fireEvent.change(batchInput, { target: { value: "B999" } })

    const dateInput = screen.getByDisplayValue("2026-12-31")
    fireEvent.change(dateInput, { target: { value: "2027-01-01" } })

    const saveButton = screen.getByText("Lưu thay đổi")
    fireEvent.click(saveButton)

    expect(mockOnConfirm).toHaveBeenCalledWith([
      expect.objectContaining({
        locationId: 9,
        minQuantity: 20,
        unitId: 7,
        batchNumber: "B999",
        expiryDate: "2027-01-01",
      }),
    ])
  })

  it("should close the dialog when 'Hủy' is clicked", () => {
    render(
      <StockEditDialog 
        isOpen={true} 
        onClose={mockOnClose} 
        onConfirm={mockOnConfirm} 
        items={mockItems} 
      />
    )

    const cancelButton = screen.getByText("Hủy")
    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
  })
})
