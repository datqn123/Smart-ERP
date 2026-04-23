import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { StockEditDialog } from "../StockEditDialog"
import type { InventoryItem } from "../../types"

const mockItems: InventoryItem[] = [
  {
    id: 1,
    skuCode: "SKU001",
    productName: "Sản phẩm 1",
    warehouseCode: "WH1",
    shelfCode: "S1",
    minQuantity: 10,
    unitName: "Gói",
    costPrice: 50000,
    batchNumber: "B001",
    expiryDate: "2026-12-31T00:00:00Z",
    quantity: 100,
    totalValue: 5000000,
    isLowStock: false
  }
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
    expect(screen.getByText("Vị trí (Kho - Kệ)")).toBeDefined()
    expect(screen.getByText("Định mức")).toBeDefined()
    expect(screen.getByText("Đơn vị")).toBeDefined()
    expect(screen.getByText("Giá vốn (VNĐ)")).toBeDefined()
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

    // Helper function to change value and check
    const changeInput = (placeholder: string, value: string) => {
      const input = screen.getByPlaceholderText(placeholder)
      fireEvent.change(input, { target: { value } })
    }

    changeInput("Kho", "WH2")
    changeInput("Kệ", "S2")
    changeInput("Số lô", "B999")
    
    // Number/Date inputs (find by display value or type)
    const minQtyInput = screen.getByDisplayValue("10")
    fireEvent.change(minQtyInput, { target: { value: "20" } })

    const costInput = screen.getByDisplayValue("50000")
    fireEvent.change(costInput, { target: { value: "60000" } })

    const unitInput = screen.getByDisplayValue("Gói")
    fireEvent.change(unitInput, { target: { value: "Hộp" } })

    const dateInput = screen.getByDisplayValue("2026-12-31")
    fireEvent.change(dateInput, { target: { value: "2027-01-01" } })

    // Nhấn nút Lưu
    const saveButton = screen.getByText("Lưu thay đổi")
    fireEvent.click(saveButton)

    expect(mockOnConfirm).toHaveBeenCalledWith([
      expect.objectContaining({
        warehouseCode: "WH2",
        shelfCode: "S2",
        minQuantity: 20,
        unitName: "Hộp",
        costPrice: 60000,
        batchNumber: "B999",
        expiryDate: "2027-01-01"
      })
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
